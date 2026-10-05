@echo off
setlocal
set "GIT=C:\Users\mathe\.gemini\antigravity\tools\mingit\cmd\git.exe"
title Push RITHIN FINANCE to GitHub

echo ========================================================
echo   RITHIN FINANCE - Export to GitHub
echo ========================================================
echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/username/rithin-finance.git): "

if "%REPO_URL%"=="" (
    echo.
    echo Error: No repository URL entered.
    pause
    exit /b 1
)

echo.
echo Adding remote origin: %REPO_URL%
"%GIT%" remote remove origin 2>nul
"%GIT%" remote add origin "%REPO_URL%"

echo.
echo Pushing main branch to GitHub...
"%GIT%" branch -M main
"%GIT%" push -u origin main

echo.
echo ========================================================
echo   Push Complete!
echo ========================================================
pause
