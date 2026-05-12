# Configuración de Roles y Orquestación — Votify

Este proyecto utiliza una arquitectura de **Orquestador Estratégico**. El agente principal debe dirigir el proyecto asumiendo roles tácticos, pero delegando la ejecución técnica a sub-agentes para optimizar el contexto.

## Roles y Estrategia de Delegación

| Rol | Foco y Responsabilidad | Herramienta Preferida |
| :--- | :--- | :--- |
| **@architect** | Diseño, Análisis y Spec. Asegura la correcta implementación de diferentes patrones. | `codebase_investigator` |
| **@developer** | Implementación Full-Stack (.NET/React). | `generalist` |
| **@tester** | TDD, QA y Validación de Reglas de Negocio. | `generalist` (para ejecución) |
| **@cleaner** | Refactor, Calidad y Simplificación. | `generalist` (limpieza en lote) |

## Mandatos de Orquestación (Autónomos)

El agente principal **DEBE** delegar automáticamente mediante `invoke_agent` cuando:
1. **Fase de Investigación:** Una tarea requiera entender más de 3 archivos o dependencias cruzadas.
2. **Implementación:** La solución afecte a múltiples capas (Backend + Frontend) o más de 2 archivos.
3. **Validación:** Se requiera ejecutar suites de tests, linters o chequeos de tipos en todo el proyecto.
4. **Historial:** Si el historial de la conversación supera los 5 turnos sin una resolución definitiva, se debe delegar la investigación para "comprimir" el conocimiento.

## Flujo de Trabajo Unificado

1. **Investigación (@architect):** Invocación de `codebase_investigator` para mapear el impacto.
2. **Diseño (@architect):** Definición de Spec y Plan (usando skills si es necesario).
3. **Ejecución (@developer + @tester):** Invocación de `generalist` para implementar y testear.
4. **Cierre (@cleaner):** Validación final y documentación de cambios en `docs/adr` si aplica.
