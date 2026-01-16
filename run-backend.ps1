# Script to run the backend with Node.js from C: drive
# This script helps when Node.js is not in system PATH

Write-Host "Searching for Node.js installation..." -ForegroundColor Yellow

# Common Node.js installation paths
$nodePaths = @(
    "C:\Program Files\nodejs",
    "C:\Program Files (x86)\nodejs",
    "$env:LOCALAPPDATA\Programs\nodejs",
    "$env:APPDATA\npm",
    "C:\nodejs"
)

$nodeExe = $null
$npmCmd = $null

foreach ($path in $nodePaths) {
    if (Test-Path "$path\node.exe") {
        $nodeExe = "$path\node.exe"
        if (Test-Path "$path\npm.cmd") {
            $npmCmd = "$path\npm.cmd"
        }
        Write-Host "Found Node.js at: $path" -ForegroundColor Green
        break
    }
}

if (-not $nodeExe) {
    Write-Host "ERROR: Node.js not found in common locations!" -ForegroundColor Red
    Write-Host "Please specify the full path to your Node.js installation:" -ForegroundColor Yellow
    Write-Host "Example: C:\path\to\nodejs" -ForegroundColor Gray
    $customPath = Read-Host "Enter Node.js path (or press Enter to exit)"
    
    if ($customPath -and (Test-Path "$customPath\node.exe")) {
        $nodeExe = "$customPath\node.exe"
        $npmCmd = "$customPath\npm.cmd"
    } else {
        Write-Host "Exiting..." -ForegroundColor Red
        exit 1
    }
}

# Add Node.js to PATH for this session
$env:Path = "$(Split-Path $nodeExe);$env:Path"

Write-Host "`nNode.js version:" -ForegroundColor Cyan
& $nodeExe --version

if ($npmCmd) {
    Write-Host "npm version:" -ForegroundColor Cyan
    & $npmCmd --version
    
    Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
    & $npmCmd install
    
    Write-Host "`nStarting backend server..." -ForegroundColor Green
    & $npmCmd run dev
} else {
    Write-Host "ERROR: npm not found! Please install Node.js properly from https://nodejs.org" -ForegroundColor Red
}
