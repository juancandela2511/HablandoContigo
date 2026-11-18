@echo off
chcp 65001 >nul
title HablandoContigo - Detener Servicios

echo ============================================================================
echo   HABLANDO CONTIGO - DETENER SERVICIOS
echo ============================================================================
echo.

echo [+] Deteniendo y desmontando contenedores...
docker compose down

echo.
echo ============================================================================
echo   Servicios detenidos correctamente.
echo ============================================================================
echo.
pause
