import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'RehabWeb_API.settings')
django.setup()

print("Estructura de RehabWeb_API_terapeuta:")
try:
    with connection.cursor() as cursor:
        cursor.execute("SHOW CREATE TABLE RehabWeb_API_terapeuta")
        print(cursor.fetchone()[1])
except Exception as e:
    print(f"Error: {e}")

print("\nEstructura de RehabWeb_API_ejercicio:")
try:
    with connection.cursor() as cursor:
        cursor.execute("SHOW CREATE TABLE RehabWeb_API_ejercicio")
        print(cursor.fetchone()[1])
except Exception as e:
    print(f"Error: {e}")
