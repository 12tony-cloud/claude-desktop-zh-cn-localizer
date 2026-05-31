# Claude Desktop 中文本地化与 MiMo 兼容工具

这是一个面向 Windows 的 Claude Desktop / Claude Code Cowork 中文本地化和 MiMo Token Plan 兼容工具。仓库只包含脚本，不分发 Claude Desktop 本体、`app.asar`、安装包、缓存、日志或任何账号凭据。

## 当前推荐模式

推荐使用“官方签名 Claude + 本地 MiMo 桥接”模式：

- 使用 Microsoft Store 安装的官方 `Claude.exe`，保留 Authenticode 签名。
- 启动本地 Anthropic 兼容桥接：`http://127.0.0.1:15721`。
- 将 Claude 官方模型名映射到 MiMo 模型。
- 普通文本请求使用 `mimo-v2.5-pro`。
- 检测到图片输入时自动切换到 `mimo-v2.5`，避免图片请求落到不支持图片的 Pro 模型。
- 避免改包版 `Claude.exe` 触发 Cowork VM 的 `signature verification failed` / `RPC pipe closed`。

运行：

```powershell
npm install
npm run check
.\start-claude-signed-mimo.cmd
```

Claude 的 3P 配置需要指向本地桥接：

```json
{
  "disableDeploymentModeChooser": true,
  "inferenceProvider": "gateway",
  "inferenceCredentialKind": "static",
  "inferenceGatewayBaseUrl": "http://127.0.0.1:15721",
  "inferenceGatewayApiKey": "REPLACE_WITH_YOUR_MIMO_TOKEN",
  "inferenceGatewayAuthScheme": "bearer",
  "modelDiscoveryEnabled": false,
  "inferenceModels": [
    {
      "name": "claude-sonnet-4-5",
      "labelOverride": "mimo-v2.5-pro",
      "supports1m": false
    },
    {
      "name": "claude-haiku-4-5-20251001",
      "labelOverride": "mimo-v2.5",
      "supports1m": false
    }
  ]
}
```

不要把真实 token 提交到仓库。

## 改包汉化模式

仓库仍保留 `scripts/build-claude-zh-cn.mjs`，用于在本机已有 Claude 安装基础上生成本地汉化副本：

```powershell
npm install
npm run build
```

可选环境变量：

```powershell
$env:CLAUDE_APP_DIR = "<Claude 安装目录>\app"
$env:CLAUDE_ZH_WORKDIR = "<构建输出目录>"
npm run build
```

重要限制：修改 `app.asar` 后再修补 `Claude.exe` 的 asar integrity 会破坏官方 Authenticode 签名。新版 Cowork VM 服务会校验连接进程签名，因此改包版可能无法启动工作区，日志中会出现 `client executable is not signed` 和 `RPC pipe closed`。需要工作区、协作模式或 VM 功能时，请使用上面的官方签名启动模式。

## 包含内容

- `start-claude-signed-mimo.cmd`：启动官方签名版 Claude 和本地桥接。
- `start-claude-zh-CN.ps1`：Windows PowerShell 启动脚本，会自动定位官方 Store 版 Claude。
- `mimo-anthropic-bridge.cjs`：Anthropic Messages API 到 MiMo OpenAI 兼容接口的本地桥接。
- `scripts/build-claude-zh-cn.mjs`：本地改包汉化构建器。

## 不包含内容

- 不包含 Claude Desktop 原始程序、二进制文件或 `app.asar`。
- 不包含 API key、OAuth token、GitHub token、MiMo Token Plan token 或任何用户私有配置。
- 不包含本地日志、截图、会话记录、缓存、IndexedDB、Cookie 或个人路径。

## 安全复核

提交前建议扫描：

```powershell
rg -n "tp-[A-Za-z0-9]+|sk-[A-Za-z0-9]+|AUTH_TOKEN|API_KEY|secret|password|provider credential" .
```

如果你把自己的配置文件、日志或构建产物复制到仓库中，必须在提交前删除。

## 许可

本仓库中的脚本按 MIT 许可证发布。Claude Desktop 本体及其资源属于各自权利方，本仓库不授予也不分发相关程序资源。
