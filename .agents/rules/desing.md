---
trigger: always_on
---

# Design System — Tokens de Referencia

> Este documento es la fuente de verdad de diseño. El agente DEBE consultarlo antes de escribir cualquier CSS, SCSS o clase de estilo en el proyecto Angular.

---

## Stack y Contexto

- Framework: **Angular 17+** standalone components
- Estilos: **SCSS** por componente (`:host` scoping)
- Tipografía: **Inter** (sans-serif) — importar desde Google Fonts
- Tema: soportar modo **claro y oscuro** mediante CSS custom properties en `:root` y `[data-theme="dark"]`

---

## CSS Custom Properties — Implementación Base

Pegar en `styles.scss` global:

```scss
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');

:root {
  /* === COLORES === */
  /* Primario */
  --color-primary:           #00A781;
  --color-primary-low:       #E6F6F2;
  /* Texto */
  --color-text-primary:      #1A2B3E;
  --color-text-secondary:    #707E8C;
  --color-text-muted:        #94A3B8;
  /* Fondos */
  --color-bg-app:            #F8FAFC;
  --color-bg-card:           #FFFFFF;
  /* Bordes */
  --color-border:            #E2E8F0;
  /* Semánticos */
  --color-danger:            #FF5C5C;
  --color-danger-bg:         #FFF0F0;
  --color-warning:           #FFB84D;
  --color-info:              #4D94FF;
  /* Foco */
  --color-focus-ring:        #00A781;

  /* === TIPOGRAFÍA === */
  --font-family:             'Inter', sans-serif;
  --text-xs:   12px;
  --text-s:    14px;
  --text-m:    16px;   /* base */
  --text-l:    20px;
  --text-xl:   24px;
  --text-2xl:  32px;
  --font-regular: 400;
  --font-medium:  500;
  --font-bold:    700;
  --leading-tight:    1.2;
  --leading-default:  1.5;
  --leading-loose:    1.8;
  --tracking-normal:  0;
  --tracking-wide:    0.5px;

  /* === ESPACIADO (escala 4px) === */
  --space-0:   0px;
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   16px;
  --space-4:   24px;
  --space-5:   32px;
  --space-6:   40px;
  --space-7:   48px;
  --space-8:   64px;

  /* === RADIOS === */
  --radius-none: 0px;
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-pill: 9999px;

  /* === SOMBRAS === */
  --shadow-sm: 0 1px 3px 0 rgba(0,0,0,.10), 0 1px 2px -1px rgba(0,0,0,.10);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,.10), 0 2px 4px -2px rgba(0,0,0,.10);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,.10), 0 4px 6px -4px rgba(0,0,0,.10);

  /* === MOVIMIENTO === */
  --duration-fast:  100ms;
  --duration-base:  200ms;
  --duration-slow:  400ms;
  --easing-default: ease-in-out;
}

[data-theme="dark"] {
  --color-primary:           #33C9A0;
  --color-primary-low:       #0D3328;
  --color-text-primary:      #E2EAF4;
  --color-text-secondary:    #94A3B8;
  --color-text-muted:        #607080;
  --color-bg-app:            #0F1923;
  --color-bg-card:           #1A2535;
  --color-border:            #2A3A4E;
  --color-danger:            #FF8080;
  --color-danger-bg:         #3D1010;
  --color-warning:           #FFD080;
  --color-info:              #80B6FF;
  --color-focus-ring:        #33C9A0;
  --shadow-sm: 0 1px 3px 0 rgba(0,0,0,.25);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,.30);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,.35);
}

* { box-sizing: border-box; }

body {
  font-family: var(--font-family);
  font-size: var(--text-m);
  font-weight: var(--font-regular);
  line-height: var(--leading-default);
  color: var(--color-text-primary);
  background-color: var(--color-bg-app);
  letter-spacing: var(--tracking-normal);
}

*:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
```

---

## Roles de Color — Referencia Rápida

| Rol | Token | Uso |
|-----|-------|-----|
| Acción / Éxito | `--color-primary` | Botones CTA, links, estados activos |
| Fondo selección activa | `--color-primary-low` | Sidebar items activos, highlights |
| Títulos / Nav | `--color-text-primary` | Encabezados, nav principal |
| Fondo lienzo | `--color-bg-app` | Background de la app |
| Tarjetas / Modales | `--color-bg-card` | Cards, panels, dialogs |
| Texto secundario | `--color-text-secondary` | Subtítulos, labels, helpers |
| Placeholder / Disabled | `--color-text-muted` | Placeholders, iconos off |
| Bordes / Divisores | `--color-border` | Inputs, separadores, outline cards |
| Error | `--color-danger` | Mensajes error, badges riesgo |
| Fondo error | `--color-danger-bg` | Alert banners inline |
| Advertencia | `--color-warning` | Badges "Pendiente", alertas suaves |
| Info / Progreso | `--color-info` | Chips info, progress indicators |

---

## Patrones de Componentes

### Botón Primario
```scss
.btn-primary {
  background: var(--color-primary);
  color: #fff;
  font-size: var(--text-s);
  font-weight: var(--font-medium);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-xl);
  border: none;
  cursor: pointer;
  transition: filter var(--duration-base) var(--easing-default),
              transform var(--duration-fast) var(--easing-default);

  &:hover  { filter: brightness(1.08); transform: translateY(-1px); }
  &:active { filter: brightness(0.95); transform: translateY(0); }
  &:disabled {
    background: var(--color-text-muted);
    cursor: not-allowed;
    transform: none;
  }
}
```

### Card
```scss
.card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--duration-base) var(--easing-default),
              transform var(--duration-base) var(--easing-default);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
}
```

### Input de Formulario
```scss
.form-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-m);
  font-family: var(--font-family);
  color: var(--color-text-primary);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  transition: border-color var(--duration-base) var(--easing-default);

  &::placeholder { color: var(--color-text-muted); }
  &:focus {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 2px;
    border-color: var(--color-primary);
  }
  &.error { border-color: var(--color-danger); background: var(--color-danger-bg); }
}
```

### Badge / Chip de Estado
```scss
// Uso: <span class="badge badge--published">Publicado</span>
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;

  &--published    { background: var(--color-primary-low); color: var(--color-primary); }
  &--pending      { background: #FFF8E6; color: var(--color-warning); }
  &--draft        { background: var(--color-bg-app); color: var(--color-text-secondary);
                    border: 1px solid var(--color-border); }
  &--danger       { background: var(--color-danger-bg); color: var(--color-danger); }
  &--info         { background: #EBF2FF; color: var(--color-info); }
}
```

### Sidebar item activo
```scss
.nav-item {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-weight: var(--font-medium);
  font-size: var(--text-s);
  transition: background var(--duration-base), color var(--duration-base);
  cursor: pointer;

  &:hover  { background: var(--color-primary-low); color: var(--color-primary); }
  &.active { background: var(--color-primary-low); color: var(--color-primary); }
}
```

---

## Jerarquía Tipográfica

| Elemento | `font-size` | `font-weight` | `line-height` |
|----------|------------|---------------|--------------|
| Hero / Display | `--text-2xl` (32px) | Bold 700 | `--leading-tight` 1.2 |
| Título de página | `--text-xl` (24px) | Bold 700 | `--leading-tight` 1.2 |
| Encabezado sección | `--text-l` (20px) | Medium 500 | `--leading-tight` 1.2 |
| Cuerpo base | `--text-m` (16px) | Regular 400 | `--leading-default` 1.5 |
| Label / Subtítulo | `--text-s` (14px) | Medium 500 | `--leading-default` 1.5 |
| Caption / Auxiliar | `--text-xs` (12px) | Regular 400 | `--leading-loose` 1.8 |

---

## Reglas de Espaciado

- Usar **siempre** los tokens `--space-*`. Nunca valores en px hardcodeados.
- Padding de tarjetas: `--space-4` (24px)
- Gap entre campos de formulario: `--space-3` (16px)
- Margen entre secciones: `--space-5` (32px)
- Padding de página: `--space-5` lateral en desktop, `--space-3` en mobile

---

## Animaciones — Convenciones

```scss
// Transición estándar para la mayoría de interacciones
transition: <propiedad> var(--duration-base) var(--easing-default);

// Hover elevación de cards
transform: translateY(-2px);
box-shadow: var(--shadow-md);

// Fade-in de página / modal
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-in { animation: fadeSlideUp var(--duration-slow) var(--easing-default) both; }

// Pulso para badges "Pendiente de Validación"
@keyframes pulse-border {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 184, 77, 0.4); }
  50%       { box-shadow: 0 0 0 6px rgba(255, 184, 77, 0); }
}
.badge--pending { animation: pulse-border 2s infinite; }
```

---

## Accesibilidad — Checklist

- Foco visible: `outline: 2px solid var(--color-focus-ring)` en todos los elementos interactivos.
- Contraste mínimo: texto sobre fondo ≥ 4.5:1 (WCAG AA). Los tokens cumplen esto por diseño.
- No usar solo color para comunicar estado: siempre acompañar con texto o ícono.
- `aria-label` en botones que solo tengan íconos.
- `role="alert"` en mensajes de error dinámicos.

---

## Anti-Patrones — NUNCA Hacer

- ❌ Hardcodear colores en hex dentro de componentes (usar siempre tokens)
- ❌ Usar `!important` para sobreescribir estilos de Material
- ❌ Sombras de color morado/azul genéricas
- ❌ Bordes `border-radius: 50%` en elementos que no sean avatares circulares
- ❌ Mezclar escala de espaciado con valores arbitrarios
- ❌ `font-family: Arial` o fuentes del sistema sin Inter como fallback
- ❌ Gradientes de color llamativo en fondos de página (solo en acentos puntuales)