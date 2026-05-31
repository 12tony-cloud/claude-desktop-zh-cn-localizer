#!/usr/bin/env node
"use strict";

const http = require("http");
const crypto = require("crypto");

const HOST = process.env.MIMO_BRIDGE_HOST || "127.0.0.1";
const PORT = Number(process.env.MIMO_BRIDGE_PORT || 15721);
const MIMO_BASE_URL = (process.env.MIMO_BASE_URL || "https://token-plan-cn.xiaomimimo.com/v1").replace(/\/+$/, "");

const ROUTE_TO_MIMO = {
  "claude-sonnet-4-5": "mimo-v2.5-pro",
  "claude-haiku-4-5-20251001": "mimo-v2.5",
};

function id(prefix) {
  return `${prefix}_${crypto.randomBytes(12).toString("hex")}`;
}

function now() {
  return Math.floor(Date.now() / 1000);
}

function log(message) {
  process.stdout.write(`[${new Date().toISOString()}] ${message}\n`);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function sendJson(res, status, body) {
  const payload = Buffer.from(JSON.stringify(body), "utf8");
  res.writeHead(status, {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type, authorization, x-api-key, anthropic-version, anthropic-beta",
    "content-type": "application/json; charset=utf-8",
    "content-length": String(payload.length),
  });
  res.end(payload);
}

function sendAnthropicError(res, status, message, type = "api_error") {
  sendJson(res, status, {
    type: "error",
    error: { type, message },
  });
}

function authToken(req) {
  const authorization = req.headers.authorization || "";
  if (authorization.toLowerCase().startsWith("bearer ")) return authorization.slice(7).trim();
  if (req.headers["x-api-key"]) return String(req.headers["x-api-key"]).trim();
  return process.env.MIMO_API_KEY || "";
}

function textFromAnthropicContent(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return content == null ? "" : String(content);
  return content
    .map((part) => {
      if (!part || typeof part !== "object") return String(part ?? "");
      if (part.type === "text") return part.text || "";
      if (part.type === "tool_result") {
        const c = part.content;
        return typeof c === "string" ? c : textFromAnthropicContent(c);
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

function hasImages(req) {
  return (req.messages || []).some((message) => {
    const content = message && message.content;
    return Array.isArray(content) && content.some((part) => part && part.type === "image");
  });
}

function convertUserContent(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return String(content ?? "");
  const out = [];
  for (const part of content) {
    if (!part || typeof part !== "object") continue;
    if (part.type === "text" && part.text) {
      out.push({ type: "text", text: part.text });
    } else if (part.type === "image" && part.source) {
      const source = part.source;
      if (source.type === "base64" && source.data) {
        const mediaType = source.media_type || "image/png";
        out.push({ type: "image_url", image_url: { url: `data:${mediaType};base64,${source.data}` } });
      } else if (source.type === "url" && source.url) {
        out.push({ type: "image_url", image_url: { url: source.url } });
      }
    }
  }
  return out.length ? out : textFromAnthropicContent(content);
}

function convertMessages(req) {
  const messages = [];
  if (req.system) {
    messages.push({ role: "system", content: textFromAnthropicContent(req.system) });
  }

  for (const message of req.messages || []) {
    const role = message.role || "user";
    const content = message.content;

    if (role === "assistant" && Array.isArray(content)) {
      const toolCalls = [];
      const textParts = [];
      for (const part of content) {
        if (!part || typeof part !== "object") continue;
        if (part.type === "text" && part.text) textParts.push(part.text);
        if (part.type === "tool_use") {
          toolCalls.push({
            id: part.id || id("toolu"),
            type: "function",
            function: {
              name: part.name || "",
              arguments: JSON.stringify(part.input || {}),
            },
          });
        }
      }
      const next = { role: "assistant", content: textParts.join("\n") || null };
      if (toolCalls.length) next.tool_calls = toolCalls;
      messages.push(next);
      continue;
    }

    if (role === "user" && Array.isArray(content)) {
      const normal = [];
      for (const part of content) {
        if (part && part.type === "tool_result") {
          messages.push({
            role: "tool",
            tool_call_id: part.tool_use_id || id("toolu"),
            content: textFromAnthropicContent(part.content),
          });
        } else {
          normal.push(part);
        }
      }
      if (normal.length) messages.push({ role: "user", content: convertUserContent(normal) });
      continue;
    }

    messages.push({ role, content: role === "user" ? convertUserContent(content) : textFromAnthropicContent(content) });
  }
  return messages.length ? messages : [{ role: "user", content: "Hello" }];
}

function convertTools(tools) {
  if (!Array.isArray(tools)) return undefined;
  return tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description || "",
      parameters: tool.input_schema || tool.parameters || {},
    },
  }));
}

function convertToolChoice(choice) {
  if (!choice) return undefined;
  if (choice.type === "auto") return "auto";
  if (choice.type === "any") return "required";
  if (choice.type === "tool" && choice.name) {
    return { type: "function", function: { name: choice.name } };
  }
  return undefined;
}

function toOpenAIRequest(req) {
  const requestedModel = String(req.model || "claude-sonnet-4-5");
  const model = hasImages(req) ? "mimo-v2.5" : (ROUTE_TO_MIMO[requestedModel] || "mimo-v2.5-pro");
  const out = {
    model,
    messages: convertMessages(req),
    stream: false,
    max_tokens: req.max_tokens || req.max_output_tokens || 4096,
  };
  for (const key of ["temperature", "top_p", "stop", "presence_penalty", "frequency_penalty", "seed"]) {
    if (req[key] !== undefined) out[key] = req[key];
  }
  const tools = convertTools(req.tools);
  if (tools && tools.length) out.tools = tools;
  const toolChoice = convertToolChoice(req.tool_choice);
  if (toolChoice) out.tool_choice = toolChoice;
  return out;
}

async function callMimo(openaiReq, token) {
  const response = await fetch(`${MIMO_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(openaiReq),
  });
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text };
  }
  if (!response.ok) {
    const detail = typeof body?.error === "string" ? body.error : body?.error?.message || text;
    const error = new Error(detail || `MiMo HTTP ${response.status}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

function normalizeToolCalls(message) {
  return (message.tool_calls || []).map((toolCall) => {
    const fn = toolCall.function || {};
    let input = {};
    if (fn.arguments) {
      try {
        input = JSON.parse(fn.arguments);
      } catch {
        input = { _raw: fn.arguments };
      }
    }
    return {
      type: "tool_use",
      id: toolCall.id || id("toolu"),
      name: fn.name || "",
      input,
    };
  });
}

function toAnthropicMessage(openaiBody, requestedModel) {
  const choice = openaiBody.choices?.[0] || {};
  const msg = choice.message || {};
  const content = [];
  if (msg.content) content.push({ type: "text", text: String(msg.content) });
  content.push(...normalizeToolCalls(msg));
  const toolCalls = content.some((part) => part.type === "tool_use");
  return {
    id: id("msg"),
    type: "message",
    role: "assistant",
    model: requestedModel,
    content,
    stop_reason: toolCalls ? "tool_use" : "end_turn",
    stop_sequence: null,
    usage: {
      input_tokens: openaiBody.usage?.prompt_tokens || 0,
      output_tokens: openaiBody.usage?.completion_tokens || 0,
    },
  };
}

function sse(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function sendAnthropicStream(res, message) {
  res.writeHead(200, {
    "access-control-allow-origin": "*",
    "cache-control": "no-cache",
    connection: "keep-alive",
    "content-type": "text/event-stream; charset=utf-8",
  });

  sse(res, "message_start", {
    type: "message_start",
    message: { ...message, content: [], stop_reason: null, usage: { input_tokens: message.usage.input_tokens, output_tokens: 0 } },
  });

  message.content.forEach((block, index) => {
    if (block.type === "text") {
      sse(res, "content_block_start", {
        type: "content_block_start",
        index,
        content_block: { type: "text", text: "" },
      });
      if (block.text) {
        sse(res, "content_block_delta", {
          type: "content_block_delta",
          index,
          delta: { type: "text_delta", text: block.text },
        });
      }
      sse(res, "content_block_stop", { type: "content_block_stop", index });
      return;
    }

    if (block.type === "tool_use") {
      sse(res, "content_block_start", {
        type: "content_block_start",
        index,
        content_block: { type: "tool_use", id: block.id, name: block.name, input: {} },
      });
      const partial = JSON.stringify(block.input || {});
      if (partial) {
        sse(res, "content_block_delta", {
          type: "content_block_delta",
          index,
          delta: { type: "input_json_delta", partial_json: partial },
        });
      }
      sse(res, "content_block_stop", { type: "content_block_stop", index });
    }
  });

  sse(res, "message_delta", {
    type: "message_delta",
    delta: { stop_reason: message.stop_reason, stop_sequence: null },
    usage: { output_tokens: message.usage.output_tokens },
  });
  sse(res, "message_stop", { type: "message_stop" });
  res.end();
}

async function handleMessages(req, res) {
  const token = authToken(req);
  if (!token) {
    sendAnthropicError(res, 401, "缺少 MiMo API token", "authentication_error");
    return;
  }

  let body;
  try {
    body = JSON.parse(await readBody(req) || "{}");
  } catch {
    sendAnthropicError(res, 400, "请求 JSON 无效", "invalid_request_error");
    return;
  }

  const requestedModel = String(body.model || "claude-sonnet-4-5");
  const openaiReq = toOpenAIRequest(body);
  log(`messages ${requestedModel} -> ${openaiReq.model} stream=${!!body.stream}`);

  try {
    const openaiBody = await callMimo(openaiReq, token);
    const message = toAnthropicMessage(openaiBody, requestedModel);
    if (body.stream) sendAnthropicStream(res, message);
    else sendJson(res, 200, message);
  } catch (error) {
    const status = error.status || 502;
    const message = String(error.message || error).slice(0, 1000);
    log(`mimo error ${status}: ${message.slice(0, 180)}`);
    sendAnthropicError(res, status, message, status === 401 || status === 403 ? "authentication_error" : "api_error");
  }
}

function handleModels(_req, res) {
  sendJson(res, 200, {
    object: "list",
    data: [
      { id: "claude-sonnet-4-5", type: "model", display_name: "mimo-v2.5-pro" },
      { id: "claude-haiku-4-5-20251001", type: "model", display_name: "mimo-v2.5" },
    ],
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || `${HOST}:${PORT}`}`);
  if (req.method === "OPTIONS") {
    sendJson(res, 200, {});
    return;
  }
  if (req.method === "GET" && url.pathname === "/v1/models") {
    handleModels(req, res);
    return;
  }
  if (req.method === "POST" && url.pathname === "/v1/messages") {
    handleMessages(req, res);
    return;
  }
  sendAnthropicError(res, 404, `未找到接口: ${url.pathname}`, "not_found_error");
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    log(`port ${PORT} already in use; assuming an existing bridge is running`);
    process.exit(0);
  }
  throw error;
});

server.listen(PORT, HOST, () => {
  log(`MiMo Anthropic bridge listening on http://${HOST}:${PORT}`);
});
