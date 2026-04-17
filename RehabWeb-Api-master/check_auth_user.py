import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'RehabWeb_API.settings')
django.setup()

print("Columnas de auth_user:")
try:
    with connection.cursor() as cursor:
        cursor.execute("DESCRIBE auth_user")
        for row in cursor.fetchall():
            print(f" - {row[0]}: {row[1]}")
except Exception as e:
    print(f"Error: {e}")
