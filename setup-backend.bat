@echo off
echo Installing GradNet Backend Dependencies...
cd backend
call npm install
echo.
echo Backend dependencies installed!
echo.
echo To start the system:
echo 1. Run "npm run dev" in the backend folder
echo 2. Run "npm run dev" in the main project folder
echo.
pause