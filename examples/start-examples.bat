@echo off
echo 🚀 Starting ZHJ SDK Examples
echo ==============================

REM 检查是否安装了依赖
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    pnpm install
)

echo.
echo 🔧 Starting backend server...
start "Backend Server" cmd /c "cd /d %~dp0backend-express && pnpm dev"

REM 等待后端启动
echo ⏳ Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo.
echo 🎨 Starting frontend application...
start "Frontend App" cmd /c "cd /d %~dp0frontend-react && pnpm --filter @zhj-sdk/example-frontend-vue dev"

echo.
echo ✅ Examples started successfully!
echo 📍 Frontend: http://localhost:3000
echo 📍 Backend:  http://localhost:3001
echo 📍 Health:   http://localhost:3001/health
echo.
echo 💡 Close the terminal windows to stop the services
pause
