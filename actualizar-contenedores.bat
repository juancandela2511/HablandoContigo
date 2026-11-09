@echo off
chcp 65001 >nul
title HablandoContigo - Reconstruir y Actualizar Todos los Contenedores

echo ============================================================================
echo   HABLANDO CONTIGO - RECONSTRUCCIÓN COMPLETA DE CONTENEDORES
echo ============================================================================
echo.

echo [1/3] Deteniendo contenedores actuales...
docker compose down --remove-orphans

echo.
echo [2/3] Reconstruyendo imágenes limpias (backend y frontend sin cache)...
docker compose build --no-cache

echo.
echo [3/3] Levantando todos los servicios en segundo plano...
docker compose up -d --remove-orphans

echo.
echo ============================================================================
echo   ESTADO FINAL DE LOS CONTENEDORES:
echo ============================================================================
docker compose ps

echo.
echo ============================================================================
echo   Servicios listos y actualizados:
echo   - Frontend (App Web): http://localhost:8085
echo   - Backend (REST API): http://localhost:3001/api
echo   - PostgreSQL:         localhost:5433 (Base de datos: mi_base_datos)
echo   - Ollama (IA):        localhost:11435 (Interno Docker: 11434)
echo ============================================================================
echo.
pause
