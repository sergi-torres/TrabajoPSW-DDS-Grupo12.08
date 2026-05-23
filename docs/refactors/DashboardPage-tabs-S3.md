# Refactor: DashboardPage — de lista única a tabs

**Fecha:** 16-05-2026  
**Sprint:** S3  
**Archivo afectado:** `Frontend/src/pages/DashboardPage.tsx`

## Motivación

La página mostraba una lista única de eventos del usuario. Al añadir el flujo de inscripción directa (ADR-010), era necesario separar visualmente "mis eventos" de "eventos disponibles para unirse" para evitar confusión.

## Cambios realizados

| Antes | Después |
|---|---|
| Un `useEffect` que carga `getMisEventos` | Dos cargas independientes: `getMisEventos` al montar, `getEventosDisponibles` lazy (solo al cambiar a la tab "Unirse") |
| `loading` único | `loadingMis` + `loadingDisponibles` separados para no bloquear la tab activa |
| `filteredMis` con `useMemo` | Dos memos: `filteredMis` y `filteredDisponibles`, ambos reactivos al mismo `searchQuery` |
| Encabezado con `<h1>Eventos</h1>` | Toggle de tabs pill-style con estado `activeTab: "mis-eventos" \| "unirse"` |
| Sin lógica de join/abandon en la página | `handleUnirse` y `handleAbandonar` con actualización optimista del estado local |

## Decisiones de diseño

- **Carga lazy de disponibles:** evita una petición innecesaria al cargar la página si el usuario no va a explorar.
- **Actualización optimista:** al unirse o abandonar, el estado local se actualiza inmediatamente sin esperar a recargar desde el servidor, dando feedback visual instantáneo.
- **Buscador compartido:** el mismo input filtra la lista activa; se limpia al cambiar de tab para evitar resultados confusos.

## Sin cambios

- La lógica de navegación al hacer clic en una tarjeta (rol, proyecto, contexto) se preservó íntegra.
- `EventCard` volvió a su forma original (sin `onAbandonar`) — el abandono se gestiona desde dentro del evento.
