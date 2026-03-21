# Plantilla de AI Usage Log

Este documento es una plantilla de registro de uso de IA generativa por sprint (un "diario de auditoria ligero") pensada para que el equipo deje constancia, de forma clara y reproducible, de como influyo la IA en el trabajo real y que parte del resultado final corresponde a decisiones humanas. Propone guardarlo como un fichero Markdown dentro del repositorio (por ejemplo en `/docs/ai-logs/`) y, si en un sprint no se usa IA, deja indicado que se declare explicitamente.

La estructura guia al equipo para narrar el "rastro" completo: que herramientas/modelos se usaron y para que, cuales fueron los prompts realmente determinantes (no todos, solo los que condicionaron el resultado), que salidas o propuestas genero la IA, y -lo mas importante- que se acepto y que se rechazo o corrigio, explicando el motivo (errores, trade-offs, decisiones de diseno, etc.).

Ademas, obliga a documentar como se verifico lo propuesto (tests, mediciones/experimentos, contraste con documentacion tecnica, revision por pares) y a cerrar con el resultado final / decision humana y su trazabilidad en el repo (PR/commit/ADR). En conjunto, funciona como una practica de transparencia y calidad: no es "un listado de prompts", sino un registro de uso responsable, validacion y rendicion de cuentas.

---

**Ubicacion sugerida en el proyecto:** `/docs/ai-logs/Sprint-SX-ai-log.md`

> Si no se uso IA en el sprint: anadir "No se uso IA generativa en este sprint".

# AI Usage Log - Sprint SX

## 1) Herramientas usadas

- **Herramienta/modelo:** (p. ej., ChatGPT, Copilot...)
- **Para que se uso (2-3 bullets):** ...

## 2) Prompts clave (copiar/pegar) + enlace

Incluye 3-5 prompts que hayan influido en el resultado final (no hace falta todos los prompts, pero si los mas importantes; pueden ser mas de 5).

- **Prompt 1:** "..."
- **Prompt 2:** "..."
- **Prompt 3:** "..."

## 3) Salidas relevantes (resumen corto)

Que propuso la IA (1-2 bullets por prompt).

## 4) Que aceptamos y que rechazamos (minimo 3 ejemplos)

- **Aceptado:** ... por que ...
- **Rechazado/corregido:** ... por que ... (error detectado, patron innecesario, mal trade-off, etc.)

## 5) Como lo verificamos

Marca al menos una:

- [ ] Tests unitarios (indicar cuales)
- [ ] Experimento / medicion (que, como, resultado)
- [ ] Consulta a la documentacion oficial / fuente tecnica (que fuente?)
- [ ] Revision por pares (que se reviso y conclusion)

## 6) Resultado final / decision humana

Que decidio el equipo finalmente y como quedo reflejado en el repo (PR/commit/ADR).
