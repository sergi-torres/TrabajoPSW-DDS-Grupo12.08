# ADR-009: Implementación de Síntesis de Comentarios mediante IA Generativa (Gemini)

**Fecha:** 06-05-2026  
**Sprint:** S3  
**Estado:** Aprobado

## 1) Contexto

Votify recopila una gran cantidad de feedback cualitativo tanto de jurados como del público. Para los participantes, procesar decenas de comentarios individuales puede ser abrumador. Se requiere una funcionalidad que resuma automáticamente los puntos clave (fortalezas y áreas de mejora) y proporcione un análisis de sentimiento general, permitiendo una retroalimentación accionable y rápida.

## 2) Opciones consideradas

- **Opción A: Análisis manual por el organizador.** Inviable por escalabilidad.
- **Opción B: Procesamiento de Lenguaje Natural (NLP) tradicional.** Basado en palabras clave o librerías estáticas. Bajo costo pero baja calidad semántica en comentarios complejos o contradictorios.
- **Opción C: IA Generativa (LLMs) con Salida Estructurada.** Utilizar modelos como Google Gemini para generar resúmenes en formato JSON basados en prompts técnicos específicos.

## 3) Criterios de decisión

- **Calidad Semántica:** Capacidad para entender ironía, tecnicismos y matices.
- **Estructura de Datos:** Necesidad de que la respuesta sea un JSON válido para su visualización en la UI.
- **Mantenibilidad:** Uso de patrones de diseño que permitan cambiar el modelo o la lógica de resumen sin romper el sistema.
- **Costo y Cuota:** Disponibilidad de una capa gratuita o accesible para el desarrollo.

## 4) Decisión tomada

Se elige la **Opción C**, utilizando la API de **Google Gemini** (específicamente `gemini-2.5-flash`). 

Para garantizar la robustez técnica, se implementa:
1.  **Patrón Strategy:** Una base `SintesisStrategyBase` con implementaciones concretas para `Jurado` (foco técnico) y `Público` (foco en recepción general).
2.  **Salida Estructurada (JSON Schema):** Se obliga al modelo a responder bajo un esquema estricto (fortalezas, mejoras, sentimiento) mediante la funcionalidad nativa de Gemini.
3.  **Persistencia:** Las síntesis se guardan en la tabla `sintesis_comentarios` para evitar llamadas redundantes a la API y permitir el histórico.
4.  **Enriquecimiento de Datos:** La IA procesa tanto los comentarios de votos individuales como los comentarios cualitativos globales.

## 5) Consecuencias

- **Positivas:**
	- Valor diferencial masivo para los participantes.
	- Feedback estructurado y fácil de consumir.
	- Arquitectura flexible que permite añadir nuevos tipos de síntesis fácilmente.
- **Negativas / trade-offs:**
	- Dependencia de la API de Google y sus límites de frecuencia.
	- Latencia en la generación (mitigada mediante persistencia y estados de carga en UI).
- **Riesgos y mitigaciones:**
	- Alucinaciones de la IA: Mitigado con prompts restrictivos y limitando el resumen a los datos presentes en los comentarios proporcionados.
	- Errores de cuota (429): Mitigado permitiendo configurar el modelo mediante variables de entorno (`GEMINI_MODEL`).

## 6) Evidencia

- Backend: `SintesisComentariosService.cs`, `GeminiClient.cs` y estrategias en `Services/Strategies/Sintesis/`.
- Frontend: Componentes `SintesisDisplay.tsx` y `SintesisGenerarButton.tsx`.
- Tests: `SintesisServiceTests.cs` y `SintesisStrategyTests.cs`.

IA: Razonamiento y generación de lógica de estrategias asistida por Gemini CLI para asegurar el cumplimiento del patrón Strategy.
