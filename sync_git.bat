@echo off
cd /d "%~dp0"
echo === Sincronizando con GitHub ===
git add .
git commit -m "Completar Fase 1: Datos de seguridad en perfil general, baneo/baja del atleta y actualizacion de flujos"
git push origin main
echo === Proceso finalizado ===
pause
