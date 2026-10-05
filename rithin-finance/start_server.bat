@echo off
title RITHIN FINANCE Web App
echo Starting RITHIN FINANCE Server on http://localhost:3000 ...
start "" http://localhost:3000/
python -m http.server 3000
pause
