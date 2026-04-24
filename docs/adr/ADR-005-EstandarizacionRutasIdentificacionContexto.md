# ADR-005: Estandarización de Rutas e Identificación de Contexto mediante Parámetros de URL

**Fecha:** 20-04-2026  
**Sprint:** S2  
**Estado:** Aprobado

## 1) Contexto

Durante el desarrollo del MVP del Sprint 1, la aplicación utilizaba `localStorage` como mecanismo principal para almacenar el ID del evento activo y sincronizar la navegación entre componentes. Sin embargo, este enfoque ha demostrado ser frágil y poco profesional por los siguientes motivos:
- **Pérdida de estado:** Al recargar la página (`F5`), el contexto del evento dependía exclusivamente del almacenamiento local, lo que provocaba errores de "undefined" en las llamadas a la API si el valor no estaba presente.
- **Imposibilidad de acceso directo:** No se podían compartir enlaces directos a secciones específicas de un evento (ej. Dashboard del evento 1 o Invitaciones del evento 2).
- **Inconsistencia de UI:** Los componentes (como la Sidebar) generaban links inconsistentes al no tener una fuente de verdad única en la URL.

## 2) Opciones consideradas

- **Opción A (No hacer nada):** Continuar usando `localStorage` y añadir comprobaciones manuales en cada componente para evitar errores de "undefined".
- **Opción B (Context API puro):** Usar un Contexto de React para el evento. Soluciona una parte pero no soluciona el problema de las recargas de página.
- **Opción C (Rutas Dinámicas con Parámetros):** Adoptar el estándar utilizando parámetros de ruta (ej. `/eventos/:eventoId/...`) como la fuente de verdad primaria para identificar el recurso.

## 3) Criterios de decision

- **Mantenibilidad:** Facilidad para entender a qué recurso estamos accediendo.
- **Robustez:** La aplicación no debe romperse al recargar o al navegar directamente.
- **UX Profesional:** Los enlaces deben ser compartibles y semánticos.
- **Bajo Acoplamiento:** Los componentes no deben depender de un estado global oculto (`localStorage`) si pueden obtener la info de la URL.

## 4) Decision tomada

Se elige la **Opción C**. A partir de ahora, todas las vistas que dependan de un evento específico deben estar anidadas bajo el patrón `/eventos/:eventoId`. 

Se ha refactorizado la navegación de los organizadores para que el clic en una tarjeta de evento redirija a `/eventos/${id}`. La Sidebar y las nuevas páginas (como `InvitarJuradoPage`) obtendrán el ID del evento mediante el hook `useParams()` de `react-router-dom`. Se mantiene un mecanismo de "fallback" hacia `localStorage` en la Sidebar solo para compatibilidad con componentes que aún no han sido migrados, pero la URL es la prioridad.

## 5) Consecuencias

- **Positivas:** 
    - Mayor robustez ante recargas de página.
    - Soporte para navegación por historial (adelante/atrás) sin romper el contexto.
    - Posibilidad de implementar bookmarking y compartición de links de gestión.
- **Negativas / trade-offs:** 
    - Requiere una refactorización de las rutas existentes en `App.jsx`.
    - Obliga a pasar el `eventoId` a través de los enlaces de navegación.
- **Riesgos y mitigaciones:** 
    - El riesgo de romper rutas antiguas se mitiga mediante una migración gradual y el uso del "fallback" temporal en la Sidebar.

## 6) Evidencia

- Implementado en la User Task #3797 (Votaciones con jurado autenticado).
- Archivos modificados: `App.jsx`, `InvitarJuradoPage.jsx`, `DashboardPage.jsx`, `EventSidebar.jsx`.

IA: Razonamiento asistido por Gemini CLI para identificar la causa raíz de los errores de `undefined` durante el Sprint 2.
