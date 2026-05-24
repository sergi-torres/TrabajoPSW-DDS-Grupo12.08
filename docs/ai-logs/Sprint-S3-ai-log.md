# AI Usage Log - Sprint 3

## 1) Herramientas usadas

- **Herramienta/modelo:** Claude Code (claude-sonnet-4-6) — Anthropic; Gemini CLI (gemini-2.5-flash) — Google
- **Para qué se usó:**
    - Diseño e implementación del patrón Strategy para la síntesis de comentarios con Gemini (UT 3387).
    - Generación de la lógica de ranking de categorías y componente de visualización en el dashboard del participante (UT 3786).
    - Implementación de aceleradores de teclado y búsqueda global (UT 4101).
    - Redacción del contenido de ayuda contextual y textos de la guía de usuario (UT 4100).

## 2) Prompts clave (copiar/pegar)

- **Prompt 1 (UT 3387 — Síntesis IA):** "Actúa como desarrollador .NET 9. Necesito implementar el patrón Strategy para síntesis de comentarios con Gemini. Hay dos tipos: jurado (foco técnico) y público (foco en experiencia). La respuesta debe ser un JSON estricto con `fortalezas[]`, `mejoras[]`, `sentimiento` y `resumen_general`. El cliente HTTP ya existe en `GeminiClient.cs`. Muéstrame cómo estructurar `SintesisJuradoStrategy` y `SintesisPublicoStrategy` heredando de una base común, y cómo pasar el JSON schema a Gemini para forzar la salida estructurada."

- **Prompt 2 (UT 3786 — Ranking de categorías):** "Tengo un endpoint `/categorias/{id}/ranking` que devuelve proyectos ordenados por puntuación. Necesito un componente React + TypeScript `RankingCategoria.tsx` que muestre posición, nombre del proyecto y puntuación, con medallas visuales para el top 3 y usando el color del evento desde `EventContext.userColor`. El componente se monta dentro del dashboard del participante."

- **Prompt 3 (UT 4101 — Aceleradores de teclado):** "Necesito atajos de teclado en la SPA React: `Ctrl+K` para abrir búsqueda global, `Escape` para cerrar modales y panels, y navegación con flechas en listas de proyectos. No hay ningún sistema de gestión de teclas actualmente. ¿Qué patrón conviene más — un hook `useKeyboardShortcuts` centralizado o `useEffect` local por componente? Justifica la decisión y muestra el hook si lo recomiendas."

- **Prompt 4 (UT 4100 — Ayuda contextual):** "Genera el contenido de ayuda contextual para las 3 vistas principales de Votify: (1) Panel del Organizador — crear categorías y activar votación; (2) Panel del Jurado — evaluar proyectos por criterios con peso; (3) Panel del Participante — ver ranking y feedback generado por IA. Máximo 3 bullets por vista, tono instructivo y directo, en español. Se mostrará como tooltip/panel de ayuda dentro de la interfaz."

## 3) Salidas relevantes (resumen corto)

- **Prompt 1:** Propuso `SintesisStrategyBase` abstracta con `BuildPrompt()` y `GetSchema()` a sobreescribir; las estrategias concretas devuelven prompts distintos y el mismo schema JSON. `SintesisStrategyFactory` selecciona la estrategia según el tipo recibido.
- **Prompt 2:** Componente con `useEffect` + fetch en mount, array mapeado a filas con iconos de medalla (`🥇🥈🥉` o número), y clase CSS dinámica ligada a `userColor`. Propuso también un skeleton loader mientras carga.
- **Prompt 3:** Recomendó un hook centralizado `useKeyboardShortcuts(shortcuts: Record<string, () => void>)` registrado en el componente raíz, con limpieza del listener en el `return` del `useEffect`. Incluyó ejemplos para `Ctrl+K` y `Escape`.
- **Prompt 4:** Generó bloques de texto para las 3 vistas con bullets concisos; algunos textos usaban terminología genérica que no coincidía con la nomenclatura interna del proyecto (p. ej., "evaluación" en lugar de "voto de jurado").

## 4) Qué aceptamos y qué rechazamos (mínimo 3 ejemplos)

- **Aceptado:** La estructura de `SintesisStrategyBase` con `BuildPrompt()` y `GetSchema()` abstractos — encaja limpiamente con el patrón Strategy ya presente en el proyecto y facilita añadir nuevos tipos de síntesis en el futuro.
- **Aceptado:** El hook `useKeyboardShortcuts` centralizado en lugar de `useEffect` dispersos — evita duplicar listeners y centraliza la gestión de conflictos entre atajos.
- **Aceptado parcialmente:** El skeleton loader del componente de ranking — se simplificó a un spinner estándar del proyecto en lugar del skeleton personalizado propuesto, para mantener coherencia visual.
- **Rechazado:** El uso de emojis de medalla directamente en JSX (`🥇🥈🥉`) — se sustituyó por los iconos SVG del design system del proyecto para cumplir las guías de diseño.
- **Corregido:** Los textos de ayuda contextual (Prompt 4) usaban "evaluación" y "puntuación" de forma genérica; se reescribieron para usar la terminología exacta del dominio ("voto de jurado", "baremo", "criterio con peso").

## 5) Cómo lo verificamos

- [x] Tests unitarios — `SintesisServiceTests.cs` y `SintesisStrategyTests.cs`: 6/6 en verde; `EventoServiceTests.cs`: 9/9 en verde.
- [x] Compilación backend — `dotnet build` sin errores tras integrar las estrategias.
- [x] Compilación TypeScript — `npx tsc --noEmit` sin errores nuevos en los componentes añadidos.
- [x] Consulta a la documentación oficial — schema de salida estructurada de Gemini validado contra la documentación de Google AI Studio.
- [x] Revisión por pares — los textos de ayuda contextual revisados y corregidos por el equipo antes de integrarse.

## 6) Resultado final / decisión humana

El equipo adoptó el patrón Strategy para la síntesis IA tal como fue propuesto, con los ajustes de nomenclatura del dominio. El hook `useKeyboardShortcuts` se integró en el componente raíz. Los textos de ayuda se corrigieron manualmente antes de integrarlos. Las decisiones arquitectónicas de la síntesis quedan documentadas en `ADR-009`. El ranking de categorías se incorporó al dashboard del participante como nueva pestaña dentro del hub (ver `ADR-010`).
