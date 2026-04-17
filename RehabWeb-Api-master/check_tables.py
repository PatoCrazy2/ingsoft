import os
import django
from django.db import connection
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'RehabWeb_API.settings')
django.setup()

print(f"AUTH_USER_MODEL: {settings.AUTH_USER_MODEL}")

print("\nMigraciones aplicadas:")
with connection.cursor() as cursor:
    cursor.execute("SELECT app, name FROM django_migrations WHERE app='RehabWeb_API'")
    for row in cursor.fetchall():
        print(f" - {row[0]}: {row[1]}")

print("\nTablas existentes:")
with connection.cursor() as cursor:
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    for table in tables:
        print(f" - {table[0]}")
