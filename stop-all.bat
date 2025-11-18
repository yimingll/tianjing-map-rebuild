@echo off
echo ====================================
echo Stopping all services...
echo ====================================
echo.

REM Stop all node processes
echo [1/2] Stopping Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo      [OK] Node.js processes stopped
) else (
    echo      [INFO] No Node.js processes running
)

REM Wait for processes to terminate
timeout /t 2 /nobreak >nul

REM Check and clean ports
echo.
echo [2/2] Checking port status...
netstat -ano | findstr ":3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo      [!] Port 3000 in use, cleaning...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    echo      [OK] Port 3000 released
) else (
    echo      [OK] Port 3000 available
)

netstat -ano | findstr ":5177" >nul 2>&1
if %errorlevel% equ 0 (
    echo      [!] Port 5177 in use, cleaning...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5177"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    echo      [OK] Port 5177 released
) else (
    echo      [OK] Port 5177 available
)

echo.
echo ====================================
echo All services stopped
echo ====================================
echo.

REM Auto close window after 2 seconds
timeout /t 2 /nobreak >nul
exit
