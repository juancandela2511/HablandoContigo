# Infraestructura y Contenedores Docker — Hablando Contigo

Toda la configuración, scripts de inicialización, copias de seguridad y archivos de Docker están unificados en esta carpeta (`/docker`).

## Estructura Unificada

```text
docker/
├── docker-compose.yml       # Orquestador principal (PostgreSQL 16 + PgBackups + CloudBeaver)
├── Dockerfile.frontend      # Construcción para el frontend Vue 3 + Tailwind en Nginx
├── Dockerfile.backend       # Construcción para la API REST Node.js + TypeScript
├── nginx.conf               # Configuración del servidor Nginx de producción
├── README.md                # Esta guía de uso y administración
├── init/
│   ├── 01-init.sql          # Creación de esquemas, tablas, extensiones (pgcrypto, uuid)
│   └── 02-data-dump.sql     # Semilla inicial de preguntas oficiales y configuración
└── backups/                 # Almacén de copias de seguridad automáticas (pg_dump)
```

## Servicios Incluidos

1. **`postgres-db` (`hablandocontigo_postgres`)**:
   - PostgreSQL 16 Alpine optimizado para rendimiento empresarial (WAL replica, fsync activo, ACID).
   - Puerto expuesto: `5432`.
   - Base de datos: `mi_base_datos` | Usuario: `postgres` | Contraseña: `1012332747Js`.

2. **`postgres-backup` (`hablandocontigo_backup`)**:
   - Generación programada de backups diarios comprimidos en `./backups`.
   - Rotación y retención: 14 días diarios, 4 semanas, 6 meses.

3. **`db-manager` (`hablandocontigo_manager`)**:
   - Panel visual web (CloudBeaver) para explorar y administrar tablas como en Supabase.
   - Acceso web: `http://localhost:8978`.

4. **`ollama` (`hablandocontigo_ollama`)**:
   - Motor oficial de Inteligencia Artificial Local (LLM) corriendo en contenedor.
   - Puerto expuesto al host: `11434`.
   - Persistencia: volumen `ollama_data` (`/root/.ollama`), evitando tener que volver a descargar los modelos tras reiniciar contenedores.

5. **`backend` (`hablandocontigo_backend`)**:
   - API REST en Node.js y TypeScript.
   - Conectado directamente a `postgres-db` y `ollama` mediante la red interna de Docker (`hablandocontigo_net`).
   - Puerto expuesto: `3000`.

## Comandos Principales

### Iniciar solo la infraestructura base (Base de Datos + Ollama)
Ideal si desarrollas el backend localmente con `npm run dev`:
```bash
docker compose up -d postgres-db ollama
```

### Iniciar toda la infraestructura completa
```bash
docker compose up -d --build
```

### Descargar el modelo LLM dentro del contenedor Ollama
Una vez levantado el servicio `ollama`, descarga el modelo deseado (por ejemplo, `llama3` o `llama3.2`):
```bash
docker exec -it hablandocontigo_ollama ollama pull llama3
```

Para listar los modelos descargados en el contenedor:
```bash
docker exec -it hablandocontigo_ollama ollama list
```

### Detener los servicios
```bash
docker compose down
```

### Conectarse a la terminal de PostgreSQL
```bash
docker exec -it hablandocontigo_postgres psql -U postgres -d mi_base_datos
```
