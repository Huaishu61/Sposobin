@echo off
chcp 65001 >nul
echo 正在启动 Sposobin 和声写作台...

:: 1. 启动 Python 后端 (FastAPI)
echo 启动后端服务...
start "Sposobin Backend" cmd /k "cd /d C:\Users\MSI-II\Desktop\py_stock\Sposobin && uvicorn app:app --reload --port 8000"

:: 2. 启动 Vue 前端 (Vite)
echo 启动前端服务...
start "Sposobin Frontend" cmd /k "cd /d C:\Users\MSI-II\Desktop\py_stock\Sposobin\frontend && npm run dev"

echo 启动命令已发送！请查看弹出的两个命令行窗口。
exit