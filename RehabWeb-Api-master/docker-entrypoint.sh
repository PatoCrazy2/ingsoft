#!/bin/sh
set -e
cd /app

echo "Esperando a MySQL y aplicando migraciones..."
i=0
until python manage.py migrate --noinput 2>/dev/null; do
  i=$((i + 1))
  if [ "$i" -gt 40 ]; then
    echo "No se pudo migrar tras varios intentos."
    exit 1
  fi
  echo "Reintento migrate ($i)..."
  sleep 3
done

if [ "${RUN_SEED_DEMO:-1}" = "1" ]; then
  echo "Cargando datos de demostración (seed_demo)..."
  python manage.py seed_demo
fi

exec "$@"
