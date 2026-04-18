#!/bin/bash
# Cargar variables de .env.local y arrancar el servidor
set -a
source "$(dirname "$0")/.env.local"
set +a
npm run dev
