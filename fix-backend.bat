@echo off
echo Fixing GradNet Backend Dependencies...
cd /d "d:\projects\gradnet demo\gradnet-alumni-connect\backend"

echo Cleaning existing installations...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo Clearing npm cache...
npm cache clean --force

echo Installing dependencies...
npm install express@4.18.2
npm install bcryptjs@2.4.3  
npm install jsonwebtoken@9.0.2
npm install cors@2.8.5
npm install nodemon@3.0.1 --save-dev

echo.
echo Dependencies installed! 
echo Starting server...
npm run dev
pause