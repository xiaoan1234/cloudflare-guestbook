@echo off
REM 诊断脚本 - 帮助找出部署失败的原因 (Windows)

echo =========================================
echo 🔍 诊断脚本
echo =========================================
echo.

cd /d "E:\cangku\cloudflare-guestbook"

echo 📄 检查本地代码状态...
echo.

echo 1. 检查 server/utils\db.ts 文件中的环境检测函数...
findstr /c:"isCloudflareEnvironment" "server\utils\db.ts" >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ 环境检测函数存在

    findstr /c:"方法1" "server\utils\db.ts" >nul 2>nul
    if %errorlevel% equ 0 (
        echo ✅ 使用了新的环境检测逻辑（多级检测）
    ) else (
        echo ❌ 可能是旧版本代码，缺少多级检测逻辑
    )
) else (
    echo ❌ 环境检测函数不存在
)
echo.

echo 2. 检查错误处理是否已移除fallback...
findstr /c:"throw error" "server\utils\db.ts" >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ 错误处理已修改（throw error）
) else (
    echo ❌ 可能是旧版本代码（仍使用console.warn）
)
echo.

echo 3. 检查数据库操作的日志输出...
findstr /c:"console.log.*从D1数据库" "server\utils\db.ts" >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ 有详细的日志记录
) else (
    echo ⚠️  缺少详细日志记录
)
echo.

echo 📁 检查构建状态...
echo.

if exist ".output" (
    echo ✅ .output 目录存在

    if exist ".output\server" (
        echo ✅ .output\server 目录存在
    ) else (
        echo ❌ .output\server 目录不存在
    )
) else (
    echo ❌ .output 目录不存在（需要先构建）
)
echo.

echo =========================================
echo 💡 修复建议
echo =========================================
echo.
echo 要解决这个问题，请执行以下步骤：
echo.
echo 方法1：运行部署脚本
echo    Windows: 双击 rebuild-and-deploy.bat
echo.
echo 方法2：手动执行命令
echo    cd /d "E:\cangku\cloudflare-guestbook"
echo    rmdir /s /q .output
echo    rmdir /s /q .nuxt
echo    npm install
echo    npm run build
echo    npx wrangler deploy
echo.
echo 方法3：通过Cloudflare Dashboard部署
echo    1. 进入 Cloudflare Dashboard
echo    2. Workers 和 Pages ^> 留言簿 ^> 部署
echo    3. 点击创建新部署
echo    4. 上传整个项目文件夹（包含最新的代码修改）
echo.
pause
