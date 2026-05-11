---
trigger: always_on
---

## 🛠️ Endpoints de la API Listos (Backend)
La API está disponible en `http://localhost:8002/api/` y cuenta con los siguientes recursos:
| Recurso | Método | Descripción |
| :--- | :--- | :--- |
| `/auth/token/` | `POST` | Obtiene el token de autenticación (Token Auth). |
| `/ejercicios/` | `GET` | Lista de ejercicios (con filtros por estado, categoría y paciente). |
| `/ejercicios/` | `POST` | Crea un nuevo ejercicio (requiere Auth). |
| `/ejercicios/{id}/` | `GET` | Detalle de un ejercicio específico. |
| `/ejercicios/categorias/` | `GET` | Listado de categorías clínicas (Tesauro). |
| `/ejercicios/{id}/validar/`| `POST` | Validación por pares de ejercicios (Admin/Terapeuta). |
| `/pacientes/` | `GET` | Listado de pacientes asignados al terapeuta. |
| `/pacientes/{id}/` | `GET` | Detalle clínico completo de un paciente. |
---
## 💻 Utilidades y Servicios del Frontend
### 🔐 `AuthService` (`core/auth/auth.service.ts`)
- **`asegurarTokenDemo()`**: Método automático que loguea al usuario `terapeuta@demo.rehab` si no hay sesión. Ideal para entornos de desarrollo.
- **`login(email, pass)`**: Proceso estándar de obtención de token.
- **`token()`**: Signal que expone el token actual.
### 🏃 `EjercicioService` (`features/ejercicios/services/ejercicio.service.ts`)
- **`getEjercicios(filtros?)`**: Carga ejercicios con lógica de mapeo desde Django a modelos de Angular.
- **`getCategoriasEjercicio()`**: Obtiene el tesauro de categorías.
- **`validarEjercicio(id, data)`**: Envía validaciones clínicas.
### 👥 `PacienteService` (`features/rutinas/services/paciente.ts`)
- **`listar()`**: Obtiene los pacientes del terapeuta.
- **`obtenerDetalle(id)`**: Trae el perfil clínico y la última evaluación prioritaria.
### 🌐 `withApiBase` (`core/http/api-base-url.ts`)
- Utilidad para construir rutas seguras ante cambios de plataforma (Browser vs SSR). Úsala siempre en los servicios: `withApiBase(this.apiBase, '/api/tu-ruta')`.