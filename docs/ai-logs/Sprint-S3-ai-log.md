# AI Usage Log - Sprint 3 (Extensión Hub Participante)

## 1) Herramientas usadas

- **Herramienta/modelo:** Claude Code (claude-sonnet-4-6) — Anthropic
- **Para qué se usó:**
    - Extensión del Hub del Participante existente: añadir inscripción directa a eventos y abandono desde dentro del evento.
    - Implementación a partir de un plan preescrito en `docs/claude/plans/2026-05-16-hub-participante.md`.

## 2) Prompts clave

- **Prompt principal:** "Implementa las extensiones del hub del participante: que el usuario pueda ver los eventos disponibles y unirse con un clic desde el dashboard, con un toggle que separe sus eventos de los disponibles. El botón para abandonar que esté dentro del evento con confirmación, no en la tarjeta."

## 3) Salidas relevantes (resumen corto)

- Implementación de 3 endpoints backend (`/disponibles`, `/unirse`, `/abandonar`) con su cadena Repository → Service → Controller y 4 tests unitarios.
- Extensión de `DashboardPage` con sistema de tabs ("Mis Eventos" / "Unirse a un Evento") con carga lazy y actualización optimista.
- Botón "Abandonar evento" en `OrganizerDashboard` (solo Participante/Jurado) con modal de confirmación inline.

## 4) Qué aceptamos y qué rechazamos

- **Aceptado:** Estructura de tabs en DashboardPage — mejora la UX sin romper el flujo existente de PIN.
- **Aceptado:** Modal de confirmación para abandonar — el diseño inline (sin librería de dialogs) encaja con los patrones visuales del proyecto.
- **Rechazado:** El botón Abandonar en las tarjetas del dashboard — se movió al interior del evento para evitar abandonos accidentales.
- **Corregido:** El plan original ponía `onAbandonar` en `EventCard`; se descartó porque la confirmación desde la tarjeta no ofrece suficiente contexto al usuario.

## 5) Cómo lo verificamos

- [x] Tests unitarios — `EventoServiceTests.cs`: 9/9 en verde (4 nuevos + 5 existentes).
- [x] Compilación backend — `dotnet build` sin errores de código (solo lock de fichero por servidor en ejecución).
- [x] Compilación TypeScript — `npx tsc --noEmit` sin errores nuevos (los 4 errores preexistentes son ajenos a los cambios).
- [x] Revisión por pares — decisiones de UX (ubicación del botón Abandonar, datos del perfil) validadas por el desarrollador antes de implementar.

## 6) Resultado final / decisión humana

El equipo aceptó el diseño de tabs en el dashboard y la reubicación del botón Abandonar al interior del evento (en lugar de en la tarjeta). Las decisiones arquitectónicas quedan documentadas en `ADR-010`.
