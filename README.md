# Claude Desktop 中文本地化补丁构建器

这是一个面向 Windows 的 Claude Desktop / Claude Code Cowork 界面中文本地化构建器。它不会分发 Claude Desktop 本体、`app.asar`、安装包、缓存、日志或任何账号凭据；脚本只在本机已有 Claude 安装上生成一个本地补丁版副本。

## 功能

- 将 Claude Desktop / Claude Code Cowork 主要界面文本切换为简体中文。
- 补充设置页、协作模式、错误弹窗、按钮、菜单和动态时间文本的中文显示。
- 禁用 Claude 内部生成的 `[1m]` 模型别名，避免第三方 Anthropic 兼容端点出现 `model_not_found`。
- 对 MiMo Token Plan 场景做兼容：纯文本可继续使用 `mimo-v2.5-pro`，带图片的本地会话会自动路由到 `mimo-v2.5`。
- 启动脚本会尝试启动 `CoworkVMService`，减少工作区 VM 服务未运行导致的启动失败。

## 不包含的内容

- 不包含 Claude Desktop 原始程序、二进制文件或 `app.asar`。
- 不包含 API key、OAuth token、GitHub token、MiMo Token Plan token 或任何用户私有配置。
- 不包含本地日志、截图、会话记录、缓存、IndexedDB、Cookie 或个人路径。

## 使用方式

需要先在 Windows 上安装 Claude Desktop，并安装 Node.js 22.12 或更高版本。

```powershell
npm install
npm run build
```

构建完成后会生成：

- `dist/Claude-zh-CN-app/`
- `start-claude-zh-CN.cmd`

如果脚本无法自动找到 Claude 安装目录，可以显式指定：

```powershell
$env:CLAUDE_APP_DIR = "<Claude 安装目录>\app"
npm run build
```

也可以指定构建输出工作目录：

```powershell
$env:CLAUDE_ZH_WORKDIR = "<构建输出目录>"
npm run build
```

## MiMo 图片输入说明

MiMo Token Plan 的 Anthropic 兼容接口中，`mimo-v2.5-pro` 适合文本/代码场景；图片输入需要使用支持视觉的模型，例如 `mimo-v2.5`。本补丁会在本地会话检测到图片输入时，将 `mimo-v2.5-pro` 自动切换为 `mimo-v2.5`，避免图片请求落到不支持图片的 Pro 端点。

## 安全说明

公开仓库只保留可复现的补丁构建逻辑。运行前仍建议自行扫描：

```powershell
rg -n "AUTH_TOKEN|API_KEY|secret|password|ANTHROPIC|provider credential" .
```

如果你把自己的配置文件、日志或构建产物复制到仓库中，必须在提交前删除。

## 许可

本仓库中的补丁脚本按 MIT 许可证发布。Claude Desktop 本体及其资源属于各自权利方，本仓库不授予也不分发相关程序资源。
