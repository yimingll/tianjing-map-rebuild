@echo off

echo ====================================
echo Starting MUD Game Services...
echo ====================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found
    echo Please install Node.js: https://nodejs.org/
    timeout /t 5 /nobreak >nul
    exit /b 1
)

REM Clean up old processes
echo [0/3] Cleaning old processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo      [OK] Cleaned
echo.

REM Start server (silent window)
echo [1/3] Starting game server...
cd /d "%~dp0packages\server"
start /min "" cmd /c "npm start >nul 2>&1"
cd /d "%~dp0"
echo      [OK] Server starting (http://localhost:3000)
echo.

REM Wait for server to initialize
echo [2/3] Waiting for server...
timeout /t 3 /nobreak >nul
echo      [OK] Server ready
echo.

REM Start client (silent window)
echo [3/3] Starting game client...
cd /d "%~dp0packages\client"
start /min "" cmd /c "npm run dev >nul 2>&1"
cd /d "%~dp0"
echo      [OK] Client starting (http://localhost:5177)
echo.

echo ====================================
echo All services started
echo ====================================
echo.
echo Server: http://localhost:3000
echo Client: http://localhost:5177
echo.
echo Opening browser...

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Open browser
start http://localhost:5177

REM Auto close window after 1 second
timeout /t 1 /nobreak >nul
exit
