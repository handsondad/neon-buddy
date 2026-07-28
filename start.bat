@echo off
chcp 65001 >nul
echo.
echo ===============================================
echo           Neon Buddy 启动脚本
echo ===============================================
echo.

if not exist node_modules (
    echo [INFO] 检测到 node_modules 不存在，正在安装依赖...
    echo.
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] 依赖安装失败！
        pause
        exit /b %errorlevel%
    )
    echo.
    echo [SUCCESS] 依赖安装完成！
    echo.
)

echo [INFO] 启动开发服务器...
echo.
npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] 启动失败！
    pause
    exit /b %errorlevel%
)
