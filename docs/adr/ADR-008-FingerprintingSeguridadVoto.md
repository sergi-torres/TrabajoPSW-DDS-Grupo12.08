# ADR-008: Implementación de Fingerprinting para Unicidad de Voto y Seguridad

**Fecha:** 30-04-2026  
**Sprint:** S2  
**Estado:** Aprobado

## 1) Contexto

Votify permite el voto público (no autenticado) en eventos. Para garantizar la integridad de los resultados, es crítico:
- Prevenir el voto múltiple de la misma persona en la misma categoría.
- No obligar al registro formal de usuarios públicos para maximizar la participación.
- Identificar de forma persistente y única el dispositivo del votante sin depender únicamente de cookies o IPs, que son fácilmente manipulables o compartidas.

## 2) Opciones consideradas

- **Opcion A: Restricción por IP.** Simple de implementar pero ineficaz en redes compartidas (mismo router = misma IP) y fácil de saltar con VPN.
- **Opcion B: Cookies/LocalStorage.** Muy sencillo, pero se borran fácilmente limpiando el historial del navegador.
- **Opcion C: Fingerprinting de Dispositivo.** Generar un hash único basado en características del hardware y navegador (resolución, fuentes, plugins, canvas rendering). Mucho más persistente y difícil de falsear.

## 3) Criterios de decision

- **Fiabilidad:** Capacidad para identificar el mismo dispositivo en diferentes sesiones.
- **Fricción:** No debe requerir acciones del usuario (login).
- **Seguridad:** Resistencia a intentos básicos de duplicación de votos.
- **Privacidad:** No debe recolectar PII (Personal Identifiable Information) directamente.

## 4) Decision tomada

Se elige la **Opción C**, utilizando la librería **FingerprintJS** en el frontend para generar un identificador único por dispositivo. 
- El hash se envía al backend en cada voto público.
- El backend mantiene una tabla `registro_votos_publicos` que vincula `(idevento, idcategoria, identificador_hash)`.
- Se implementa un fallback en LocalStorage por si el script de fingerprinting es bloqueado por el navegador.
- Esta mejora se complementa con una validación en el `VotoService` que impide registrar más de un voto por hash/categoría.

## 5) Consecuencias

- **Positivas:**
    - Garantía de "un dispositivo, un voto" sin necesidad de registro.
    - Persistencia ante reinicios de router o cambios de red.
    - Mejora la confianza del organizador en los resultados del voto popular.
- **Negativas / trade-offs:**
    - Dependencia de una librería externa.
    - Posibilidad teórica de colisiones de hash (mínima con FPJS).
- **Riesgos y mitigaciones:**
    - Bloqueo por navegadores ultra-privados (Brave, extensiones anti-tracking). Mitigado con el fallback a LocalStorage.

## 6) Evidencia

- Implementación del hook `useFingerprint.ts` en el frontend.
- Tests unitarios `useFingerprint.test.ts` y `VotoServiceTests.cs`.
- Tabla `registro_votos_publicos` en el esquema de la base de datos.
