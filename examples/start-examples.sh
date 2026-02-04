#!/bin/bash

echo "🚀 Starting ZHJ SDK Examples"
echo "=============================="

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

echo ""
echo "🔧 Starting backend server..."
pnpm --filter @zhj-sdk/example-backend-express dev &
BACKEND_PID=$!

# 等待后端启动
echo "⏳ Waiting for backend to start..."
sleep 3

echo ""
echo "🎨 Starting frontend application..."
pnpm --filter @zhj-sdk/example-frontend-react dev &
FRONTEND_PID=$!

echo ""
echo "✅ Examples started successfully!"
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend:  http://localhost:3001"
echo "📍 Health:   http://localhost:3001/health"
echo ""
echo "🛑 Press Ctrl+C to stop all services"

# 等待用户中断
trap "echo ''; echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
