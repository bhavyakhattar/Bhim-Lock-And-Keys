@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js before opening this website.
  pause
  exit /b 1
)
if not exist node_modules (
  call npm ci
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
if not exist .env.local copy .env.example .env.local >nul
echo Keep this window open while using the website.
echo When Ready appears, open http://localhost:3000 in your browser.
call npm run dev
pause
