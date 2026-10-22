@echo off
title Dino Dash — Wild Frontier
cd /d "%~dp0"

echo =====================================================
echo       🦖 DINO DASH: WILD FRONTIER 🦖
echo =====================================================
echo.

:: Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found on your system PATH!
    echo Please install Node.js from https://nodejs.org/ to run the game.
    echo.
    pause
    exit /b 1
)

:: Install dependencies if not already present
if not exist "node_modules\" (
    echo [1/2] First-time setup: installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
)

echo [2/2] Launching game server...
echo.
echo Opening browser at http://localhost:5173/ ...

:: Launch browser after a brief delay
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:5173/"

:: Start Vite dev server
call npm run dev

pause
