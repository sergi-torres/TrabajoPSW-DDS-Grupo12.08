# ADR-006: Centralización del Estado del Evento mediante Contexto Global

**Fecha:** 21-04-2026  
**Sprint:** S2  
**Estado:** Aprobado

## 1) Contexto

Anteriormente, la información del evento seleccionado (ID, nombre) y el rol del usuario se gestionaban de forma dispersa mediante `localStorage`. Esto causaba varios problemas críticos:
1. **Inconsistencia Visual:** Los componentes reactivos (como la Sidebar o el Header) no siempre detectaban los cambios de estado inmediatamente, lo que provocaba que los colores de la marca cambiaran erráticamente durante la navegación.
2. **Redundancia:** Las páginas debían leer y parsear manualmente `localStorage` en múltiples puntos del código.
3. **Mantenibilidad:** No existía una "fuente de verdad única", lo que dificultaba la depuración del estado del evento activo.

## 2) Opciones consideradas

- **Opción A (No hacer nada):** Seguir usando `localStorage` directamente en cada componente.
- **Opción B (Contexto Global):** Crear un `EventContext` de React para centralizar el estado y proporcionar métodos de actualización.
- **Opción C (Redux u otras):** Implementar una librería de gestión de estado externa.

## 3) Criterios de decisión

- **Consistencia:** El estado debe ser reactivo para toda la aplicación.
- **Simplicidad:** No añadir dependencias externas pesadas si el Core de React es suficiente.
- **Mantenibilidad:** Reducir la lógica duplicada en los componentes UI.

## 4) Decision tomada

Se elige la **Opción B (Contexto Global)**. La implementación de un `EventProvider` permite centralizar el ID del evento, el nombre y el rol, derivando automáticamente el color de la interfaz. Se mantiene una "persistencia híbrida" donde el contexto sincroniza los valores con `localStorage` solo para evitar la pérdida de datos al recargar la página (F5), pero los componentes consumen exclusivamente el contexto.

## 5) Consecuencias

- **Positivas:**
  - UI 100% consistente: el cambio de rol o evento se refleja al instante en colores, iconos y navegación.
  - Código más limpio: eliminación de llamadas manuales a `localStorage` en páginas y componentes.
  - Facilidad para escalar: centraliza la lógica de "qué color corresponde a qué rol".
- **Negativas / trade-offs:**
  - Añade una pequeña capa de abstracción al árbol de componentes.
- **Riesgos y mitigaciones:**
  - Desincronización contexto-storage: se mitiga envolviendo las actualizaciones en una sola función `setEventContext` que gestiona ambos niveles.

## 6) Evidencia

- Nuevo archivo: `Frontend/src/context/EventContext.jsx`
- Refactorización de: `App.jsx`, `EventSidebar.jsx`, `DashboardPage.jsx`, `OrganizerDashboard.jsx`.
