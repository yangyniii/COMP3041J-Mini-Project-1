@echo off
echo ==========================================
echo   Campus Buzz Quick Start Script (Windows)
echo ==========================================

:: 1. Start Data Service
echo [1/3] Starting Data Service on port 5002...
start "Data-Service" cmd /k "cd services/data-service && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python api.py"

:: Wait for 3 seconds to ensure Data Service is ready
timeout /t 3 /nobreak > nul

:: 2. Start Workflow Service
echo [2/3] Starting Workflow Service on port 5001...
set DATA_SERVICE_URL=http://localhost:5002
start "Workflow-Service" cmd /k "cd services/workflow && pip install -r requirements.txt && python main.py"

:: 3. Start Presentation Service (Frontend)
echo [3/3] Starting Presentation Service on port 3000...
start "Frontend" cmd /k "cd services/presentation && npm install && npm start"

echo ==========================================
echo All services have been launched in separate windows!
echo Data Service: http://localhost:5002
echo Workflow Service: http://localhost:5001
echo Frontend: http://localhost:3000
echo ==========================================
pause