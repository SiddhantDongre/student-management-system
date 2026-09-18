@echo off
cd /d "%~dp0frontend"
python -m http.server 5500
pause
