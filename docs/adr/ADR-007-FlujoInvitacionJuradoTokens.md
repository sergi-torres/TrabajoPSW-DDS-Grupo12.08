# ADR-007: Flujo de Onboarding de Jurados basado en Tokens de Invitación

**Fecha:** 21-04-2026  
**Sprint:** S2  
**Estado:** Aprobado

## 1) Contexto

Votify necesitaba un sistema seguro y profesional para añadir jurados expertos a los eventos. Los retos principales eran:
1. **Seguridad:** Evitar que cualquier usuario pudiera asignarse roles de poder en un evento sin permiso del organizador.
2. **Onboarding:** Facilitar la entrada a personas externas que aún no tienen cuenta en la plataforma.
3. **Control:** El organizador debe poder trackear quién ha aceptado y quién no, además de poder reenviar invitaciones.

## 2) Opciones consideradas

- **Opción A (Asignación Directa):** El organizador añade el email y el usuario ya es jurado (requiere que el usuario ya exista y no garantiza consentimiento).
- **Opción B (Código PIN Especial):** Un código que el jurado introduce manualmente.
- **Opción C (Invitaciones por Token):** Envío de email con link único vinculado a una tabla de persistencia temporal.

## 3) Criterios de decisión

- **Seguridad:** El acceso debe estar blindado por un secreto (token) de un solo uso.
- **Experiencia de Usuario (UX):** El flujo debe ser fluido ("clic y entrar").
- **Trazabilidad:** Posibilidad de auditar y gestionar invitaciones pendientes.

## 4) Decision tomada

Se elige la **Opción C (Invitaciones por Token)**. Se implementa una tabla `invitaciones_pendientes` en Supabase que almacena el email, el evento y un GUID único. Este token se envía mediante **Resend** en un email profesional. Al hacer clic, el usuario llega a una vista de onboarding que inyecta el token en el proceso de Auth, asociándolo automáticamente al evento con el rol de Jurado tras el login o registro.

## 5) Consecuencias

- **Positivas:**
  - Seguridad robusta: solo quien recibe el email puede convertirse en jurado.
  - Flujo premium: onboarding automático sin necesidad de que el usuario busque el evento por código.
  - Gestión centralizada: permite reenviar invitaciones y eliminarlas físicamente de la base de datos.
- **Negativas / trade-offs:**
  - Dependencia de un servicio de terceros (Resend).
  - Requiere limpieza periódica de la tabla de invitaciones expiradas.
- **Riesgos y mitigaciones:**
  - Suplantación si el email es interceptado: se mitiga haciendo los tokens de un solo uso (se borran al ser consumidos).

## 6) Evidencia

- Tabla BD: `invitaciones_pendientes`
- Backend: `InvitacionPendienteRepository.cs`, `ResendEmailService.cs`, `JuradoService.cs`.
- Frontend: `AcceptInvitePage.jsx`, integración en `authApi.js`.
