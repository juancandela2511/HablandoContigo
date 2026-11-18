@echo off
chcp 65001 >nul
title HablandoContigo - Reiniciar Contenedores

echo ============================================================================
echo   HABLANDO CONTIGO - REINICIO DE SERVICIOS
echo ============================================================================
echo.

echo [+] Reiniciando contenedores (Backend, Frontend, Base de Datos, Ollama)...
docker compose restart

echo.
echo ============================================================================
echo   ESTADO ACTUAL DE LOS CONTENEDORES:
echo ============================================================================
docker compose ps

echo.
echo ============================================================================
echo   Servicios reiniciados:
echo   - Frontend (App Web): http://localhost:8085
echo   - Backend (REST API): http://localhost:3001/api
echo   - PostgreSQL:         localhost:5433 (Base de datos: mi_base_datos)
echo   - Ollama (IA):        localhost:11435 (Interno Docker: 11434)
echo ============================================================================
echo.
pause
