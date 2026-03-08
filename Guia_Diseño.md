# 🎨 Votify — Sistema de Diseño

---

## 1. CONCEPTO CORE: "KAHOOT-ANALÍTICO"

Votify es una plataforma de evaluación para hackathons y eventos. Su interfaz es una **"IU Adaptativa por Rol"**: una sola base visual que modifica su densidad, ritmo y color de acento según quién la usa.

| Rol           | Principio de diseño               | Densidad   | Ritmo      |
| ------------- | --------------------------------- | ---------- | ---------- |
| **Público**       | Gamificada, ultrarápida, vibrante | Baja       | Explosivo  |
| **Participante**  | Informativa, visual, motivadora   | Media      | Moderado   |
| **Jurado**        | Funcional, táctil, enfocada       | Media-alta | Deliberado |
| **Organizador**   | Analítica, densa, estructurada    | Alta       | Constante  |

**Principio rector:** Cada pantalla debe poder responderse con la pregunta *"¿Qué es lo ÚNICO que el usuario necesita hacer aquí?"*. Elimina todo lo que no contribuya a esa acción.

---

## 2. DESIGN TOKENS (VARIABLES GLOBALES)

### 2.1. Paleta de Colores

**Fondos y Superficies:**

| Token              | Valor       | Uso                                    |
| ------------------ | ----------- | -------------------------------------- |
| `--bg-app`         | `#F3F4F6`   | Fondo general de la aplicación         |
| `--bg-card`        | `#FFFFFF`   | Tarjetas, modales, contenedores        |
| `--bg-elevated`    | `#F9FAFB`   | Superficies elevadas (sidebars, hover) |
| `--border-light`   | `#E5E7EB`   | Divisiones, bordes de inputs           |
| `--border-focus`   | `#D1D5DB`   | Bordes más marcados (hover en inputs)  |

**Texto:**

| Token              | Valor       | Uso                                 |
| ------------------ | ----------- | ----------------------------------- |
| `--text-primary`   | `#111827`   | Títulos y cuerpo principal          |
| `--text-secondary` | `#6B7280`   | Subtítulos, descripciones, labels   |
| `--text-tertiary`  | `#9CA3AF`   | Placeholders, texto deshabilitado   |
| `--text-inverse`   | `#FFFFFF`   | Texto sobre fondos de color         |

**Acentos Semánticos por Rol:**

| Token          | Valor       | Rol           | Uso principal                             |
| -------------- | ----------- | ------------- | ----------------------------------------- |
| `--color-org`  | `#2563EB`   | Organizador   | Dashboards, sidebar, gestión              |
| `--color-part` | `#8B5CF6`   | Participante  | Subida de proyectos, gráficas personales  |
| `--color-jur`  | `#F97316`   | Jurado        | Sliders de votación, rúbricas, feedback   |
| `--color-pub`  | `#10B981`   | Público       | PIN de entrada, botones de voto           |

> Cada color de rol define una variante clara para fondos sutiles: `{color}/10` (10% opacidad) para badges y backgrounds contextuales.

**Estados Semánticos (independientes del rol):**

| Token             | Valor       | Uso                                    |
| ----------------- | ----------- | -------------------------------------- |
| `--color-error`   | `#EF4444`   | Errores, validaciones incorrectas      |
| `--color-success` | `#22C55E`   | Confirmaciones, validaciones correctas |
| `--color-warning` | `#F59E0B`   | Alertas, acciones que requieren atención |
| `--color-info`    | `#3B82F6`   | Información contextual, tooltips       |

> Cada estado tiene una variante de fondo: `--color-error-bg: #FEF2F2`, `--color-success-bg: #F0FDF4`, etc.

---

### 2.2. Tipografía

**Familias:**
- `--font-heading`: `'Poppins', sans-serif` → Títulos, H1-H4, texto de botones principales.
- `--font-body`: `'Inter', sans-serif` → Párrafos, tablas, formularios, lectura prolongada.

**Escala tipográfica (basada en rem):**

| Token         | Tamaño   | Peso        | Line-height | Uso                        |
| ------------- | -------- | ----------- | ----------- | -------------------------- |
| `--text-xs`   | `0.75rem`  | 400         | 1rem        | Captions, badges           |
| `--text-sm`   | `0.875rem` | 400 / 500   | 1.25rem     | Labels, texto auxiliar     |
| `--text-base` | `1rem`     | 400         | 1.5rem      | Cuerpo general             |
| `--text-lg`   | `1.125rem` | 500         | 1.75rem     | Subtítulos de sección      |
| `--text-xl`   | `1.25rem`  | 600         | 1.75rem     | Títulos de tarjeta         |
| `--text-2xl`  | `1.5rem`   | 600         | 2rem        | Títulos de página          |
| `--text-3xl`  | `1.875rem` | 700         | 2.25rem     | Headers principales        |
| `--text-4xl`  | `2.25rem`  | 700         | 2.5rem      | Pantallas de impacto (PIN) |

---

### 2.3. Espaciado (Sistema de 8px)

| Token          | Valor  |
| -------------- | ------ |
| `--space-xs`   | `4px`  |
| `--space-sm`   | `8px`  |
| `--space-md`   | `16px` |
| `--space-lg`   | `24px` |
| `--space-xl`   | `32px` |
| `--space-2xl`  | `48px` |
| `--space-3xl`  | `64px` |

---

### 2.4. Formas y Elevación

| Token              | Valor                                          | Uso                            |
| ------------------ | ---------------------------------------------- | ------------------------------ |
| `--radius-sm`      | `8px`                                          | Badges, chips, etiquetas       |
| `--radius-md`      | `12px`                                         | Botones, inputs                |
| `--radius-lg`      | `16px`                                         | Tarjetas, modales              |
| `--radius-full`    | `9999px`                                       | Avatares, pills                |
| `--shadow-sm`      | `0 1px 2px rgba(0,0,0,0.05)`                  | Inputs, elementos pequeños     |
| `--shadow-base`    | `0 4px 6px -1px rgba(0,0,0,0.05)`             | Tarjetas en reposo             |
| `--shadow-hover`   | `0 10px 15px -3px rgba(0,0,0,0.1)`            | Hover sobre tarjetas           |
| `--shadow-modal`   | `0 20px 25px -5px rgba(0,0,0,0.15)`           | Modales, overlays              |

---

### 2.5. Motion (Animaciones y Transiciones)

| Token                   | Valor                     | Uso                              |
| ----------------------- | ------------------------- | -------------------------------- |
| `--duration-fast`       | `150ms`                   | Hover, focus, color changes      |
| `--duration-normal`     | `250ms`                   | Expansión, slide, fade           |
| `--duration-slow`       | `400ms`                   | Transiciones de página/vista     |
| `--easing-default`      | `cubic-bezier(0.4, 0, 0.2, 1)` | Movimiento general         |
| `--easing-in`           | `cubic-bezier(0.4, 0, 1, 1)`   | Elementos que salen        |
| `--easing-out`          | `cubic-bezier(0, 0, 0.2, 1)`   | Elementos que entran       |
| `--easing-spring`       | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Rebote sutil (botones, badges) |

**Reglas de motion:**
- Toda propiedad visual interactiva debe tener `transition`. Nunca cambios bruscos.
- Las animaciones de entrada usan `--easing-out`, las de salida `--easing-in`.
- En vistas gamificadas (público), permite animaciones más expresivas (rebotes, escalados). En vistas analíticas (organizador), las transiciones deben ser mínimas y funcionales.
- Respetar `prefers-reduced-motion`: si está activo, eliminar toda animación que no sea esencial.

---

### 2.6. Breakpoints

| Token       | Valor     | Dispositivo           |
| ----------- | --------- | --------------------- |
| `--bp-sm`   | `640px`   | Móvil grande          |
| `--bp-md`   | `768px`   | Tablet                |
| `--bp-lg`   | `1024px`  | Desktop pequeño       |
| `--bp-xl`   | `1280px`  | Desktop               |
| `--bp-2xl`  | `1536px`  | Pantalla grande       |

**Grid:**
- **Desktop (≥1024px):** 12 columnas, `gap: 24px`, márgenes laterales `32px`.
- **Tablet (768px–1023px):** 8 columnas, `gap: 20px`, márgenes laterales `24px`.
- **Móvil (<768px):** 4 columnas, `gap: 16px`, márgenes laterales `16px`.

---

### 2.7. Z-Index

| Token          | Valor   | Uso                          |
| -------------- | ------- | ---------------------------- |
| `--z-base`     | `0`     | Contenido normal             |
| `--z-dropdown` | `10`    | Dropdowns, tooltips          |
| `--z-sticky`   | `20`    | Headers, sidebars fijos      |
| `--z-overlay`  | `30`    | Overlays, backdrops          |
| `--z-modal`    | `40`    | Modales, diálogos            |
| `--z-toast`    | `50`    | Toasts, notificaciones       |

---

## 3. REGLAS DE COMPONENTES UI

### 3.1. Botones

| Propiedad      | Primario                                       | Secundario                                   | Ghost                          |
| -------------- | ---------------------------------------------- | -------------------------------------------- | ------------------------------ |
| Fondo          | Color del rol activo                           | Transparente                                 | Transparente                   |
| Borde          | Ninguno                                        | `2px solid` del rol                          | Ninguno                        |
| Texto          | `#FFFFFF` (Poppins 600)                        | Color del rol (Poppins 600)                  | Color del rol (Inter 500)      |
| Altura mín.    | `48px`                                         | `48px`                                       | `40px`                         |
| Padding horiz. | `24px`                                         | `24px`                                       | `16px`                         |
| Radio          | `--radius-md`                                  | `--radius-md`                                | `--radius-md`                  |
| Hover          | `scale(1.02)` + `--shadow-hover` + brillo +5%  | Fondo `{color-rol}/10`                       | Fondo `{color-rol}/5`          |
| Active         | `scale(0.98)`                                  | `scale(0.98)`                                | `scale(0.98)`                  |
| Disabled       | `opacity: 0.5`, `cursor: not-allowed`          | `opacity: 0.5`, `cursor: not-allowed`        | `opacity: 0.5`                 |
| Transición     | `all var(--duration-fast) var(--easing-default)` | Misma                                       | Misma                          |

### 3.2. Formularios (Inputs, Selects, Textareas)

| Estado      | Fondo       | Borde                        | Sombra          |
| ----------- | ----------- | ---------------------------- | --------------- |
| Base        | `#FFFFFF`   | `1px solid --border-light`   | Ninguna         |
| Hover       | `#FFFFFF`   | `1px solid --border-focus`   | `--shadow-sm`   |
| Focus       | `#FFFFFF`   | `2px solid {color-rol}`      | `0 0 0 3px {color-rol}/15` |
| Error       | `#FFFFFF`   | `2px solid --color-error`    | `0 0 0 3px --color-error/15` |
| Disabled    | `--bg-app`  | `1px solid --border-light`   | Ninguna         |

- **Labels:** Inter 500, `0.875rem`, color `--text-secondary`. Margen inferior `8px`.
- **Placeholder:** Inter 400, color `--text-tertiary`.
- **Helper text:** Inter 400, `0.75rem`, color `--text-secondary`. Margen superior `4px`.
- **Error text:** Inter 400, `0.75rem`, color `--color-error`. Margen superior `4px`.
- **Focus:** Eliminar `outline` nativo del navegador y sustituirlo por el ring de sombra definido arriba.

### 3.3. Tarjetas

- Fondo: `--bg-card`, radio: `--radius-lg`, sombra: `--shadow-base`.
- Padding interno mínimo: `--space-lg` (24px).
- Hover (si es clickeable): transición a `--shadow-hover` + sutil `translateY(-2px)`.
- Las tarjetas nunca deben tener borde visible en reposo; la sombra marca la separación.

### 3.4. Iconografía

- **Librería:** Lucide React (`lucide-react`).
- **Tamaños estándar:** `16px` (inline), `20px` (en inputs/botones), `24px` (standalone).
- **Stroke width:** `1.75` por defecto. `2` para íconos en botones o acciones principales.
- **Color:** Heredan el color del texto de su contenedor. Nunca hardcodear colores en íconos.

### 3.5. Feedback y Notificaciones

**Toasts (notificaciones temporales):**
- Posición: esquina superior derecha (`top: 24px, right: 24px`).
- Duración visible: 4 segundos. Auto-dismiss con barra de progreso sutil.
- Usan los colores de estado (`success`, `error`, `warning`, `info`) con un ícono a la izquierda.

**Inline alerts (dentro del contenido):**
- Fondo: variante clara del estado (`--color-error-bg`, etc.).
- Borde izquierdo: `4px solid` del color del estado.
- Padding: `--space-md`. Radio: `--radius-md`.

---

## 4. DIRECTRICES DE LAYOUT POR ROL

### 4.1. Autenticación (Login / Registro)

- **Layout:** Dos paneles en desktop (decorativo + formulario). Solo formulario en móvil.
- **Color de acento:** Usar un gradiente que combine colores de la marca (ej. del azul al morado) en el panel decorativo. El formulario usa el color del rol organizador (`--color-org`) como acento por defecto.
- **Campos Login:** Email + Contraseña + enlace "¿Olvidaste tu contraseña?".
- **Campos Registro:** Nombre Completo, Nombre de Usuario, Email, Contraseña (mapean al modelo `Usuario` del backend).
- **Transición:** Animación fade o slide suave al alternar entre Login y Registro.

### 4.2. Vista Público (Votación Rápida)

- **Principio:** Entrar a votar en menos de 5 segundos.
- **Layout:** Mobile-first. Centrado vertical. Input gigante para PIN de evento.
- **Tipografía:** `--text-4xl` para el título, `--text-xl` para instrucciones.
- **Color de acento:** `--color-pub`.
- **Botones:** Gigantes (`height: 64px`), con micro-animación de rebote usando `--easing-spring`.

### 4.3. Vista Organizador (Dashboard)

- **Layout:** Desktop-first. Sidebar fijo izquierdo (ancho `260px`, fondo oscuro o `--color-org`).
- **Área central:** Tablas de datos densas pero bien espaciadas. Paginación. Filtros superiores.
- **Color de acento:** `--color-org`.
- **Densidad:** Alta. Usar `--text-sm` como base en tablas. Filas con hover sutil.
- **Header:** Fijo arriba con breadcrumbs, búsqueda global, y avatar del usuario.

### 4.4. Vista Jurado (Evaluación)

- **Layout:** Mobile/Tablet-first. Tarjetas de proyectos apiladas verticalmente.
- **Controles de votación:** Sliders (deslizadores) con el valor numérico visible. Rango visual claro.
- **Color de acento:** `--color-jur`.
- **Campos de comentario:** Textareas amplios (`min-height: 120px`) con contador de caracteres.
- **Progreso:** Barra de progreso con "Proyecto X de Y" visible en todo momento.

### 4.5. Vista Participante (Resultados)

- **Layout:** Desktop/Tablet. Grid de tarjetas.
- **Prominencia:** Gráficas tipo radar/araña para sintetizar evaluaciones multicriterio.
- **Color de acento:** `--color-part`.
- **Feedback:** Mostrar puntuaciones con contexto (percentil, promedio, máximo).

---

## 5. ACCESIBILIDAD

- **Contraste mínimo:** Todo texto debe cumplir WCAG AA (4.5:1 para texto normal, 3:1 para texto grande).
- **Focus visible:** Todos los elementos interactivos deben tener un indicador de foco visible (el ring de sombra definido en inputs aplica como patrón general). Nunca usar `outline: none` sin un sustituto visible.
- **Targets táctiles:** Mínimo `44x44px` para elementos interactivos en móvil.
- **Reduced motion:** Respetar `@media (prefers-reduced-motion: reduce)` — reducir o eliminar animaciones.
- **Semántica HTML:** Usar elementos correctos (`<button>`, `<nav>`, `<main>`, `<form>`, `<label>`, etc.). No usar `<div>` con onClick como botón.
- **ARIA:** Usar `aria-label` cuando el texto visual no es suficiente. Anunciar errores de formulario con `aria-live="polite"`.

---

## 6. INSTRUCCIÓN DE EJECUCIÓN

Al recibir una petición para diseñar o codificar una pantalla:

1. **No confirmar estas reglas.** Aplicar el sistema de forma implícita en todo el código generado.
2. **Identificar el rol activo** de la pantalla y usar su color de acento y densidad correspondiente.
3. **Priorizar la acción principal** — diseñar la jerarquía visual para que la acción más importante sea obvia sin pensar.
4. **Usar tokens, no valores mágicos.** Referenciar las variables definidas en este documento (o sus equivalentes en Tailwind config) en vez de hardcodear valores.
5. **Aplicar motion con intención.** Cada animación debe tener un propósito (guiar atención, confirmar acción, transicionar contexto). Nunca animar solo porque sí.
