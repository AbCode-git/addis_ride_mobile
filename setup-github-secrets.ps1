# Simple GitHub Secrets Setup (One Secret Only!)
# For native Android builds - no Expo needed

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "GitHub Secret Setup (Native Build)" -ForegroundColor Cyan
Write-Host "==================================`n" -ForegroundColor Cyan

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please make sure you're in the project directory." -ForegroundColor Yellow
    exit 1
}

# Read ORS_API_KEY from .env
$envContent = Get-Content ".env" -Raw
if ($envContent -match 'ORS_API_KEY=(.+)') {
    $orsApiKey = $matches[1].Trim()
    Write-Host "✓ Found ORS_API_KEY in .env file" -ForegroundColor Green
}
else {
    Write-Host "ERROR: ORS_API_KEY not found in .env file!" -ForegroundColor Red
    exit 1
}

Write-Host "`n----------------------------------" -ForegroundColor Cyan
Write-Host "Opening GitHub Secrets Page" -ForegroundColor Yellow
Write-Host "----------------------------------" -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "https://github.com/AbCode-git/addis_ride_mobile/settings/secrets/actions"

Write-Host "`n📋 Add this secret in GitHub:" -ForegroundColor Green
Write-Host "`n=== ORS_API_KEY ===" -ForegroundColor Cyan
Write-Host "Name: " -NoNewline -ForegroundColor White
Write-Host "ORS_API_KEY" -ForegroundColor Yellow
Write-Host "Value: " -NoNewline -ForegroundColor White
Write-Host $orsApiKey -ForegroundColor Magenta

# Copy to clipboard
Set-Clipboard -Value $orsApiKey
Write-Host "`n✓ ORS_API_KEY copied to clipboard!" -ForegroundColor Green

Write-Host "`n----------------------------------" -ForegroundColor Cyan
Write-Host "Steps in GitHub:" -ForegroundColor Yellow
Write-Host "----------------------------------" -ForegroundColor Cyan
Write-Host "1. Click 'New repository secret'" -ForegroundColor Gray
Write-Host "2. Name: ORS_API_KEY" -ForegroundColor Gray
Write-Host "3. Value: Paste (Ctrl+V)" -ForegroundColor Gray
Write-Host "4. Click 'Add secret'" -ForegroundColor Gray

Write-Host "`n==================================" -ForegroundColor Green
Write-Host "✓ That's it! Only ONE secret needed!" -ForegroundColor Green
Write-Host "==================================`n" -ForegroundColor Green

Write-Host "After adding the secret, trigger a build:" -ForegroundColor White
Write-Host "  git add ." -ForegroundColor Cyan
Write-Host "  git commit -m 'Trigger build'" -ForegroundColor Cyan
Write-Host "  git push" -ForegroundColor Cyan

Write-Host "`nDownload APK from:" -ForegroundColor White
Write-Host "  GitHub → Actions → Latest build → Artifacts" -ForegroundColor Cyan

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
