@echo off
chcp 65001 >nul
title HablandoContigo - Reiniciar Contenedores Docker

echo ============================================================================
echo   HABLANDO CONTIGO - REINICIO RÁPIDO DE CONTENEDORES
echo ============================================================================
echo.

docker compose restart
echo.
docker compose ps
echo.
pause
