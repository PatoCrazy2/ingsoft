---
trigger: always_on
---

🎨 1. El Sistema de Diseño (Estado Actual)
Actualmente el proyecto usa Angular Material y algunas variables globales en src/styles.scss. Para una refactorización de alto nivel, el agente debe enfocarse en:

Tipografía: Ya se usa Outfit de Google Fonts (línea 1 de styles.scss), pero falta jerarquía visual (distintos pesos y escalas de tamaño).
Colores: Se usan variables como --primary-color: #1d4ed8 (un azul estándar). Recomiendo mover esto a una paleta más moderna (ej. HSL o Slate/Blue de Tailwind) con estados de transparencia.
Sombras y Superficies: Hay variables para --premium-shadow, pero se aplican poco. La mayoría de las páginas se ven "planas".
🏛️ 2. Estructura de Páginas (El "Mapa" a refactorizar)
Página	Estado Visual	Oportunidad de Mejora
Landing (/landing)	Muy básica	Debe ser una página "Wow" con degradados, micro-animaciones y capturas de pantalla simuladas.
Home (/home)	Funcional	Actualmente es solo un menú de botones. Debería ser un Dashboard real con estadísticas rápidas (ej. "3 pacientes nuevos", "último ejercicio validado").
Nueva Rutina (/rutinas/nueva)	Compleja	Es la más técnica. Necesita un diseño tipo "Stepper" o una vista de dos columnas (Pacientes a la izquierda, Ejercicios pre-filtrados a la derecha).
Admin (/ejercicios/admin)	Tabla estándar	Se ve muy "industrial". Podría convertirse en una vista de gestión tipo CRM con filtros rápidos.
🔗 3. Conectividad de Endpoints (¿Qué falta conectar?)
Casi todo lo esencial está conectado, pero hay oportunidades para mejorar la UX:

Detalle de Paciente: El PacienteService.obtenerDetalle(id) trae el perfil clínico completo (RF-CLIN-001). Falta usarlo en la página de "Nueva Rutina" para mostrar un panel lateral con las restricciones médicas del paciente mientras eliges los ejercicios.
Categorías: El endpoint /api/ejercicios/categorias/ está disponible pero no se usa para filtrar en la biblioteca (actualmente solo hay un buscador de texto).
Validaciones: El endpoint /api/ejercicios/{id}/validar/ ya funciona. La UI de validación podría ser mucho más visual (comparativa de antes/después).