@echo off
cd /d "%~dp0"
echo Starting Perfect Catch locally at http://localhost:5500
echo Press Ctrl+C to stop.
start http://localhost:5500
python -m http.server 5500
