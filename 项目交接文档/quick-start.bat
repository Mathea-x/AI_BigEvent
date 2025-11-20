#!/bin/bash
echo "🚀 大事件管理系统 - 快速启动"
echo "================================"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装 Node.js"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 启动服务
echo "🔧 启动开发服务器..."
echo "前端: http://localhost:5173"
echo "API: http://localhost:3001"
npm run dev:all