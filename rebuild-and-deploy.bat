@echo off
REM Cloudflare 留言簿 - 重新部署脚本 (Windows)
REM 确保所有修改都被应用

echo =========================================
echo Cloudflare 留言簿 - 重新部署脚本
echo =========================================
echo.

REM 1. 检查Node.js
echo 📦 检查环境...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装
    pause
    exit /b 1
)
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm 未安装
    pause
    exit /b 1
)
echo ✅ Node.js 和 npm 已安装
echo.

REM 2. 清理并重新构建
echo 🔨 清理并重新构建...
cd /d "E:\cangku\cloudflare-guestbook"

REM 清理旧的构建文件
if exist .output rmdir /s /q .output
if exist .nuxt rmdir /s /q .nuxt
echo ✅ 清理完成

REM 安装依赖
echo 📦 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装完成

REM 构建项目
echo 🔨 构建项目...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ 构建失败
    pause
    exit /b 1
)
echo ✅ 构建完成
echo.

REM 3. 验证构建输出
echo 📁 验证构建输出...
if not exist ".output\server" (
    echo ❌ .output\server 目录不存在，构建失败
    pause
    exit /b 1
)
echo ✅ 构建输出验证成功
echo.

REM 4. 部署到Cloudflare
echo 🚀 部署到Cloudflare...
call npx wrangler deploy
if %errorlevel% neq 0 (
    echo ❌ 部署失败
    pause
    exit /b 1
)

echo.
echo =========================================
echo ✅ 部署完成！
echo =========================================
echo.
echo 接下来的步骤：
echo 1. 访问 https://xiaoaan520.xyz
echo 2. 尝试注册新用户
echo 3. 退出并重新登录
echo 4. 检查Worker日志：
echo    - Cloudflare Dashboard ^> Workers & Pages ^> 留言簿 ^> 可观测性
echo.
echo 如果仍有问题，请检查：
echo - Worker日志中的错误信息
echo - D1数据库控制台中的表结构
echo - 环境变量绑定
echo.
pause
