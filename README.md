# RehabWeb - Monorepo de Desarrollo

Este repositorio centraliza el desarrollo del nuevo módulo de RehabWeb. Hemos estructurado el proyecto como un **monorepo** para sincronizar el trabajo entre el Backend (Django) y el Frontend (Angular).

> [!IMPORTANT]
> **Cambio Arquitectónico:** Hemos migrado a **Docker** para la infraestructura del Backend y Base de Datos. Ya **no es necesario XAMPP** ni configurar Python localmente para el servidor.

---

## 🚀 Guía de Inicio Rápido

### Requisitos Previos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo.
- [Node.js](https://nodejs.org/) (v18+) para el desarrollo del frontend.

### 1. Configuración de Entorno (`.env`)
He creado un archivo `.env` en la raíz que maneja todas las credenciales. **No modifiques el código fuente**, cualquier cambio de base de datos o claves se hace aquí.

### 2. Levantar Backend y Base de Datos (Docker)
Desde la raíz del proyecto (`c:\IngSoft`), ejecuta:
```powershell
# Levanta MySQL y Django en segundo plano
docker-compose up -d --build

# Ejecuta migraciones (solo la primera vez o si hay cambios en modelos)
docker exec -it rehab_backend python manage.py migrate
```
*El backend estará disponible en: [http://localhost:8000/admin](http://localhost:8000/admin)*

### 3. Levantar Frontend (Local)
Abre una terminal nueva y ejecuta:
```powershell
cd RehabWeb-WebApp-master
npm install
npm start
```
*El frontend estará disponible en: [http://localhost:4200](http://localhost:4200)*

---

## 🛠️ Lo que hemos actualizado (Staff Notes)

1. **Dockerización Total:** La base de datos MySQL 8.0 y Django corren en contenedores aislados. El puerto `3306` y `8000` están mapeados a tu máquina local.
2. **Variables de Entorno (`os.getenv`):** El proyecto ahora lee la configuración desde un archivo `.env`. Esto permite que el mismo código funcione en Docker, en local o en un servidor de producción sin cambios manuales.
3. **Persistencia de Datos:** Los datos de la base de datos se guardan en un volumen de Docker (`db_data`), por lo que no se borran aunque apagues los contenedores.
4. **Git Estructural:** Hemos añadido `.gitignore` en la raíz para evitar subir archivos basura del sistema (`.env`, `.vscode`, `__pycache__`, `node_modules`).

---

## 📝 Flujo de Trabajo y Commits

Para mantener el orden profesional, utiliza **Conventional Commits**:
- `feat: ...` para nuevas funcionalidades.
- `fix: ...` para corrección de errores.
- `chore: ...` para cambios de configuración o dependencias.

**Ejemplo de primer commit:**
`git commit -m "chore: initial monorepo setup with docker architecture and environment variables"`

