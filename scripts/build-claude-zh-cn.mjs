import fs from "node:fs";
import path from "node:path";
import * as asar from "@electron/asar";

const root = path.resolve(process.env.CLAUDE_ZH_WORKDIR || process.cwd());
const sourceApp = process.env.CLAUDE_APP_DIR || findClaudeAppDir();
const extracted = path.join(root, ".work", "claude-app-asar");
const portable = path.join(root, "dist", "Claude-zh-CN-app");
const cachePath = path.join(root, "translation-cache.json");

function findClaudeAppDir() {
  const candidates = [];
  const programFiles = process.env.ProgramFiles || "C:/Program Files";
  const localAppData = process.env.LOCALAPPDATA || "";

  candidates.push(path.join(localAppData, "Programs", "Claude", "app"));
  candidates.push(path.join(programFiles, "Claude", "app"));

  const windowsApps = path.join(programFiles, "WindowsApps");
  try {
    const appDirs = fs.readdirSync(windowsApps, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && /^Claude_.*__/.test(entry.name))
      .map((entry) => path.join(windowsApps, entry.name, "app"))
      .sort()
      .reverse();
    candidates.push(...appDirs);
  } catch {
    // WindowsApps is often access-controlled. Users can set CLAUDE_APP_DIR.
  }

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(path.join(candidate, "resources", "app.asar"))) {
      return candidate;
    }
  }

  throw new Error(
    "Claude app not found. Set CLAUDE_APP_DIR to the folder that contains resources/app.asar."
  );
}

const manual = new Map(Object.entries({
  "Actual Size": "实际大小",
  "Copy": "复制",
  "Create": "创建",
  "Cancel": "取消",
  "Open": "打开",
  "Window": "窗口",
  "Debug": "调试",
  "Spend · {used}": "消耗 · {used}",
  "Hardware Buddy & Maker Devices": "硬件伙伴和创客设备",
  "Submit Feedback - Claude": "提交反馈 - Claude",
  "Open Link in Browser": "在浏览器中打开链接",
  "Redo": "重做",
  "Checking for Updates...": "正在检查更新...",
  "Cut": "剪切",
  "Not now": "暂不",
  "Troubleshooting": "故障排查",
  "Choose Data Folder": "选择数据文件夹",
  "About...": "关于...",
  "Plan usage": "套餐用量",
  "Usage image copied to clipboard": "用量图片已复制到剪贴板",
  "Install": "安装",
  "Exit": "退出",
  "Preview": "预览",
  "Select All": "全选",
  "Connected": "已连接",
  "USB": "USB",
  "Version {version}": "版本 {version}",
  "{kb}KB": "{kb}KB",
  "Claude Help": "Claude 帮助",
  "Could not load app settings": "无法加载应用设置",
  "Show App": "显示应用",
  "No buddy paired": "未配对伙伴",
  "Usage: {pct}": "用量：{pct}",
  "Name saved": "名称已保存",
  "File": "文件",
  "{tier} plan": "{tier} 套餐",
  "{s}s": "{s} 秒",
  "Open File…": "打开文件…",
  "Close": "关闭",
  "Restart Now": "立即重启",
  "Close Window": "关闭窗口",
  "Charging": "正在充电",
  "Do not attach logs": "不附加日志",
  "System": "系统",
  "Paste": "粘贴",
  "preview": "预览",
  "Save": "保存",
  "Inspect Element": "检查元素",
  "Network (UNC) paths are not supported here.": "这里不支持网络（UNC）路径。",
  "View": "视图",
  "Record Net Log (30s)": "记录网络日志（30 秒）",
  "from your organization": "来自你的组织",
  "Attach logs": "附加日志",
  "Open link in another app?": "在其他应用中打开链接？",
  "Find": "查找",
  "Settings…": "设置…",
  "Level": "级别",
  "Disable Hardware Acceleration": "禁用硬件加速",
  "Forward": "前进",
  "View Process Logs": "查看进程日志",
  "Don't Enable": "不启用",
  "You are running the latest version.": "你正在运行最新版本。",
  "Enable Cowork SDK Debugging": "启用协作 SDK 调试",
  "Extensions": "扩展",
  "Couldn't open that folder. Check the path and try again.": "无法打开该文件夹。请检查路径后重试。",
  "Skill file not found": "未找到技能文件",
  "Heap": "堆",
  "5-hour limit": "5 小时限制",
  "Show Dev Tools": "显示开发者工具",
  "Computer use": "计算机使用",
  "Connected · Encrypted": "已连接 · 已加密",
  "What is this?": "这是什么？",
  "What can I help you with today?": "今天我能帮你做什么？",
  "Install Unpacked Extension...": "安装未打包的扩展...",
  "Show All Dev Tools": "显示所有开发者工具",
  "Cut": "剪切",
  "Uploading…": "正在上传…",
  "Spend · {used} of {limit}": "消耗 · {used} / {limit}",
  "Choose": "选择",
  "Set up computer use": "设置计算机使用",
  "Show Logs in Explorer": "在资源管理器中显示日志",
  "Connection is unencrypted": "连接未加密",
  "Look Up": "查询",
  "Build your own device": "构建你自己的设备",
  "The application must be restarted for this change to take effect.": "必须重启应用，此更改才会生效。",
  "Name": "名称",
  "Skip This Update": "跳过此更新",
  "Change…": "更改…",
  "Add to dictionary": "添加到词典",
  "Pair": "配对",
  "OK": "确定",
  "Copy link": "复制链接",
  "Choose your Buddy": "选择你的伙伴",
  "No Update Available": "没有可用更新",
  "Zoom Out": "缩小",
  "Undo": "撤销",
  "Get support": "获取支持",
  "Reinstall": "重新安装",
  "Open Hardware Buddy…": "打开硬件伙伴…",
  "Select extension": "选择扩展",
  "Later": "稍后",
  "{pct} · resets {date}": "{pct} · {date} 重置",
  "Zoom In": "放大",
  "Settings...": "设置...",
  "Clear Cache and Restart": "清除缓存并重启",
  "Uptime": "运行时间",
  "Error": "错误",
  "Progress": "进度",
  "Show Main Window": "显示主窗口",
  "Device did not respond": "设备没有响应",
  "Install Extension?": "安装扩展？",
  "New Conversation": "新建对话",
  "Tap to pair:": "点按以配对：",
  "Not Now": "暂不",
  "Quit": "退出",
  "{pct}%": "{pct}%",
  "Previous match": "上一个匹配项",
  "Restart Required": "需要重启",
  "Pro": "Pro",
  "Reset Application Data": "重置应用数据",
  "Availability": "可用性",
  "Updates disabled by admin": "更新已被管理员禁用",
  "Zoom In (indie cooler version)": "放大（独立酷炫版）",
  "Settings Reset": "设置已重置",
  "Select Extension Folder": "选择扩展文件夹",
  "Allowed locations: {roots}": "允许的位置：{roots}",
  "Unlimited": "无限制",
  "Install Extension...": "安装扩展...",
  "Restart to update to {updateVersion}": "重启以更新到 {updateVersion}",
  "About Claude": "关于 Claude",
  "Cache cleared successfully": "缓存已成功清除",
  "Velocity": "速度",
  "Refresh": "刷新",
  "Quit anyway": "仍然退出",
  "Open Documentation": "打开文档",
  "Max": "最大",
  "Load Local Claude.ai": "加载本地 Claude.ai",
  "Reset": "重置",
  "Prototypes": "原型",
  "Claude is still working": "Claude 仍在工作",
  "Copy URL": "复制 URL",
  "Reset complete": "重置完成",
  "Pairing code": "配对码",
  "Error deleting VM sessions": "删除 VM 会话时出错",
  "Next match": "下一个匹配项",
  "Reload": "重新加载",
  "Copy Image Address": "复制图片地址",
  "Copied version to clipboard": "版本号已复制到剪贴板",
  "Last update attempt failed...": "上次更新尝试失败...",
  "Submit Feedback": "提交反馈",
  "No response": "无响应",
  "Check for Updates…": "检查更新…",
  "Learn more": "了解更多",
  "Copy Link Address": "复制链接地址",
  "Open Settings": "打开设置",
  "Install Claude in Chrome": "在 Chrome 中安装 Claude",
  "Could not load developer settings": "无法加载开发者设置",
  "Open Extension Settings Folder...": "打开扩展设置文件夹...",
  "Battery": "电池",
  "Disconnected": "已断开连接",
  "Reference implementation": "参考实现",
  "Fix ownership": "修复所有权",
  "Open Chrome Web Store": "打开 Chrome 网上应用店",
  "Help": "帮助",
  "Install Update": "安装更新",
  "Unknown error": "未知错误",
  "Folder access disabled": "文件夹访问已禁用",
  "Downloading Update...": "正在下载更新...",
  "MCP Configuration Reload Failed": "MCP 配置重新加载失败",
  "{pct} · resets {when}": "{pct} · {when} 重置",
  "Don't ask again": "不再询问",
  "Cannot open skill": "无法打开技能",
  "Connect": "连接",
  "Open MCP Log File": "打开 MCP 日志文件",
  "Could not open the specified folder.": "无法打开指定文件夹。",
  "Plan usage · {tier}": "套餐用量 · {tier}",
  "Copy Image": "复制图片",
  "Send to Device": "发送到设备",
  "Error Opening Folder": "打开文件夹时出错",
  "Find in page": "在页面中查找",
  "Code": "代码",
  "Dismiss": "关闭",
  "Fix required for auto-updates": "自动更新需要修复",
  "Error deleting VM bundle": "删除 VM 包时出错",
  "Free": "免费",
  "Close find bar": "关闭查找栏",
  "Caps Lock": "大写锁定",
  "Enable": "启用",
  "Get Support": "获取支持",
  "Skip": "跳过",
  "Reload MCP Configuration": "重新加载 MCP 配置",
  "Enable Developer Mode": "启用开发者模式",
  "Copy Installation ID": "复制安装 ID",
  "{product} grant": "{product} 授权",
  "None found. Make sure yours is on and nearby.": "未找到。请确认你的设备已开启并在附近。",
  "Approved": "已批准",
  "Open email link?": "打开邮件链接？",
  "Enable Developer Mode?": "启用开发者模式？",
  "Open Chrome": "打开 Chrome",
  "Reset App Data…": "重置应用数据…",
  "Update Available": "有可用更新",
  "App Features": "应用功能",
  "Restart": "重启",
  "Open": "打开",

  "Connect maker devices to Claude": "将创客设备连接到 Claude",
  "You are not logged in. Please log in to access the extensions directory.": "你尚未登录。请登录后访问扩展目录。",
  "Claude for macOS and Windows can connect Claude Cowork and Claude Code to maker devices over BLE, so developers can build hardware that displays permission prompts, recent messages, and other interactions.": "macOS 和 Windows 版 Claude 可以通过 BLE 将 Claude 协作和 Claude Code 连接到创客设备，开发者可以构建显示权限提示、最近消息和其他交互的硬件。",
  "Scanning for 5s…": "正在扫描 5 秒…",
  "Allow Claude to control {apps}?": "允许 Claude 控制 {apps}？",
  "Forget": "忘记",
  "Edit": "编辑",
  "Team": "团队",
  "A new version is available. It will be downloaded and installed automatically.": "有新版本可用。将自动下载并安装。",
  "Another copy of Claude is already running": "另一个 Claude 实例已经在运行",
  "The ownership fix didn't complete. Auto-updates may not work until this is resolved. You can try again next time.": "所有权修复未完成。在解决前，自动更新可能无法正常工作。你可以下次再试。",
  "Choose Claude data folder": "选择 Claude 数据文件夹",
  "Ownership fix failed": "所有权修复失败",
  "Trust {cwd} and start a code session?": "信任 {cwd} 并启动代码会话？",
  "Developer": "开发者",
  "Load Remote Claude.ai": "加载远程 Claude.ai",
  "The Chrome extension's session expired. Open the Claude extension in Chrome and sign in again, then retry.": "Chrome 扩展的会话已过期。请在 Chrome 中打开 Claude 扩展并重新登录，然后重试。",
  "Failed to preview extension": "预览扩展失败",
  "Extension installation failed": "扩展安装失败",
  "The extension could not be previewed due to the following error. Please ensure the DXT file is valid and try again. {errorMessage}": "由于以下错误，无法预览扩展。请确保 DXT 文件有效，然后重试。{errorMessage}",
  "This feature requires macOS 13.0 or higher": "此功能需要 macOS 13.0 或更高版本",
  "Reinstall workspace": "重新安装工作区",
  "Delete Cowork VM Sessions and Restart…": "删除协作 VM 会话并重启…",
  "Delete VM Sessions and Restart": "删除 VM 会话并重启",
  "This device requested an unencrypted connection. Data is being sent unencrypted, meaning that other devices close by can easily listen in.": "此设备请求未加密连接。数据将以未加密方式发送，附近其他设备可能轻易监听。",
  "Install and restart Chrome": "安装并重启 Chrome",
  "Failed to reload MCP configuration. Please check the logs for more details.": "重新加载 MCP 配置失败。请查看日志了解更多详情。",
  "Delete and Restart": "删除并重启",
  "Choose a folder inside: {roots}": "请选择 {roots} 内的文件夹",
  "This extension requires a valid signature": "此扩展需要有效签名",
  "Check your network connection": "请检查你的网络连接",
  "Wait for Claude": "等待 Claude",
  "This will open {appName} to compose a message to {email}.": "这将打开 {appName} 来撰写发送给 {email} 的消息。",
  "Cowork requires Windows 10 build 2004 or later. Update your operating system to use this feature.": "协作需要 Windows 10 2004 或更高版本。请更新操作系统以使用此功能。",
  "Enable Cowork VM Debug Logging": "启用协作 VM 调试日志",
  "Some folders were skipped": "部分文件夹已跳过",
  "Move to Applications folder?": "移动到 Applications 文件夹？",
  "Learn Spelling": "学习拼写",
  "{skipped, plural, one {# folder was} other {# folders were}} skipped because it overlaps a protected location or is the home/root directory.": "{skipped, plural, one {# 个文件夹已} other {# 个文件夹已}}跳过，因为它与受保护的位置或主目录/根目录重叠。",
  "Extension preview failed": "扩展预览失败",
  "{extensionDetails} These extensions will remain installed and can be re-enabled if you switch to an organization where they are allowed. You can also delete them from Settings.": "{extensionDetails} 这些扩展会继续保留安装。如果你切换到允许它们的组织，可以重新启用。你也可以在设置中删除它们。",
  "Failed to check for updates: {error}": "检查更新失败：{error}",
  "Error accessing logs": "访问日志时出错",
  "Configure Third-Party Inference…": "配置第三方推理…",
  "Link couldn't be opened": "无法打开链接",
  "Skip feedback and reinstall": "跳过反馈并重新安装",
  "Do you want to install {extensionName}?": "要安装 {extensionName} 吗？",
  "Login to Claude in Chrome": "在 Chrome 中登录 Claude",
  "Tap to open": "点按打开",
  "Claude needs microphone permission": "Claude 需要麦克风权限",
  "Weekly · all models": "每周 · 所有模型",
  "Cowork requires virtualization. Your Mac does not support virtualization. If you are currently running macOS inside a virtual machine (like Parallels), you might need to enable a feature called 'nested virtualization'.": "协作需要虚拟化。你的 Mac 不支持虚拟化。如果你正在虚拟机（如 Parallels）中运行 macOS，可能需要启用“嵌套虚拟化”。",
  "The following extensions have been disabled because they are not allowed in your current organization:": "以下扩展已禁用，因为当前组织不允许使用：",
  "Your administrator has disabled adding folders. Contact your IT administrator if you need access.": "管理员已禁用添加文件夹。如需访问，请联系 IT 管理员。",
  "Open Extensions Folder...": "打开扩展文件夹...",
  "Show Logs in Finder": "在 Finder 中显示日志",
  "Make sure you are signed in to Claude in Chrome with the same account as Claude Desktop.": "请确认你在 Chrome 中使用与 Claude Desktop 相同的账号登录 Claude。",
  "Pair with {name}": "与 {name} 配对",
  "Show Cowork Session Data in File Manager": "在文件管理器中显示协作会话数据",
  "Cowork requires Claude Desktop be installed with our modern installer": "协作要求使用新版安装器安装 Claude Desktop",
  "Claude works best when run from your Applications folder. Would you like to move it there now?": "从 Applications 文件夹运行 Claude 效果最佳。现在要移动过去吗？",
  "Generate Diagnostic Report": "生成诊断报告",
  "Pick a folder to send to your device": "选择要发送到设备的文件夹",
  "Move to Applications": "移动到 Applications",
  "Enable the secureVmFeaturesEnabled preference to use this feature.": "请启用 secureVmFeaturesEnabled 偏好设置以使用此功能。",
  "This artifact wants to open a {protocol} link in another app: {url}": "此工件想在其他应用中打开 {protocol} 链接：{url}",
  "Drop a data folder here{br}or click to choose": "将数据文件夹拖到这里{br}或点击选择",
  "The extension {extensionName} {organizationText} has an update available.": "扩展 {extensionName} {organizationText} 有可用更新。",
  "The skill file could not be found.": "找不到技能文件。",
  "Open App Config File...": "打开应用配置文件...",
  "Submit Feedback and Reinstall Workspace": "提交反馈并重新安装工作区",
  "Delete VM Bundle and Restart": "删除 VM 包并重启",
  "Weekly · {product}": "每周 · {product}",
  "Claude will have read and write access to this folder. It will also be trusted in the Code tab.": "Claude 将拥有此文件夹的读写权限。它也会在“代码”标签中被信任。",
  "Open Developer Config File...": "打开开发者配置文件...",
  "Failed to install extension": "安装扩展失败",
  "Skill file error": "技能文件错误",
  "Some MCP servers could not be loaded": "部分 MCP 服务器无法加载",
  "Reload This Page": "重新加载此页面",
  "Folder not allowed": "不允许使用该文件夹",
  "Error clearing cache": "清除缓存时出错",
  "This allows Claude to work with websites directly in your browser. Only grant \"always allow\" for sites you trust.": "这允许 Claude 直接在你的浏览器中操作网站。只对你信任的网站授予“始终允许”。",
  "Skill file is too large. Maximum size is 30 MB.": "技能文件过大。最大大小为 30 MB。",
  "Run coding task in bypass permissions mode?": "以绕过权限模式运行代码任务？",
  "Failed to open skill file.": "打开技能文件失败。",
  "Claude Code for Desktop has been disabled by your organization administrator": "组织管理员已禁用桌面版 Claude Code",
  "Sign back in to Claude in Chrome": "在 Chrome 中重新登录 Claude",
  "from {orgName}": "来自 {orgName}",
  "Each completed turn also fires a one-shot event containing the raw SDK content array—text blocks, tool calls, and any other content from the message. Events that serialize larger than 4KB are dropped.": "每个完成的回合还会触发一次性事件，其中包含原始 SDK 内容数组：文本块、工具调用以及消息中的其他内容。序列化后超过 4KB 的事件会被丢弃。",
  "Couldn't connect to Claude": "无法连接到 Claude",
  "This feature requires macOS 14.0 or higher": "此功能需要 macOS 14.0 或更高版本",
  "This desktop extension will be installed on your computer and made available to Claude.": "此桌面扩展将安装到你的计算机上，并提供给 Claude 使用。",
  "Open MCP Log File...": "打开 MCP 日志文件...",
  "This will delete all application data including settings, cache, and login information. The application will restart after the reset. Are you sure you want to continue?": "这将删除所有应用数据，包括设置、缓存和登录信息。重置后应用将重启。确定要继续吗？",
  "Your administrator has configured {count, plural, one {a workspace folder that doesn't} other {workspace folders that don't}} exist on this computer yet:{paths}": "管理员配置的{count, plural, one {一个工作区文件夹} other {多个工作区文件夹}}尚不存在于此计算机上：{paths}",
  "The repository includes full details on building and connecting your own devices. Here's the short version.": "仓库中包含构建并连接你自己的设备的完整详情。下面是简短版本。",
  "Please quit the other copy of Claude and try again.": "请退出另一个 Claude 实例后重试。",
  "Can't read folder, or it's empty or too large": "无法读取文件夹，或文件夹为空/过大",
  "Extension Installation Failed": "扩展安装失败",
  "That folder overlaps a protected location ({denied}) and can’t be used here. Choose a different folder.": "该文件夹与受保护的位置（{denied}）重叠，不能在这里使用。请选择其他文件夹。",
  "Claude is working in {count, plural, one {# session} other {# sessions}}. Quitting now will interrupt that work.": "Claude 正在{count, plural, one {# 个会话} other {# 个会话}}中工作。现在退出会中断这些工作。",
  "You'll need to grant Claude access to your microphone in System Settings.": "你需要在系统设置中授予 Claude 麦克风访问权限。",
  "Claude runs in the Notification Area": "Claude 在通知区域运行",
  "Claude could not be moved to the Applications folder. You can keep using it from here, or drag it to Applications yourself from Finder.": "无法将 Claude 移动到 Applications 文件夹。你可以继续从当前位置使用，或在 Finder 中手动拖到 Applications。",
  "We failed to open a link using your system's default application for this type of link. This is often caused by the default app misbehaving or your operating system refusing the link itself. {url}": "无法使用系统默认应用打开这种类型的链接。这通常是默认应用异常或操作系统拒绝该链接导致的。{url}",
  "Claude Nest has been restricted from accessing the microphone by a system administrator": "系统管理员已限制 Claude Nest 访问麦克风",
  "Claude will have read and write access to this folder.": "Claude 将拥有此文件夹的读写权限。",
  "Error resetting application data": "重置应用数据时出错",
  "Extensions Disabled": "扩展已禁用",
  "Cowork is not currently supported on {platform} with an {arch} CPU": "协作目前不支持搭载 {arch} CPU 的 {platform}",
  "Or, you can turn off Claude's dictation feature to avoid seeing this message when you press your hotkey.": "或者，你可以关闭 Claude 的听写功能，以免按下热键时看到此消息。",
  "Enter the 6-digit code shown on the device's screen to connect.": "输入设备屏幕上显示的 6 位代码以连接。",
  "Failed to login, it may have been cancelled": "登录失败，可能已被取消",
  "Show Cowork Session Data in Explorer": "在资源管理器中显示协作会话数据",
  "Claude is not ready to handle skill files. Try again after the app has fully loaded.": "Claude 尚未准备好处理技能文件。请等待应用完全加载后重试。",
  "Organization Extension Update Available": "组织扩展有可用更新",
  "The extension could not be installed. Please ensure the extension folder is valid and try again. The error was: {errorMessage}": "无法安装扩展。请确保扩展文件夹有效，然后重试。错误为：{errorMessage}",
  "This app's file ownership is preventing auto-updates from working smoothly. Claude needs to fix the ownership, which requires administrator access. You'll be prompted for your fingerprint or password.": "此应用的文件所有权阻碍了自动更新正常工作。Claude 需要修复所有权，这需要管理员权限。系统将提示你输入指纹或密码。",
  "No manifest.json found in extension file": "扩展文件中未找到 manifest.json",
  "Cowork is not currently supported on {platform}": "协作目前不支持 {platform}",
  "The extension directory has been disabled on your computer.": "此计算机上的扩展目录已被禁用。",
  "Create workspace {count, plural, one {folder} other {folders}}?": "创建{count, plural, one {工作区文件夹} other {工作区文件夹}}？",
  "When <code>prompt</code> is present, your device can return a response:": "存在 <code>prompt</code> 时，你的设备可以返回响应：",
  "You've used {key} to speak to Claude, but Claude needs microphone permission.": "你已使用 {key} 与 Claude 说话，但 Claude 需要麦克风权限。",
  "Open this conversation in the Claude desktop app to finish setup.": "在 Claude 桌面应用中打开此对话以完成设置。",
  "Cowork requires macOS 14.0 (Sonoma) or later. Update your operating system to use this feature.": "协作需要 macOS 14.0（Sonoma）或更高版本。请更新操作系统以使用此功能。",
  "Your administrator has restricted which folders can be used here. {skipped, plural, one {# folder was} other {# folders were}} skipped.": "管理员限制了这里可使用的文件夹。已跳过{skipped, plural, one {# 个文件夹} other {# 个文件夹}}。",
  "Trust {directory} and start a Cowork task?": "信任 {directory} 并启动协作任务？",
  "Ask your IT administrator to enable the secureVmFeaturesEnabled setting in the Claude desktop configuration profile.": "请让 IT 管理员在 Claude 桌面配置文件中启用 secureVmFeaturesEnabled 设置。",
  "Could not move to Applications": "无法移动到 Applications",
  "This will open your default email application to compose a message to {email}.": "这将打开你的默认邮件应用来撰写发送给 {email} 的消息。",
  "This desktop extension will be installed on your computer. In order to install this extension we need to fetch a few dependencies. This may take a few minutes.": "此桌面扩展将安装到你的计算机上。为了安装此扩展，需要获取一些依赖项，可能需要几分钟。",
  "Always allow {protocol} links from artifacts": "始终允许工件中的 {protocol} 链接",
  "Allow Claude to cowork in {path}?": "允许 Claude 在 {path} 中协作？",
  "This will delete and re-download your workspace. Your existing session data will be preserved.": "这将删除并重新下载你的工作区。现有会话数据会被保留。",
  "Claude's installation appears to be corrupted. Reinstall Claude from claude.com/download to use this feature.": "Claude 安装似乎已损坏。请从 claude.com/download 重新安装 Claude 后使用此功能。",
  "Claude crashed repeatedly. Try restarting the app, or disable hardware acceleration in Settings.": "Claude 反复崩溃。请尝试重启应用，或在设置中禁用硬件加速。",
  "This artifact wants to open {appName} with the link {url}": "此工件想使用链接 {url} 打开 {appName}",
  "Extension {extensionId} is blocked by a security blocklist: {reason}": "扩展 {extensionId} 已被安全阻止列表拦截：{reason}",
  "Developer mode allows access to developer tools and debugging features. Only enable this if you know what you're doing.": "开发者模式允许访问开发者工具和调试功能。仅在你清楚自己操作时启用。",
  "The following entries in claude_desktop_config.json are not valid MCP server configurations and were skipped: {names}": "claude_desktop_config.json 中以下条目不是有效的 MCP 服务器配置，已跳过：{names}",
  "There was an error reading or parsing claude_desktop_config.json: {error}": "读取或解析 claude_desktop_config.json 时出错：{error}",
  "Version {currentVersion} → {newVersion} Would you like to install this update?": "版本 {currentVersion} → {newVersion}。要安装此更新吗？",
  "Allow Claude to use {toolName}?": "允许 Claude 使用 {toolName}？",
  "This will stop any running VM sessions, delete all local agent mode session data, and restart the app. This action cannot be undone. Are you sure you want to continue?": "这将停止所有正在运行的 VM 会话、删除所有本地代理模式会话数据，并重启应用。此操作无法撤销。确定要继续吗？",
  "The extension could not be installed due to the following error: {errorMessage}": "由于以下错误，无法安装扩展：{errorMessage}",
  "Advertise a name starting with <code>Claude</code> over the Nordic UART Service. Everything on the wire is UTF-8 JSON—one object per line, terminated with <code>\\n</code>.": "通过 Nordic UART Service 广播一个以 <code>Claude</code> 开头的名称。线路上的所有内容都是 UTF-8 JSON，每行一个对象，并以 <code>\\n</code> 结尾。",
  "Your settings file was corrupted and has been reset to defaults. You may need to reconfigure your preferences.": "你的设置文件已损坏，并已重置为默认值。你可能需要重新配置偏好设置。",
  "Would you like to submit your issue with debug logs? Submitting your issue with logs will send system information to Anthropic for debugging and future improvements to our models.": "是否要连同调试日志一起提交问题？随日志提交问题会向 Anthropic 发送系统信息，用于调试和改进模型。",
  "This will stop any running VM sessions, delete the VM bundle files, and restart the app. The bundle will be re-downloaded the next time you use the VM. Are you sure you want to continue?": "这将停止所有正在运行的 VM 会话、删除 VM 包文件，并重启应用。下次使用 VM 时会重新下载该包。确定要继续吗？",
  "Claude runs in the background even when you close the window. Click the Claude icon in the tray to reopen the app, or right-click to quit.": "即使关闭窗口，Claude 仍会在后台运行。点击托盘中的 Claude 图标可重新打开应用，或右键退出。",
  "That feature change requires an app restart to take effect.": "该功能更改需要重启应用才会生效。",
  "There was an error reading or parsing developer_settings.json: {error}": "读取或解析 developer_settings.json 时出错：{error}",
  "In Bypass Permissions mode, Claude skips permission checks and takes actions and runs commands without asking for approval. This includes risky actions and actions that may result in prompt injections. This mode should only be used in isolated environments.": "在绕过权限模式下，Claude 会跳过权限检查，并在不请求批准的情况下执行操作和运行命令。这包括有风险的操作以及可能导致提示注入的操作。此模式只应在隔离环境中使用。",
  "The BLE API is only available when the desktop app is in developer mode. It's intended for makers and developers and isn't an officially supported product feature.": "BLE API 仅在桌面应用处于开发者模式时可用。它面向创客和开发者，并非官方支持的产品功能。",

  "Cowork": "协作",
  "New task": "新建任务",
  "New session": "新建会话",
  "Projects": "项目",
  "Scheduled": "已计划",
  "Live artifacts": "实时工件",
  "Customize": "自定义",
  "Recents": "最近",
  "Settings": "设置",
  "Language": "语言",
  "Inference configuration": "推理配置",
  "Learn more": "了解更多",
  "Sign out": "退出登录",
  "Let's knock something off your list": "把清单上的事情完成一件",
  "Learn how to use Cowork safely.": "了解如何安全使用协作。",
  "How can I help you today?": "今天我能帮你做什么？",
  "Work in a project": "在项目中工作",
  "Active": "进行中",
  "Clear active": "清除进行中",
  "You're using Gateway": "你正在使用网关",
  "Gateway": "网关",
  "Type / for skills": "输入 / 调用技能",
  "Reinstall required": "需要重新安装",
  "Cowork requires Claude Desktop to be installed via a modern installer": "协作需要通过新版安装器安装 Claude Desktop",
  "Cowork requires Claude Desktop to be installed via a modern installer.": "协作需要通过新版安装器安装 Claude Desktop。",
  "Cowork requires Claude Desktop to be installed via a modern installer to use this feature.": "要使用此功能，协作需要通过新版安装器安装 Claude Desktop。",
  "Add MCP servers, set a model allowlist, or change providers any time in the Inference configuration menu.": "你可以随时在“推理配置”菜单中添加 MCP 服务器、设置模型允许列表或更改提供商。",
  "English (United States)": "英语（美国）",
  "Français (France)": "法语（法国）",
  "Deutsch (Deutschland)": "德语（德国）",
  "Hindi (India)": "印地语（印度）",
  "Indonesia (Indonesia)": "印尼语（印度尼西亚）",
  "Italiano (Italia)": "意大利语（意大利）",
  "日本語 (日本)": "日语（日本）",
  "한국어(대한민국)": "韩语（韩国）",
  "Português (Brasil)": "葡萄牙语（巴西）",
  "Español (Latinoamérica)": "西班牙语（拉丁美洲）",
  "Español (España)": "西班牙语（西班牙）",

  "Learn how to use Cowork safely": "了解如何安全使用协作",
  "Pinned or active": "置顶或进行中",
  "Local task": "本地任务",
  "View all": "查看全部",
  "Untitled": "未命名",
  "Default": "默认",
  "Ctrl": "Ctrl",
  "Enter": "Enter",
  "to start a task and keep going": "开始任务并持续执行",
  "Create your first scheduled task": "创建你的第一个计划任务",
  "Create your first artifact": "创建你的第一个工件",
  "What needs my attention": "哪些需要我关注",
  "Daily brief": "每日简报",
  "Weekly review": "每周回顾",
  "Run tasks on a schedule or whenever you need them. Type /schedule in any existing task to schedule a task.": "按计划或在需要时运行任务。在任意现有任务中输入 /schedule 即可安排任务。",
  "Scheduled tasks only run while your computer is awake.": "计划任务只会在电脑唤醒时运行。",
  "Create dynamic artifacts that stay up-to-date using live data from your connectors.": "使用连接器中的实时数据创建保持更新的动态工件。",

  "General": "通用",
  "Privacy": "隐私",
  "Capabilities": "能力",
  "Connectors": "连接器",
  "Desktop app": "桌面应用",
  "Developer": "开发者",
  "Profile": "个人资料",
  "Avatar": "头像",
  "Full name": "全名",
  "What should Claude call you?": "Claude 应该怎么称呼你？",
  "What best describes your work?": "哪项最符合你的工作？",
  "Instructions for Claude": "给 Claude 的指令",
  "Claude will keep these in mind across chats and Cowork within Anthropic's guidelines.": "Claude 会在聊天和协作中根据 Anthropic 指南记住这些内容。",
  "e.g. ask clarifying questions before giving detailed answers": "例如：先问清楚问题，再给出详细回答",
  "e.g. keep explanations brief and to the point": "例如：解释保持简洁并直入重点",
  "Configure third-party inference": "配置第三方推理",
  "Configure Third-Party Inference": "配置第三方推理",
  "Search settings": "搜索设置",
  "Connection": "连接",
  "Workspace restrictions": "工作区限制",
  "Connectors & extensions": "连接器和扩展",
  "Telemetry & updates": "遥测和更新",
  "Usage limits": "使用限制",
  "Appearance": "外观",
  "Plugins & skills": "插件和技能",
  "Egress Requirements": "出站要求",
  "Source": "来源",
  "MCP SERVERS": "MCP 服务器",
  "Managed MCP servers": "托管 MCP 服务器",
  "Allow user-added MCP servers": "允许用户添加 MCP 服务器",
  "Allow desktop extensions": "允许桌面扩展",
  "Require signed extensions": "要求扩展带有签名",
  "Browse plugins": "浏览插件",
  "Personal plugins": "个人插件",
  "Give Claude role-level expertise with plugins": "用插件为 Claude 提供角色级专长",
  "Unlock more with Claude when you connect your team's tools.": "连接团队工具后，可解锁更多 Claude 能力。",
  "Learn more": "了解更多",

  "Close settings": "关闭设置",
  "Back to settings": "返回设置",
  "Settings updated.": "设置已更新。",
  "Failed to save settings": "保存设置失败",
  "Managed settings (settings.json)": "托管设置（settings.json）",
  "Enable in settings": "在设置中启用",
  "Disabled in settings": "已在设置中禁用",

  "Customize Claude": "自定义 Claude",
  "Skills, connectors, and plugins shape how Claude works with you.": "技能、连接器和插件会塑造 Claude 与你协作的方式。",
  "Connect your apps": "连接你的应用",
  "Let Claude read and write to the tools you already use.": "让 Claude 读写你已在使用的工具。",
  "Create new skills": "创建新技能",
  "Teach Claude your processes, team norms, and expertise.": "教会 Claude 你的流程、团队规范和专业知识。",
  "Add pre-built knowledge for your field.": "添加适合你领域的预置知识。",
  "Connectors and tools": "连接器和工具",
  "Connectors needed": "需要连接器",
  "Connectors can send up to {max, plural, one {# request header} other {# request headers}}.": "连接器最多可以发送 {max, plural, one {# 个请求头} other {# 个请求头}}。",
  "No connectors found": "未找到连接器",
  "No connectors are enabled for this session.": "此会话未启用连接器。",
  "Suggested connectors": "推荐连接器",
  "Your connectors": "你的连接器",
  "Add connectors": "添加连接器",
  "Add custom connector": "添加自定义连接器",
  "Manage connectors.": "管理连接器。",
  "Manage marketplaces of plugins that members of your org can browse, install, and customize. <link>Learn more</link>": "管理组织成员可以浏览、安装和自定义的插件市场。<link>了解更多</link>",
  "Plugins can run arbitrary code using your credentials, files, and tools. Only install plugins from sources you trust.": "插件可以使用你的凭据、文件和工具运行任意代码。只安装来自可信来源的插件。",
  "This plugin has no skills.": "此插件没有技能。",
  "Plugin reference": "插件参考",
  "Plugin saved, but skill/command sync failed": "插件已保存，但技能/命令同步失败",
  "Loading plugin files…": "正在加载插件文件…",
  "No plugin.json": "没有 plugin.json",
  "Duplicate plugin": "重复插件",
  "Overwrite plugin": "覆盖插件",
  "Loaded skill": "技能已加载",
  "Duplicate skill": "重复技能",
  "No skills match your filters.": "没有符合筛选条件的技能。",
  "No skill usage data for this period": "此期间没有技能使用数据",
  "Organization skills": "组织技能",
  "Organization plugins": "组织插件",

  "Code appearance": "代码外观",
  "Claude Light": "Claude 浅色",
  "Claude Dark": "Claude 深色",
  "Code font": "代码字体",
  "Code font family": "代码字体族",
  "Set a custom monospace font for code and terminal.": "为代码和终端设置自定义等宽字体。",
  "e.g. JetBrains Mono": "例如 JetBrains Mono",
  "High-contrast dark theme": "高对比度深色主题",
  "Use a darker, near-black background when dark mode is on.": "启用深色模式时使用更深、接近纯黑的背景。",
  "Interface font": "界面字体",
  "Font for the Claude Code interface — menus, sidebar, and chat.": "Claude Code 界面字体，用于菜单、侧边栏和聊天。",
  "Transcript text size": "对话记录文字大小",
  "Size of the conversation transcript text.": "对话记录文本的大小。",
  "Small": "小",
  "Medium": "中",
  "Large": "大",
  "Local sessions": "本地会话",
  "Allow bypass permissions mode": "允许绕过权限模式",
  "Bypass all permission checks and let Claude work uninterrupted. This works well for workflows like fixing lint errors or generating boilerplate code. Letting Claude run arbitrary commands is risky and can result in data loss, system corruption, or data exfiltration (e.g., via prompt injection attacks). <link>See best practices for safe usage</link>": "跳过所有权限检查，让 Claude 不间断地工作。这适合修复 lint 错误或生成样板代码等工作流。允许 Claude 运行任意命令有风险，可能导致数据丢失、系统损坏或数据外泄（例如通过提示注入攻击）。<link>查看安全使用最佳实践</link>",
  "Permissions": "权限",
  "Permissions needed": "需要权限",
  "Bypass Permissions was blocked": "绕过权限已被阻止",
  "Bypass Permissions mode isn't enabled. The session started in Accept Edits — enable Bypass Permissions in Settings to use it.": "绕过权限模式未启用。会话已以接受编辑模式启动；如需使用，请在设置中启用绕过权限。",
  "Bypass Permissions isn't available when running as root. The session started in Accept Edits instead.": "以 root 身份运行时无法使用绕过权限。会话已改为接受编辑模式启动。",
  "Claude Code refused to start in Bypass Permissions mode on this machine. The session has been switched to Accept Edits — send your message again to continue.": "Claude Code 拒绝在此机器上以绕过权限模式启动。会话已切换为接受编辑模式；请再次发送消息继续。",
  "Always allow": "始终允许",
  "Always allowed": "已始终允许",
  "'Always allow' is disabled by your admin. Ask them to turn it on in Organization settings → Cowork.": "管理员已禁用“始终允许”。请让管理员在组织设置 → 协作中开启。",
  "Ask": "询问",
  "Deny": "拒绝",
  "Default model": "默认模型",
  "Shell commands are only available in local sessions": "Shell 命令仅在本地会话中可用",
  "Terminal": "终端",
  "Terminals": "终端",
  "Terminal name": "终端名称",
  "Terminal {n}": "终端 {n}",
  "Ran terminal": "已运行终端",
  "Could not load local sessions.": "无法加载本地会话。",
  "Trust Workspace": "信任工作区",
  "Workspace trust needed": "需要信任工作区",
  "Workspace failing to start": "工作区启动失败",
  "Directory": "目录",
  "Directory path": "目录路径",
  "Servers & settings": "服务器和设置",
  "Local MCP servers": "本地 MCP 服务器",
  "Your MCP servers": "你的 MCP 服务器",
  "Known MCP servers": "已知 MCP 服务器",
  "MCP server guidelines": "MCP 服务器指南",
  "Drop settings.json here": "将 settings.json 拖到这里",
  "Settings must be a JSON object.": "设置必须是 JSON 对象。",
  "Capabilities not listed here can't yet be configured per role and will follow your organization's settings.": "此处未列出的能力暂不能按角色配置，会沿用组织设置。",
  "To run code, enable code execution and file creation in Settings > Capabilities.": "要运行代码，请在“设置 > 能力”中启用代码执行和文件创建。",
  "Code Execution & File Creation": "代码执行和文件创建",
  "Code execution and file creation": "代码执行和文件创建",
  "File creation + code execution": "文件创建和代码执行",
  "Allow code execution in Chat": "允许在聊天中执行代码",
  "Claude needs code execution to access some attached files.": "Claude 需要代码执行能力才能访问部分附件。",
  "Turn on code execution and file creation to use skills": "启用代码执行和文件创建以使用技能",
  "Skills require code execution and file creation, which is unavailable for your account": "技能需要代码执行和文件创建，但你的账号无法使用该能力",
  "Privacy Center": "隐私中心",
  "Privacy choices": "隐私选择",
  "Privacy policy": "隐私政策",
  "Privacy settings": "隐私设置",
  "Telemetry & updates": "遥测和更新",
  "Essential telemetry": "必要遥测",
  "Nonessential telemetry": "非必要遥测",
  "Prompts, completions, and your data are never sent to Anthropic. Telemetry covers crash and usage signals only.": "提示词、补全内容和你的数据不会发送给 Anthropic。遥测仅包含崩溃和使用信号。",
  "OpenTelemetry": "OpenTelemetry",
  "OpenTelemetry collector endpoint": "OpenTelemetry 收集器端点",
  "OpenTelemetry exporter protocol": "OpenTelemetry 导出协议",
  "OpenTelemetry exporter headers": "OpenTelemetry 导出请求头",
  "OpenTelemetry resource attributes": "OpenTelemetry 资源属性",
  "Usage limits": "使用限制",
  "*Usage limits apply": "*适用使用限制",
  "*<link>Usage limits apply.</link>": "*<link>适用使用限制。</link>",
  "Egress Requirements": "出站要求",
  "Hostnames the agent's tools may reach from the Cowork and Code tabs. Also surfaced under Egress Requirements.": "协作和代码标签页中的代理工具可访问的主机名，也会显示在出站要求中。",
  "Connectors & extensions": "连接器和扩展",
  "Plugins & skills": "插件和技能",
  "Desktop app": "桌面应用",
  "Desktop appears offline.": "桌面端似乎离线。",
  "Developer docs": "开发者文档",
  "Extension Developer": "扩展开发者",
  "Developer Tools Warning": "开发者工具警告",
  "Profile Manifest (.plist)": "配置描述文件清单（.plist）",
  "Instructions for Claude": "给 Claude 的指令",
  "Workspace restrictions": "工作区限制",
  "Source": "来源",
  "Sources": "来源",
  "Source code downloaded.": "源代码已下载。",
  "Source deleted.": "来源已删除。",
  "Source removed.": "来源已移除。",
  "Appearance": "外观",
  "Language": "语言",
  "Notifications": "通知",
  "Notifications (F8)": "通知（F8）",
  "Notifications blocked": "通知已阻止",
  "Notifications enabled": "通知已启用",
  "Extensions": "扩展",
  "Open Extensions Folder": "打开扩展文件夹",
  "Allow desktop extensions": "允许桌面扩展",
  "Require signed extensions": "要求扩展带有签名",
  "Allow user-added MCP servers": "允许用户添加 MCP 服务器",
  "MCP SERVERS": "MCP 服务器",
  "Managed MCP servers": "托管 MCP 服务器",
  "Local MCP servers are disabled on this device. Contact your IT administrator to enable this feature.": "此设备已禁用本地 MCP 服务器。请联系 IT 管理员启用此功能。",
  "Developer MCP servers are disabled on this device. Please contact your IT administrator to enable developer MCP servers.": "此设备已禁用开发者 MCP 服务器。请联系 IT 管理员启用开发者 MCP 服务器。",
  "Desktop extensions and developer MCP servers are disabled on this device. Please contact your IT administrator to enable these features.": "此设备已禁用桌面扩展和开发者 MCP 服务器。请联系 IT 管理员启用这些功能。",
  "The Extensions Directory has been disabled on this device. Please contact your IT administrator for more information.": "此设备已禁用扩展目录。请联系 IT 管理员了解更多信息。",
  "Known MCP servers": "已知 MCP 服务器",
  "Your MCP servers": "你的 MCP 服务器",
  "MCP server guidelines": "MCP 服务器指南",
  "Servers & settings": "服务器和设置",
  "No additional details are needed for this connector.": "此连接器不需要其他详细信息。",
  "Unknown Connector": "未知连接器",
  "Connector details": "连接器详情",
  "Connector updated": "连接器已更新",
  "Failed to add connector": "添加连接器失败",
  "Failed to add connector. You can try again.": "添加连接器失败。你可以重试。",
  "Connecting to Connector...": "正在连接到连接器...",
  "Using {connectorName}...": "正在使用 {connectorName}...",
  "Apps and extensions": "应用和扩展",
  "IDE extension": "IDE 扩展",
  "Apps and extensions": "应用和扩展",
  "Install Claude Code in your terminal or IDE": "在终端或 IDE 中安装 Claude Code",
  "Access your Claude Code sessions": "访问你的 Claude Code 会话",
  "No connected Claude Code instances": "没有已连接的 Claude Code 实例",
  "Send to Claude Code": "发送到 Claude Code",
  "Try Claude Code": "试用 Claude Code",
  "Install Claude Code": "安装 Claude Code",
  "Try Claude Code on desktop": "在桌面端试用 Claude Code",
  "Get the full Claude Code experience in a native window. No terminal required.": "在原生窗口中获得完整的 Claude Code 体验，无需终端。",
  "Point Claude Code at any existing repo or start from scratch. It picks up where you are.": "让 Claude Code 指向任意现有仓库，或从零开始。它会接着你的当前位置继续。",
  "Try Claude Code to build, debug, and ship just by describing what you need": "只需描述需求，即可试用 Claude Code 来构建、调试和交付",
  "All the power of Claude Code, right at home in VS Code, Cursor, or Windsurf.": "在 VS Code、Cursor 或 Windsurf 中直接使用 Claude Code 的完整能力。",
  "Send to Claude Code": "发送到 Claude Code",
  "Active Claude Code users in this period": "此期间活跃的 Claude Code 用户",
  "Install Claude Code": "安装 Claude Code",
  "Give your developers access to Claude Code": "让你的开发者使用 Claude Code",
  "Allow Claude Code Desktop": "允许 Claude Code 桌面端",
  "Claude Code Desktop has been disabled by your organization's device management policy.": "你的组织设备管理策略已禁用 Claude Code 桌面端。",
  "Claude Code Desktop respects your organization's <link>Managed settings</link> and any MDM-deployed managed settings, the same as Claude Code in the CLI and IDE.": "Claude Code 桌面端会遵循组织的<link>托管设置</link>以及任何通过 MDM 部署的托管设置，与 CLI 和 IDE 中的 Claude Code 相同。",
  "Define permissions, allowed directories and more for your entire org. This will override user and project settings and applies to Claude Code in the CLI, IDE, and Desktop app. <link>Learn more</link>": "为整个组织定义权限、允许目录等内容。这会覆盖用户和项目设置，并适用于 CLI、IDE 和桌面应用中的 Claude Code。<link>了解更多</link>",
  "Accept edits": "接受编辑",
  "Auto mode": "自动模式",
  "Enable auto mode?": "启用自动模式？",
  "Enable auto mode": "启用自动模式",
  "Auto mode isn't available for this session. Asking for permissions instead.": "此会话无法使用自动模式，将改为请求权限。",
  "Auto mode lets Claude handle permission prompts automatically. Claude checks each tool call for risky actions and prompt injection before executing, runs the ones it assesses as lower-risk, and blocks the rest.": "自动模式会让 Claude 自动处理权限提示。Claude 会在执行前检查每次工具调用是否存在高风险操作和提示注入，执行被评估为低风险的调用，并阻止其余调用。",
  "Make auto mode your default permission mode?": "将自动模式设为默认权限模式？",
  "Auto mode is now Claude Code's default permission mode": "自动模式现在是 Claude Code 的默认权限模式",
  "Accept and auto mode": "接受编辑和自动模式",
  "Accept and bypass permissions": "接受编辑并绕过权限",
  "Bypass permissions": "绕过权限",
  "Bypass permissions mode on Claude Code Desktop": "Claude Code 桌面端的绕过权限模式",
  "Bypass permissions mode and auto mode controls for Claude Code Desktop are moving to Managed settings, alongside the CLI and IDE.": "Claude Code 桌面端的绕过权限模式和自动模式控制项将与 CLI、IDE 一起迁移到托管设置。",
  "Allow your team to bypass all permission checks in Claude Code Desktop. When enabled, Claude will take actions without asking for approval. Letting Claude run arbitrary commands is risky and can result in data loss, system corruption, or data exfiltration (e.g., via prompt injection attacks). <link>See best practices for safe usage</link>": "允许团队在 Claude Code 桌面端绕过所有权限检查。启用后，Claude 会在不请求批准的情况下执行操作。允许 Claude 运行任意命令有风险，可能导致数据丢失、系统损坏或数据外泄（例如通过提示注入攻击）。<link>查看安全使用最佳实践</link>",
  "Failed to update bypass permissions setting.": "更新绕过权限设置失败。",
  "Permission Mode": "权限模式",
  "Permission mode: {mode}": "权限模式：{mode}",
  "Permission mode couldn't be changed. You can try again.": "无法更改权限模式。你可以重试。",
  "Permission mode couldn't be changed: {reason}": "无法更改权限模式：{reason}",
  "Command permissions": "命令权限",
  "Permission analyzer": "权限分析器",
  "Learn more about <docsLink>permission modes</docsLink>.": "了解更多<docsLink>权限模式</docsLink>。",
  "Ask again": "再次询问",
  "Don't ask again for this tool": "此工具不再询问",
  "Permissions are ready. Click Ask again to continue.": "权限已就绪。点击“再次询问”继续。",
  "Plan mode": "计划模式",
  "Entering plan mode": "正在进入计划模式",
  "Entered plan mode": "已进入计划模式",
  "Toggle plan mode": "切换计划模式",
  "Use Plan mode for complex changes": "对复杂更改使用计划模式",
  "Remote Control": "远程控制",
  "Turn on Remote Control for all new local sessions in `Settings → Claude Code`": "在“设置 → Claude Code”中为所有新的本地会话启用远程控制",
  "Automatically connect new local sessions to Remote Control so you can continue them from the CLI or claude.ai/code.": "自动将新的本地会话连接到远程控制，以便你从 CLI 或 claude.ai/code 继续。",
  "Git is required for local sessions.": "本地会话需要 Git。",
  "Git for Windows is required to run local sessions. If it's already installed, set the {envVar} environment variable to the full path of bash.exe and restart the app — or switch to a remote environment.": "运行本地会话需要 Git for Windows。如果已安装，请将 {envVar} 环境变量设为 bash.exe 的完整路径并重启应用，或改用远程环境。",
  "Git is required to run local sessions. Run {command} in Terminal to install the Command Line Tools, or download Git directly — or switch to a remote environment.": "运行本地会话需要 Git。请在终端运行 {command} 安装命令行工具，或直接下载 Git，也可以改用远程环境。",
  "Attach up to 20 images in a single message for local sessions": "本地会话单条消息最多可附加 20 张图片",
  "Only available in local sessions": "仅本地会话可用",
  "Fast mode is only available in local sessions": "快速模式仅本地会话可用",
  "Agents are only available in Cowork and Code.": "代理仅在协作和代码中可用。",
  "Hooks are only available in Cowork and Code.": "Hook 仅在协作和代码中可用。",
  "This plugin is managed by your organization.": "此插件由你的组织管理。",
  "Agent": "代理",
  "Agents": "代理",
  "Hook": "Hook",
  "Hooks": "Hook",
  "Model": "模型",
  "Tools": "工具",
  "Disallowed Tools": "禁用的工具",
  "Disabled": "已禁用",
  "Contact an organization owner to install connectors": "请联系组织所有者安装连接器",
  "Add to your team": "添加到你的团队",
  "This plugin has no agents.": "此插件没有代理。",
  "Select an agent to view details": "选择一个代理以查看详情",
  "No actions configured for this hook.": "此 Hook 未配置任何操作。",
  "Skills": "技能",
  "Skills settings": "技能设置",
  "Skills you can add": "可添加的技能",
  "Skills are not enabled": "技能未启用",
  "Skills are disabled by your organization": "你的组织已禁用技能",
  "Skills are disabled for your organization. Contact an owner to enable them.": "你的组织已禁用技能。请联系所有者启用。",
  "Skills might contain executable code. Team members should be careful when using skills from unknown sources.": "技能可能包含可执行代码。团队成员使用未知来源的技能时应谨慎。",
  "Top Skills": "热门技能",
  "Uploaded skills will be available once an owner enables Skills for the organization.": "所有者为组织启用技能后，上传的技能才可使用。",
  "Added by": "添加者",
  "Added by you": "由你添加",
  "Added by your admin": "由管理员添加",
  "Last updated": "最后更新",
  "Last updated: {minutes, plural, one {# minute} other {# minutes}} ago": "最后更新：{minutes, plural, one {# 分钟} other {# 分钟}}前",
  "Last updated: less than a minute ago": "最后更新：不到 1 分钟前",
  "Last updated: just now": "最后更新：刚刚",
  "Last updated: {time}": "最后更新：{time}",
  "Last updated {time}": "最后更新 {time}",
  "Trigger": "触发方式",
  "Triggers on": "触发于",
  "Triggered by {triggerLabel}": "由 {triggerLabel} 触发",
  "Slash commands": "斜杠命令",
  "Slash command": "斜杠命令",
  "Slash command + auto": "斜杠命令 + 自动",
  "Description": "说明",
  "Description (optional)": "说明（可选）",
  "Description must be under 1024 characters": "说明必须少于 1024 个字符",
  "Description cannot contain XML tags": "说明不能包含 XML 标签",
  "You": "你",
  "Your organization hasn't provided plugins. Contact your organization administrator to add them.": "你的组织尚未提供插件。请联系组织管理员添加。",
  "You already have a plugin with that name. Choose a different one.": "你已经有同名插件。请选择其他名称。",
  "No skills from Anthropic or partners yet.": "暂时没有来自 Anthropic 或合作伙伴的技能。",
  "Most used skills across your organization": "组织内最常用的技能",
  "{count, plural, one {# skill installed} other {# skills installed}}": "{count, plural, one {已安装 # 个技能} other {已安装 # 个技能}}",

  "Failed to start Claude's workspace": "无法启动 Claude 的工作区",
  "VM service not running. The service failed to start.": "虚拟机服务未运行。服务启动失败。",
  "Restarting Claude or your computer sometimes resolves this. If it persists, you can <reinstall>reinstall the workspace</reinstall>.": "重启 Claude 或电脑有时可以解决此问题。如果问题仍然存在，可以<reinstall>重新安装工作区</reinstall>。",
  "Restarting Claude or your computer sometimes resolves this. If it persists, you can <reinstall>reinstall the workspace</reinstall> or <link>share your debug logs</link> to help us improve.": "重启 Claude 或电脑有时可以解决此问题。如果问题仍然存在，可以<reinstall>重新安装工作区</reinstall>，或<link>分享调试日志</link>帮助我们改进。",
  "Setting up Claude’s workspace": "正在设置 Claude 的工作区",
  "Setting up Claude's workspace...": "正在设置 Claude 的工作区...",
  "Starting Claude's workspace...": "正在启动 Claude 的工作区...",
  "Restarting Claude's workspace...": "正在重启 Claude 的工作区...",
  "Still setting up Claude's workspace": "仍在设置 Claude 的工作区",
  "A Windows feature needs to be enabled to give Claude a secure workspace.": "需要启用一项 Windows 功能，才能为 Claude 提供安全工作区。",
  "Claude's workspace requires Virtual Machine Platform, but the virtualization service isn't responding. Restart your computer to resolve this.": "Claude 的工作区需要“虚拟机平台”，但虚拟化服务没有响应。请重启电脑解决此问题。",
  "Claude's workspace requires the Virtual Machine Platform on Windows. Enable this feature, then restart.": "Claude 的工作区需要 Windows 的“虚拟机平台”。请启用此功能，然后重启。",
  "Claude's workspace requires hardware virtualization. Enable virtualization in your computer's BIOS/UEFI settings, then restart.": "Claude 的工作区需要硬件虚拟化。请在电脑 BIOS/UEFI 设置中启用虚拟化，然后重启。",
  "A Windows security policy is blocking Claude's workspace": "Windows 安全策略正在阻止 Claude 的工作区",
  "WDAC, AppLocker, or endpoint protection is preventing the workspace runtime from starting. Copy the details for the binary path and policy rule needed to allowlist it.": "WDAC、AppLocker 或终端防护正在阻止工作区运行时启动。请复制需要加入允许列表的二进制路径和策略规则详情。",
  "Can't reach the Claude API from Claude's workspace.": "无法从 Claude 的工作区访问 Claude API。",
  "Can't reach your inference provider ({host}) from Claude's workspace.": "无法从 Claude 的工作区访问你的推理服务提供方（{host}）。",
  "Your computer isn't providing a network connection to Claude's workspace.": "你的电脑没有为 Claude 的工作区提供网络连接。",
  "Download a one-time package to give Claude a secure workspace on your computer.": "下载一次性包，在你的电脑上为 Claude 提供安全工作区。",
  "Couldn't launch the code session. You can try again.": "无法启动代码会话。你可以重试。",
  "Couldn't check workspace trust for this folder. You can try again.": "无法检查此文件夹的工作区信任状态。你可以重试。",
  "Trust this workspace?": "信任此工作区？",
  "Claude Code may read, write, or execute files in this directory. Only proceed if you trust this workspace.": "Claude Code 可能会读取、写入或执行此目录中的文件。只有在信任此工作区时才继续。",
  "You won't be asked again for this workspace. Read our <securityLink>security guide</securityLink> for details.": "此工作区不会再次询问。详情请阅读我们的<securityLink>安全指南</securityLink>。",
  "Select workspace": "选择工作区",
  "Choose a workspace": "选择一个工作区",
  "Search workspaces…": "搜索工作区…",
  "No workspaces match.": "没有匹配的工作区。",
  "Couldn't load workspaces.": "无法加载工作区。",
  "Already in this workspace": "已在此工作区中",
  "Allowed workspace folders": "允许的工作区文件夹",
  "Folders users may attach as a workspace. Leave unset for unrestricted access.": "用户可以作为工作区附加的文件夹。留空表示不限制访问。",
  "Your organization's policy has blocked access to this folder. Choose a folder inside an allowed workspace, or contact your IT team.": "你的组织策略已阻止访问此文件夹。请选择允许工作区内的文件夹，或联系 IT 团队。",
  "Workspace failing to start": "工作区启动失败",
  "Dev server failed to start.": "开发服务器启动失败。",
  "Preview not responding. The app may have failed to start.": "预览无响应。应用可能启动失败。",
  "{queued, plural, one {# session} other {# sessions}} waiting. Check your deployment — runners may have failed to start or can't reach the API.": "{queued, plural, one {# 个会话} other {# 个会话}}正在等待。请检查部署，运行器可能启动失败或无法访问 API。",
  "Failed to start": "启动失败",
  "Setup failed": "设置失败",
  "Sidebar failed to load.": "侧边栏加载失败。",
  "Failed to save settings": "保存设置失败",
  "Failed to save auto-update setting": "保存自动更新设置失败",
  "Failed to update Claude Code setting. You can try again.": "更新 Claude Code 设置失败。你可以重试。",
  "Failed to update Cowork settings.": "更新协作设置失败。",
  "Failed to update default plugin preference.": "更新默认插件偏好失败。",
  "Failed to add connector": "添加连接器失败",
  "Failed to add connector. You can try again.": "添加连接器失败。你可以重试。",
  "Connectors couldn't be loaded. Check your connection and try again.": "无法加载连接器。请检查连接后重试。",
  "Failed to install plugin. You can try again.": "安装插件失败。你可以重试。",
  "Failed to update plugin.": "更新插件失败。",
  "Failed to load skills. Try refreshing the page.": "加载技能失败。请尝试刷新页面。",
  "Skill files couldn't be loaded. Close this dialog and try again.": "无法加载技能文件。请关闭此对话框后重试。",
  "Skill validation failed. You can try again.": "技能验证失败。你可以重试。",
  "Failed to upload skill. You can try again.": "上传技能失败。你可以重试。",
  "Failed to uninstall skill. You can try again.": "卸载技能失败。你可以重试。",
  "Failed to load file.": "加载文件失败。",
  "Failed to load file content": "加载文件内容失败",
  "The file couldn't be read. Try again.": "无法读取文件。请重试。",
  "Something went wrong": "出错了",
  "Try sending your message again.": "请重新发送消息。",
  "Try sending your message again. If it keeps happening, share feedback so we can investigate.": "请重新发送消息。如果问题持续出现，请提交反馈，方便排查。",
  "You can restart the conversation from an earlier message.": "你可以从较早的消息重新开始对话。",
  "Model isn't available": "模型不可用",
  "Switch to a different model from the model picker to continue.": "请从模型选择器切换到其他模型后继续。",
  "There's an issue with the selected model ({model}). It may not exist or you may not have access to it. Run --model to pick a different model.": "所选模型（{model}）有问题。它可能不存在，或者当前账号无权访问。请切换到其他模型。",
  "Go back": "返回",
  "Try again": "重试",
  "No endpoints found that support image input": "没有可用的端点支持图片输入。",
  "Failed to upload “{fileName}”. The file format may not be supported or the file may be corrupted.": "上传“{fileName}”失败。文件格式可能不受支持，或文件已损坏。",
  "Failed to process image. You can try again.": "处理图片失败。你可以重试。",
  "Upload failed due to a network issue. Check your internet connection and try again.": "由于网络问题，上传失败。请检查互联网连接后重试。",
  "Upload failed. You can try again.": "上传失败。你可以重试。",
  "Authentication failed": "身份验证失败",
  "Authentication failed. Check that your personal access token has the correct repository permissions.": "身份验证失败。请检查你的个人访问令牌是否具有正确的仓库权限。",
  "Authentication with GitHub failed. Check that the Claude GitHub App is installed on this repository.": "GitHub 身份验证失败。请检查此仓库是否已安装 Claude GitHub App。",
  "Token couldn't be validated. Check that it has repo scope and try again.": "无法验证令牌。请检查它是否具有 repo 范围后重试。",
  "Request was blocked": "请求已被阻止",
  "Your network has been blocked from accessing Claude. For assistance, please visit <link>support.anthropic.com</link>.": "你的网络已被阻止访问 Claude。如需帮助，请访问 <link>support.anthropic.com</link>。",
  "Connection failed": "连接失败",
  "Connection couldn't be established. You can check your internet and try again.": "无法建立连接。请检查网络后重试。",
  "Network access to {hostname} is blocked by egress settings. Plugins from this marketplace won't receive updates. Ask your admin to update egress settings.": "{hostname} 的网络访问被出站设置阻止。此市场中的插件将不会收到更新。请让管理员更新出站设置。",
  "Some plugins couldn't load": "部分插件无法加载",
  "Some invites couldn't be sent. You can try again.": "部分邀请无法发送。你可以重试。",
  "One or more file uploads have failed. Please try again.": "一个或多个文件上传失败。请重试。",
  "History couldn't be loaded.": "无法加载历史记录。",
  "Session couldn't be created.": "无法创建会话。",
  "Failed to delete session. You can try again.": "删除会话失败。你可以重试。",
  "Last run failed": "上次运行失败",
  "Failed to run scheduled task. You can try again.": "运行计划任务失败。你可以重试。",
  "Failed to delete scheduled task. You can try again.": "删除计划任务失败。你可以重试。",
  "Schedule couldn't be paused. You can try again.": "无法暂停计划。你可以重试。",
  "Sync failed": "同步失败",
  "Debug export failed.": "调试导出失败。",
  "Permission decision couldn't be sent. You can try again.": "无法发送权限决定。你可以重试。",
  "Trust settings couldn't be saved. You can try again.": "无法保存信任设置。你可以重试。"
}));

const protectTerms = [
  "Claude Code for Desktop",
  "Claude Code",
  "Claude Desktop",
  "Claude.ai",
  "Claude",
  "MCP",
  "DXT",
  "BLE",
  "USB",
  "SDK",
  "API",
  "JSON",
  "UTF-8",
  "Chrome Web Store",
  "Chrome",
  "macOS",
  "Windows",
  "Applications",
  "Finder",
  "Explorer",
  "Nordic UART Service",
  "Parallels",
  "Sonoma",
  "Anthropic"
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function protectText(text) {
  const markers = [];
  const add = value => {
    const marker = `ZXQ${markers.length}QXZ`;
    markers.push([marker, value]);
    return marker;
  };
  let out = text;
  out = out.replace(/<code>[\s\S]*?<\/code>|<a>[\s\S]*?<\/a>/g, add);
  out = out.replace(/\{[A-Za-z0-9_./+-]+\}/g, add);
  for (const term of protectTerms) {
    out = out.split(term).join(add(term));
  }
  return { text: out, markers };
}

function restoreText(text, markers) {
  let out = text;
  for (const [marker, value] of markers) {
    out = out.replaceAll(marker, value);
    out = out.replaceAll(marker.toLowerCase(), value);
    out = out.replaceAll(marker.replace(/Q/g, " Q "), value);
  }
  return out
    .replaceAll("克劳德", "Claude")
    .replaceAll("Claude代码", "Claude Code")
    .replaceAll("Claude 代码", "Claude Code")
    .replaceAll("协同工作", "协作")
    .replaceAll("共同工作", "协作")
    .replaceAll("Cowork", "协作")
    .replaceAll("Applications", "应用程序")
    .replaceAll("Finder", "访达")
    .replaceAll("repository", "仓库")
    .replaceAll("虚拟机捆绑包", "虚拟机包")
    .replaceAll("VM 捆绑包", "虚拟机包")
    .replaceAll("VM Bundle", "虚拟机包")
    .replaceAll("VM Sessions", "虚拟机会话")
    .replaceAll("VM sessions", "虚拟机会话")
    .replaceAll(" VM ", " 虚拟机 ")
    .replaceAll("VM ", "虚拟机 ")
    .replace(/\bVM\b/g, "虚拟机")
    .replaceAll("牛郎", "Claude")
    .replaceAll("铬", "Chrome")
    .replaceAll("视窗", "Windows")
    .replaceAll("应用程序", "应用")
    .replace(/\s+([，。！？：；）])/g, "$1")
    .replace(/([（])\s+/g, "$1")
    .trim();
}

function postprocessZh(text) {
  return String(text)
    .replaceAll("Cowork", "协作")
    .replaceAll("Applications", "应用程序")
    .replaceAll("Finder", "访达")
    .replaceAll("repository", "仓库")
    .replaceAll("VM Bundle", "虚拟机包")
    .replaceAll("VM bundle", "虚拟机包")
    .replaceAll("VM Sessions", "虚拟机会话")
    .replaceAll("VM sessions", "虚拟机会话")
    .replaceAll("VM 会话", "虚拟机会话")
    .replaceAll("VM 包", "虚拟机包")
    .replaceAll("虚拟机捆绑包", "虚拟机包")
    .replace(/\bVM\b/g, "虚拟机")
    .replaceAll("重新启动", "重启")
    .replaceAll("Claude将", "Claude 将")
    .replaceAll("Claude的", "Claude 的")
    .replaceAll("与Claude", "与 Claude")
    .replaceAll("在Finder", "在访达")
    .replaceAll("中查找固件", "中查看固件")
    .replaceAll("claude-desktop-buddy 仓库", "claude-desktop-buddy 仓库");
}

async function translateWithMyMemory(text, cache) {
  if (manual.has(text)) return manual.get(text);
  if (cache[text]) return cache[text];
  if (!/[A-Za-z]/.test(text)) {
    cache[text] = text;
    return text;
  }
  const complexIcu = /\{\w+,\s*plural,/.test(text);
  if (complexIcu) {
    cache[text] = text;
    return text;
  }
  const protectedText = protectText(text);
  const url =
    "https://api.mymemory.translated.net/get?q=" +
    encodeURIComponent(protectedText.text) +
    "&langpair=en|zh-CN";
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`translation failed: ${response.status}`);
  const data = await response.json();
  const translated = data?.responseData?.translatedText;
  if (!translated || /quota/i.test(String(data?.responseDetails ?? ""))) {
    throw new Error(`translation unavailable: ${JSON.stringify(data).slice(0, 200)}`);
  }
  const restored = restoreText(translated, protectedText.markers);
  cache[text] = restored;
  await sleep(80);
  return restored;
}

function addVisibleOverrides(dict) {
  for (const [key, value] of manual) {
    if (!dict[key]) dict[key] = value;
  }
}

function buildManualLocale(en) {
  const out = {};
  for (const [key, value] of Object.entries(en)) {
    const source = String(value);
    out[key] = postprocessZh(manual.has(source) ? manual.get(source) : source);
  }
  return out;
}

function buildDomPatch(dict) {
  const compact = {};
  for (const [key, value] of Object.entries(dict)) {
    if (key && value && key !== value) compact[key] = value;
  }
  addVisibleOverrides(compact);
  const payload = JSON.stringify(compact);
  return `
;(()=>{try{
if(window.__claudeZhCNInstalled)return;window.__claudeZhCNInstalled=true;
const dict=${payload};
const attrs=["placeholder","aria-label","title","alt","value"];
const rxSkip=/cm-content|monaco|xterm|ProseMirror|katex|math|cm-line/i;
function norm(s){return String(s||"").replace(/\\s+/g," ").trim();}
function dyn(n){let m;if(/^now$/i.test(n))return"刚刚";if(m=n.match(/^There's an issue with the selected model \\((.+)\\)\\. It may not exist or you may not have access to it\\. Run --model to pick a different model\\.$/i))return"所选模型（"+m[1]+"）有问题。它可能不存在，或者当前账号无权访问。请切换到其他模型。";if(m=n.match(/^(\\d+)\\s+minutes? ago$/i))return m[1]+" 分钟前";if(m=n.match(/^(\\d+)\\s+hours? ago$/i))return m[1]+" 小时前";if(m=n.match(/^(\\d+)\\s+days? ago$/i))return m[1]+" 天前";if(m=n.match(/^in (\\d+)\\s+minutes?$/i))return m[1]+" 分钟后";if(m=n.match(/^in (\\d+)\\s+hours?$/i))return m[1]+" 小时后";if(m=n.match(/^in (\\d+)\\s+days?$/i))return m[1]+" 天后";return null;}
function tr(s){const n=norm(s);if(!n)return s;let v=dict[n]||dyn(n);if(!v&&n.length>=8){for(const k in dict){if(k.length>=8&&n.includes(k)){v=n.replaceAll(k,dict[k]);break;}}}if(!v)return s;const pre=String(s).match(/^\\s*/)?.[0]||"";const post=String(s).match(/\\s*$/)?.[0]||"";return pre+v+post;}
function skipNode(n){let e=n.nodeType===1?n:n.parentElement;for(let i=0;e&&i<8;i++,e=e.parentElement){const tag=e.tagName;if(tag==="SCRIPT"||tag==="STYLE"||tag==="TEXTAREA"||tag==="CODE"||tag==="PRE")return true;const c=(e.className&&String(e.className))||"";const r=e.getAttribute&&((e.getAttribute("role")||"")+" "+(e.getAttribute("data-testid")||"")+" "+(e.getAttribute("data-message-author-role")||""));if(rxSkip.test(c+" "+r))return true;}return false;}
function walk(root){if(!root||skipNode(root))return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>skipNode(n)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});const nodes=[];while(w.nextNode())nodes.push(w.currentNode);for(const n of nodes){const v=tr(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v;}const all=root.querySelectorAll?[...(root.nodeType===1?[root]:[]),...root.querySelectorAll("*")]:(root.nodeType===1?[root]:[]);for(const el of all){if(skipNode(el))continue;for(const a of attrs){if(el.hasAttribute&&el.hasAttribute(a)){const old=el.getAttribute(a);const v=tr(old);if(v!==old)el.setAttribute(a,v);}}if(el.shadowRoot)walk(el.shadowRoot);}}
function run(){walk(document.body||document.documentElement);}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
setInterval(run,1200);
if(document.documentElement)new MutationObserver(ms=>{for(const m of ms){for(const n of m.addedNodes)walk(n);if(m.type==="characterData")walk(m.target);if(m.type==="attributes")walk(m.target);}}).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attrs});
Object.defineProperty(navigator,"language",{get(){return"zh-CN"},configurable:true});
Object.defineProperty(navigator,"languages",{get(){return["zh-CN","zh","en-US","en"]},configurable:true});
}catch(e){console.error("[claude-zh-CN]",e)}})();
`;
}

function stripOneMillionContextAliases(portableDir) {
  const assetsDir = path.join(portableDir, "resources", "ion-dist", "assets", "v1");
  if (!fs.existsSync(assetsDir)) return;
  const jsFiles = fs.readdirSync(assetsDir)
    .filter((name) => name.endsWith(".js"))
    .map((name) => path.join(assetsDir, name));
  const replacements = [
    {
      label: "hide synthetic [1m] gateway model options",
      from: 'const e=`${n.model}[1m]`;t.has(e)||s.push({...n,model:e,name:i.formatMessage({defaultMessage:"{modelName} (1M context)",id:"4jU30+bnSv"},{modelName:n.name}),label_override:n.label_override?i.formatMessage({defaultMessage:"{modelName} (1M context)",id:"4jU30+bnSv"},{modelName:n.label_override}):void 0,name_i18n_key:void 0})',
      to: "continue"
    },
    {
      label: "hide server-configured [1m] code model options",
      from: "e.push(l),s&&l.supports1mContext&&e.push(nne(l,n))",
      to: "e.push(l)"
    },
    {
      label: "disable VM [1m] promotion for gateway models",
      from: "supports1mContext:T?.supports1mContext??j.supports_1m_context",
      to: "supports1mContext:[]"
    },
    {
      label: "normalize model before local send",
      from: 'if(r&&r!==Kt.current&&s.setModel)try{await s.setModel(t,r),a({event_key:"claudeai.cowork.model_switched",session_id:t,previous_model:Kt.current??"unknown",new_model:r,session_type:ON(t)?"remote":"local"}),Kt.current=r}',
      to: 'if(r&&r!==Kt.current&&s.setModel)try{const qzh=r.replace(/\\[[^\\]]+\\]$/,"");await s.setModel(t,qzh),a({event_key:"claudeai.cowork.model_switched",session_id:t,previous_model:Kt.current??"unknown",new_model:qzh,session_type:ON(t)?"remote":"local"}),Kt.current=qzh}'
    },
    {
      label: "normalize remote set_model control request",
      from: 'request:{subtype:"set_model",model:s}',
      to: 'request:{subtype:"set_model",model:s.replace(/\\[[^\\]]+\\]$/,"")}'
    },
    {
      label: "normalize warm session set_model control request",
      from: 'request:{subtype:"set_model",model:s.model}',
      to: 'request:{subtype:"set_model",model:s.model.replace(/\\[[^\\]]+\\]$/,"")}'
    },
    {
      label: "normalize scheduled task model",
      from: "model:s.model,useWorktree:s.useWorktree",
      to: 'model:s.model?.replace(/\\[[^\\]]+\\]$/,""),useWorktree:s.useWorktree'
    },
    {
      label: "use MiMo vision model for local image turns",
      from: 'const h=mUe(m),g=xs();let C=!1;if(u?.silent)At.current.add(g),ce(!0);else{re.current=g,c&&c.length>0&&dUe.getState().setFileNames(g,c);const s=YNe(e,t,g);ct(t,s),C=!le,ce(!0)}',
      to: 'if(m.length>0){const vzh=String(r??Kt.current??"").replace(/\\[[^\\]]+\\]$/,"");if(vzh==="mimo-v2.5-pro")r="mimo-v2.5"}const h=mUe(m),g=xs();let C=!1;if(u?.silent)At.current.add(g),ce(!0);else{re.current=g,c&&c.length>0&&dUe.getState().setFileNames(g,c);const s=YNe(e,t,g);ct(t,s),C=!le,ce(!0)}'
    },
    {
      label: "use MiMo vision model for local image session start",
      from: "model:oe,title:u,titlePromise:se?ne:void 0,userSelectedFiles",
      to: 'model:te?.length>0&&String(oe).replace(/\\[[^\\]]+\\]$/,"")==="mimo-v2.5-pro"?"mimo-v2.5":oe,title:u,titlePromise:se?ne:void 0,userSelectedFiles'
    },
    {
      label: "use MiMo vision model for remote image session start",
      from: "model:e.model,title:u,permissionMode:e.permissionMode",
      to: 'model:e.images?.length>0&&String(e.model).replace(/\\[[^\\]]+\\]$/,"")==="mimo-v2.5-pro"?"mimo-v2.5":e.model,title:u,permissionMode:e.permissionMode'
    },
    {
      label: "localize raw selected-model error detail",
      from: 'function cR({text:s,code:n,sessionId:a,onRetry:i,onRewind:r,fallbackModelLabel:o,onRetryWithFallback:l}){const c=H()',
      to: 'function cR({text:s,code:n,sessionId:a,onRetry:i,onRewind:r,fallbackModelLabel:o,onRetryWithFallback:l}){s=String(s||"").replace(/^There\\\'s an issue with the selected model \\((.+)\\)\\. It may not exist or you may not have access to it\\. Run --model to pick a different model\\.$/,"所选模型（$1）有问题。它可能不存在，或者当前账号无权访问。请切换到其他模型。").replace(/^No endpoints found that support image input$/,"没有可用的端点支持图片输入。");const c=H()'
    }
  ];
  for (const file of jsFiles) {
    let text = fs.readFileSync(file, "utf8");
    let changed = false;
    for (const { label, from, to } of replacements) {
      if (text.includes(from)) {
        text = text.replaceAll(from, to);
        changed = true;
      } else if (file.includes("index-") || file.includes("c5610fbe3")) {
        console.warn(`[model-alias-patch] pattern not found (${label}) in ${path.basename(file)}`);
      }
    }
    if (changed) fs.writeFileSync(file, text);
  }
}

async function main() {
  fs.rmSync(extracted, { recursive: true, force: true });
  asar.extractAll(path.join(sourceApp, "resources", "app.asar"), extracted);

  const enPath = path.join(sourceApp, "resources", "en-US.json");
  const ionEnPath = path.join(sourceApp, "resources", "ion-dist", "i18n", "en-US.json");
  const en = loadJson(enPath, {});
  const ionEn = loadJson(ionEnPath, {});
  const cache = loadJson(cachePath, {});
  const zh = {};
  let done = 0;
  for (const [key, value] of Object.entries(en)) {
    zh[key] = postprocessZh(await translateWithMyMemory(String(value), cache));
    done++;
    if (done % 25 === 0) {
      fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2) + "\n");
      console.log(`translated ${done}/${Object.keys(en).length}`);
    }
  }
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2) + "\n");
  fs.writeFileSync(path.join(root, "zh-CN.json"), JSON.stringify(zh, null, 2) + "\n");

  const domDict = Object.fromEntries(Object.entries(en).map(([k, v]) => [String(v), zh[k]]));
  for (const value of Object.values(ionEn)) {
    const source = String(value);
    const translated = postprocessZh(manual.has(source) ? manual.get(source) : source);
    if (translated !== source) domDict[source] = translated;
  }
  addVisibleOverrides(domDict);
  const patch = buildDomPatch(domDict);

  const indexPath = path.join(extracted, ".vite", "build", "index.js");
  let index = fs.readFileSync(indexPath, "utf8");
  index = index.replace('return S.debug("Wanted %o, available was %o, giving up",e,A),"en-US"', 'return "zh-CN"');
  index = index.replace('rL=E6e("en-US")', 'rL=E6e("zh-CN")');
  index = index.replace('locale:"en-US",messages:{}', 'locale:"zh-CN",messages:{}');
  index = index.replace('l6e(Rr.get("locale",BBi()))', 'l6e("zh-CN")');
  index = index.replace(
    'function vBi(e){return g3(e)?{ok:!0}:{ok:!1,reason:"expected a gateway model route referencing an Anthropic model (e.g. claude-sonnet-4-5, anthropic/claude-*). Name routes to match the underlying model."}}',
    'function vBi(e){return{ok:!0}}'
  );
  index = index.replace(
    'function LI(){return io?AH!==void 0?AH:process.windowsStore?(nAA="windowsStore",AH=!0,!0):pje()?(nAA="appPath",AH=!0,!0):(nAA=null,AH=!1,!1):!1}',
    'function LI(){return io?(nAA="patchedLocal",AH=!0,!0):!1}'
  );
  index = index.replace(
    'function Em(e){return aA.app.isPackaged?{status:"unavailable"}:e()}',
    'function Em(e){return e()}'
  );
  index = index.replace(
    'function Mrr(){return{status:"unavailable"}}function Nrr(){return{status:"unavailable"}}function krr(){return{status:"unavailable"}}async function O0A(e){const A=Z8A();return A.status!=="supported"?A:(await v9e(5e3),await F9e(),e()?{status:"supported"}:{status:"unavailable"})}',
    'function Mrr(){return $w}function Nrr(){return $w}function krr(){return $w}async function O0A(e){return $w}'
  );
  if (!index.includes("[claude-zh-CN-main]")) {
    index += `
;(()=>{try{
const {app}=require("electron");
const zhCode=${JSON.stringify(patch)};
function run(wc){try{if(!wc||wc.isDestroyed())return;wc.executeJavaScript(zhCode,true).catch(()=>{});}catch{}}
app.on("web-contents-created",(_event,wc)=>{
  const fire=()=>{run(wc);setTimeout(()=>run(wc),500);setTimeout(()=>run(wc),2000);};
  wc.on("dom-ready",fire);
  wc.on("did-finish-load",fire);
  wc.on("did-navigate",fire);
  wc.on("did-navigate-in-page",fire);
});
}catch(e){console.error("[claude-zh-CN-main]",e)}})();
`;
  }
  fs.writeFileSync(indexPath, index);

  const preloadFiles = [
    ".vite/build/mainView.js",
    ".vite/build/mainWindow.js",
    ".vite/build/aboutWindow.js",
    ".vite/build/quickWindow.js",
    ".vite/build/buddy.js",
    ".vite/build/findInPage.js"
  ];
  for (const rel of preloadFiles) {
    const file = path.join(extracted, rel);
    if (!fs.existsSync(file)) continue;
    let text = fs.readFileSync(file, "utf8");
    if (!text.includes("[claude-zh-CN]")) text += patch;
    fs.writeFileSync(file, text);
  }

  console.log("copying app...");
  fs.rmSync(portable, { recursive: true, force: true });
  fs.cpSync(sourceApp, portable, { recursive: true });
  stripOneMillionContextAliases(portable);
  fs.copyFileSync(path.join(root, "zh-CN.json"), path.join(portable, "resources", "zh-CN.json"));
  const ionZhPath = path.join(portable, "resources", "ion-dist", "i18n", "zh-CN.json");
  const ionOverridePath = path.join(portable, "resources", "ion-dist", "i18n", "zh-CN.overrides.json");
  fs.mkdirSync(path.dirname(ionZhPath), { recursive: true });
  fs.writeFileSync(ionZhPath, JSON.stringify(buildManualLocale(ionEn), null, 2) + "\n");
  fs.writeFileSync(ionOverridePath, "{}\n");
  console.log("packing app.asar...");
  await asar.createPackage(extracted, path.join(portable, "resources", "app.asar"));
  const crypto = await import("node:crypto");
  const originalHash = crypto
    .createHash("sha256")
    .update(asar.getRawHeader(path.join(sourceApp, "resources", "app.asar")).headerString)
    .digest("hex");
  const patchedHash = crypto
    .createHash("sha256")
    .update(asar.getRawHeader(path.join(portable, "resources", "app.asar")).headerString)
    .digest("hex");
  const exePath = path.join(portable, "Claude.exe");
  let exe = fs.readFileSync(exePath);
  const hashOffset = exe.indexOf(Buffer.from(originalHash, "ascii"));
  if (hashOffset < 0) throw new Error(`asar integrity hash not found in exe: ${originalHash}`);
  Buffer.from(patchedHash, "ascii").copy(exe, hashOffset);
  fs.writeFileSync(exePath, exe);
  fs.writeFileSync(
    path.join(root, "start-claude-zh-CN.cmd"),
    `@echo off\r\ntaskkill /F /T /IM claude.exe >nul 2>nul\r\nsc start CoworkVMService >nul 2>nul\r\nfor /L %%i in (1,1,10) do (\r\n  sc query CoworkVMService | find "RUNNING" >nul && goto service_ready\r\n  timeout /T 1 /NOBREAK >nul\r\n)\r\n:service_ready\r\nstart "" "${path.join(portable, "Claude.exe")}"\r\n`,
    "utf8"
  );
  console.log("done");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
