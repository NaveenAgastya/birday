@echo off
title Sister's Birthday 3D Museum
echo ========================================================
echo   Launching 3D Birthday Museum of Memories & Wishes...
echo ========================================================
echo.
echo Starting local web server on port 8000...
start "" http://localhost:8000
python -m http.server 8000
pause
