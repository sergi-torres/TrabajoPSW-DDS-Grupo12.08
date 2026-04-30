# AI Usage Log - Sprint 2 (Documentación Arquitectónica)

## 1) Herramientas usadas

- **Herramienta/modelo:** Gemini CLI
- **Para que se uso (2-3 bullets):**
    - Redacción de Architectural Decision Records (ADR) basados en el estado actual del sistema.
    - Creación de tests unitarios para el Frontend y el Backend

## 2) Prompt clave (Master Prompt)

- **Prompt 1:** Actúa como un Arquitecto de Software. Analiza la implementación de seguridad para el voto público (fingerprinting, almacenamiento en BD y validaciones en el servicio) y redacta el `ADR-008` siguiendo la plantilla. La decisión debe centrarse en el uso de `FingerprintJS` para garantizar la unicidad del voto sin login. Justifica por qué se eligió sobre cookies o IP, detalla las consecuencias y asegura que la evidencia coincida con los archivos actuales (@useFingerprint.ts, @VotoService.cs).

## 3) Salidas relevantes (resumen corto)

- **Salida:** Generación del archivo `docs/adr/ADR-008-FingerprintingSeguridadVoto.md`, estructurando el contexto técnico, las alternativas evaluadas (IP vs. Cookies) y la justificación de la opción elegida.

## 4) Que aceptamos y que rechazamos

- **Aceptado/Corregido:** Se aceptó la estructura técnica pero se corrigió la sección de "Evidencia" para que referenciara explícitamente la tabla `registro_votos_publicos` y los tests de `VotoService`, asegurando que el ADR no fuera solo teórico sino que estuviera anclado al código real.

## 5) Como lo verificamos

- [x] Consulta a la documentacion oficial / fuente técnica (Uso de la plantilla de ADR del proyecto)
- [x] Revision por pares (Validación humana de la coherencia de la decisión)

## 6) Resultado final / decision humana

El equipo formalizó la decisión de usar Fingerprinting como estándar de seguridad para el voto popular. Se eliminó la documentación obsoleta sobre la migración a TypeScript (ya completada) para mantener el histórico de ADRs limpio y enfocado en decisiones de diseño activas.
