# ADR-010: Hub del Participante — Inscripción directa y abandono de eventos

**Fecha:** 16-05-2026  
**Sprint:** S3  
**Estado:** Aprobado

## 1) Contexto

Hasta este sprint, unirse a un evento requería conocer un PIN de 4 dígitos y escribirlo manualmente en un formulario (`JoinEventoPorCodigoAsync`). Este flujo:
- Asume que el usuario tiene el PIN a mano (implica coordinación externa con el organizador).
- No permite al usuario descubrir eventos disponibles por su cuenta.
- No da al Participante ni al Jurado ningún mecanismo para abandonar un evento desde la plataforma.

Se necesitaba un flujo complementario de auto-gestión para el Participante/Jurado sin depender de canales externos.

## 2) Opciones consideradas

- **Opción A (mantener solo PIN):** No añadir nada. El usuario sigue dependiendo del PIN. Simple, pero cubre mal el caso de uso de descubrimiento.
- **Opción B: Listado de todos los eventos + join con 1 clic.** El backend expone todos los eventos públicos; el frontend los muestra en una tab "Unirse a un Evento". El join registra al usuario como `Participante` directamente.
- **Opción C: Marketplace con búsqueda avanzada y categorías.** Más completo, pero sobre-engineered para el estado actual del proyecto.

## 3) Criterios de decision

- **Autonomía del participante:** puede descubrir y unirse sin depender de terceros.
- **Consistencia con el modelo de datos:** aprovechar `evento_usuario` existente; el rol por defecto es `Participante`.
- **Reversibilidad:** el usuario puede abandonar, y el organizador sigue pudiendo añadir Jurado por invitación (flujo independiente).
- **Coste de implementación:** mínimo impacto en capas existentes (Repository → Service → Controller).

## 4) Decision tomada

Se elige la **Opción B**. Se añaden tres endpoints nuevos al `EventoController`:

- `GET /api/Eventos/disponibles?userId={id}` — devuelve eventos en los que el usuario NO está inscrito.
- `POST /api/Eventos/{eventoId}/unirse?userId={id}` — crea la relación `EventoUsuario` con rol `Participante`.
- `DELETE /api/Eventos/{eventoId}/abandonar?userId={id}` — elimina la relación.

En el frontend, `DashboardPage` pasa de lista única a dos tabs ("Mis Eventos" / "Unirse a un Evento"). El botón "Abandonar" se coloca dentro de la vista del evento (`OrganizerDashboard`) para evitar abandonos accidentales desde la lista, y se protege con un modal de confirmación.

El flujo de PIN (`JoinEventoPorCodigoAsync`) se conserva sin modificar para compatibilidad con el flujo de Jurado por invitación.

## 5) Consecuencias

- **Positivas:**
    - El Participante es autónomo: descubre, se une y abandona sin coordinación externa.
    - Los tres nuevos métodos tienen tests unitarios con Moq (9/9 en verde).
    - La separación de tabs en el dashboard mejora la claridad entre "mis eventos" y "explorar".
- **Negativas / trade-offs:**
    - `GET /disponibles` devuelve todos los eventos sin filtrar por estado; si hay muchos eventos finalizados, el listado puede ser ruidoso. Pendiente filtrar por estado en un sprint futuro.
    - Unirse registra siempre como `Participante`; no cubre el caso de un Jurado que quiera unirse manualmente (para eso sigue existiendo el flujo de invitación).
- **Riesgos y mitigaciones:**
    - Doble inscripción: mitigado por `GetAsync` en `UnirseAEventoAsync` que lanza excepción si ya existe relación.
    - Abandono accidental: mitigado con modal de confirmación en la vista del evento.

## 6) Evidencia

- `Backend/Votify.API/Services/EventoService.cs` — métodos `GetEventosDisponiblesAsync`, `UnirseAEventoAsync`, `AbandonarEventoAsync`.
- `Backend/Votify.Tests/EventoServiceTests.cs` — 4 tests nuevos.
- `Frontend/src/pages/DashboardPage.tsx` — toggle de tabs.
- `Frontend/src/pages/OrganizerDashboard.tsx` — botón Abandonar + modal.
- AI Usage Log: `docs/ai-logs/Sprint-S3-ai-log.md`.
