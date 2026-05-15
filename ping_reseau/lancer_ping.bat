@echo off
cd /d "%~dp0"
python ping_reseau.py >> ping_log.txt 2>&1
