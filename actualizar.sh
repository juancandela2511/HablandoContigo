#!/bin/bash
# ============================================================================
# HABLANDO CONTIGO - SCRIPT DE ACTUALIZACIÓN DOCKER (Linux / Servidor Remoto)
# ============================================================================

set -e

echo "============================================================================"
echo "  HABLANDO CONTIGO - ACTUALIZACIÓN Y RECONSTRUCCIÓN DE CONTENEDORES DOCKER"
echo "============================================================================"
echo ""

echo "[1/3] Deteniendo contenedores anteriores..."
docker compose down --remove-orphans 2>/dev/null || docker-compose down --remove-orphans

echo ""
echo "[2/3] Reconstruyendo imágenes de Frontend y Backend sin caché..."
docker compose build --no-cache 2>/dev/null || docker-compose build --no-cache

echo ""
echo "[3/3] Levantando todos los servicios recreando contenedores..."
docker compose up -d --force-recreate --remove-orphans 2>/dev/null || docker-compose up -d --force-recreate --remove-orphans

echo ""
echo "============================================================================"
echo "  ESTADO FINAL DE LOS CONTENEDORES:"
echo "============================================================================"
docker compose ps 2>/dev/null || docker-compose ps

echo ""
echo "============================================================================"
echo "  Servicios listos y actualizados:"
echo "  - Frontend (App Web): http://localhost:8085"
echo "  - Backend (REST API): http://localhost:3001/api"
echo "  - PostgreSQL:         localhost:5433 (mi_base_datos)"
echo "  - Ollama (IA):        localhost:11435"
echo "============================================================================"
echo ""
