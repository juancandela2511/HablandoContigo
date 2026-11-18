@echo off
chcp 65001 >nul
title HablandoContigo - Iniciar Servicios

echo ============================================================================
echo   HABLANDO CONTIGO - INICIO DE SERVICIOS
echo ============================================================================
echo.

echo [+] Levantando contenedores en segundo plano...
docker compose up -d

echo.
echo ============================================================================
echo   ESTADO DE LOS CONTENEDORES:
echo ============================================================================
docker compose ps

echo.
echo ============================================================================
echo   Servicios listos:
echo   - Frontend (App Web): http://localhost:8085
echo   - Backend (REST API): http://localhost:3001/api
echo   - PostgreSQL:         localhost:5433 (Base de datos: mi_base_datos)
echo   - Ollama (IA):        localhost:11435 (Interno Docker: 11434)
echo ============================================================================
echo.
pause
