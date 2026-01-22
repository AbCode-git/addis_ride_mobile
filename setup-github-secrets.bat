@echo off
REM GitHub Secrets Setup Helper - Windows Batch Launcher
echo.
echo Starting GitHub Secrets Setup Helper...
echo.
powershell.exe -ExecutionPolicy Bypass -File "%~dp0setup-github-secrets.ps1"
pause
