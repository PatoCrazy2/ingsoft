---
trigger: always_on
---


El proyecto es una plataforma de fisioterapia con dos componentes principales:
- **Backend:** Django REST Framework (DRF) con MySQL 8.0, corriendo en Docker.
- **Frontend:** Angular 19+ con Standalone Components, SSR (Server-Side Rendering) y Angular Material.
### 🔌 Configuración de Comunicación (Proxy & Red)
- **Docker Port Mapping:** El backend en el contenedor escucha en el puerto `8000`, pero está mapeado al puerto **`8002`** en el host para evitar conflictos.
- **Proxy de Angular:** Configurado en `proxy.conf.json`. **IMPORTANTE:** En `angular.json`, la propiedad `proxyConfig` debe estar dentro del objeto `options` del target `serve` para que sea reconocida.
- **Base URL Dinámica:** Se usa el token `API_BASE_URL` en `api-base-url.ts`. 
    - En el **Navegador**: Se deja vacío (`''`) para que el proxy intercepte las peticiones `/api`.
    - En el **Servidor (SSR)**: Se usa `http://127.0.0.1:8002` para llamadas directas de Node a Docker.
---
## ⚠️ Notas de Mantenimiento (Troubleshooting)
- **Error "Unexpected token '<'":** Si vuelve a aparecer, verifica que `ng serve` haya cargado el proxy correctamente. Si el proxy falla, Angular intenta servir el `index.html` para rutas `/api`, lo cual causa el error de parseo.
- **MySQL en Docker:** Si el backend no conecta, asegúrate de que el contenedor `rehab_db_container` esté arriba y los volúmenes de datos estén persistidos.