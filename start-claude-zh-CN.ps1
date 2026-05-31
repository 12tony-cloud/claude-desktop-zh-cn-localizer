$ErrorActionPreference = "Stop"

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$BridgeScript = Join-Path $Root "mimo-anthropic-bridge.cjs"

function Find-ClaudeApp {
  $package = Get-AppxPackage -Name Claude -ErrorAction SilentlyContinue |
    Sort-Object Version -Descending |
    Select-Object -First 1

  if ($package) {
    $appDir = Join-Path $package.InstallLocation "app"
    $exe = Join-Path $appDir "Claude.exe"
    if (Test-Path -LiteralPath $exe) {
      return @{ AppDir = $appDir; Exe = $exe }
    }
  }

  $candidate = Get-ChildItem -LiteralPath "$env:ProgramFiles\WindowsApps" -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like "Claude_*_x64__pzs8sxrjxfjjc" } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  if ($candidate) {
    $appDir = Join-Path $candidate.FullName "app"
    $exe = Join-Path $appDir "Claude.exe"
    if (Test-Path -LiteralPath $exe) {
      return @{ AppDir = $appDir; Exe = $exe }
    }
  }

  throw "未找到官方 Claude。请确认 Microsoft Store 版 Claude 已安装。"
}

if (-not (Test-Path -LiteralPath $BridgeScript)) {
  throw "未找到 MiMo 桥接脚本：$BridgeScript"
}

$claude = Find-ClaudeApp
$signature = Get-AuthenticodeSignature -LiteralPath $claude.Exe
if ($signature.Status -ne "Valid") {
  throw "官方 Claude 签名校验失败：$($signature.Status) $($signature.StatusMessage)"
}

Write-Host "正在停止旧的 Claude 和本地辅助进程..."
foreach ($scriptName in @("mimo-anthropic-bridge.cjs", "claude-zh-runtime.cjs")) {
  $scriptPath = Join-Path $Root $scriptName
  Get-CimInstance Win32_Process -Filter "name = 'node.exe'" |
    Where-Object { $_.CommandLine -and $_.CommandLine.Contains($scriptPath) } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}

Get-Process claude -ErrorAction SilentlyContinue |
  Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Milliseconds 700

$node = (Get-Command node -ErrorAction Stop).Source

Write-Host "正在启动 MiMo Anthropic 桥接：http://127.0.0.1:15721"
Start-Process -FilePath $node `
  -ArgumentList @($BridgeScript) `
  -WorkingDirectory $Root `
  -WindowStyle Hidden

Write-Host "正在确认 CoworkVMService 已启动..."
sc.exe start CoworkVMService *> $null
for ($i = 0; $i -lt 10; $i++) {
  $svc = Get-Service CoworkVMService -ErrorAction SilentlyContinue
  if ($svc -and $svc.Status -eq "Running") { break }
  Start-Sleep -Seconds 1
}

Write-Host "正在启动官方签名版 Claude..."
Start-Process -FilePath $claude.Exe `
  -WorkingDirectory $claude.AppDir `
  -ArgumentList @("--lang=zh-CN")

Write-Host "完成。已使用官方签名程序启动，避免 RPC pipe closed / 签名校验失败。"
