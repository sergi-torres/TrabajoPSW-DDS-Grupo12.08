# ADR-008: Migración del Frontend a TypeScript para Robustez Arquitectónica

**Fecha:** 26-04-2026  
**Sprint:** S2  
**Estado:** Aprobado

## 1) Contexto

A medida que el frontend de Votify crece en complejidad, especialmente con la implementación de lógica multicriterio y múltiples roles, el uso de JavaScript puro (JS/JSX) ha presentado varios retos:
- **Dificultad en Patrones de Diseño:** La implementación de patrones como *Factory Method* y *Strategy* requiere interfaces claras que JS no garantiza en tiempo de compilación.
- **Inconsistencia con el Backend:** El backend está desarrollado en C# (fuertemente tipado), y la falta de tipos en el frontend provocaba errores de "propiedad no encontrada" al consumir APIs.
- **Mantenibilidad:** Los errores de ejecución (runtime) por valores nulos o tipos incorrectos aumentaban el tiempo de depuración.

## 2) Opciones consideradas

- **Opción A: Continuar con JavaScript.** Seguir usando JS/JSX y confiar en tests y JSDoc para la documentación de tipos.
- **Opción B: Migración Progresiva a TypeScript (Híbrida).** Introducir TS solo en archivos nuevos o críticos, manteniendo el resto en JS.
- **Opción C: Migración Completa (100%) a TypeScript.** Convertir toda la base de código a `.ts` y `.tsx` para asegurar una fuente de verdad única y tipos estrictos en toda la aplicación.

## 3) Criterios de decisión

- **Robustez:** Capacidad de capturar errores en tiempo de compilación.
- **Calidad Arquitectónica:** Facilidad para implementar y mantener patrones de diseño complejos.
- **DX (Developer Experience):** Autocompletado preciso y documentación viva mediante interfaces.
- **Consistencia:** Alineación con el ecosistema fuertemente tipado del backend.

## 4) Decisión tomada

Se elige la **Opción C (Migración Completa)**. Se ha transformado el 100% de la base de código del frontend a TypeScript. Esta decisión se toma para habilitar de forma segura el uso del patrón *Factory Method* en la creación de eventos y *Strategy* en las evaluaciones, asegurando que los objetos de dominio (Evento, Proyecto, Voto) tengan una estructura garantizada.

Se ha configurado un entorno estricto con Vite y `tsc` para evitar la acumulación de deuda técnica y asegurar que cualquier cambio en el modelo de datos del backend sea detectado inmediatamente en el frontend.

## 5) Consecuencias

- **Positivas:**
	- Reducción drástica de errores de tipo y nulos en producción.
	- Refactorización segura: el compilador avisa de todos los puntos afectados al cambiar una interfaz.
	- Documentación implícita: las interfaces en `src/types/` sirven como especificación del dominio.
- **Negativas / trade-offs:**
	- Esfuerzo inicial de migración de 43+ archivos.
	- Curva de aprendizaje para miembros del equipo no familiarizados con TS.
- **Riesgos y mitigaciones:**
	- Abuso del tipo `any`: Mitigado mediante la revisión de código y la definición de interfaces centrales en `index.ts`.

## 6) Evidencia

- Configuración en `Frontend/tsconfig.json` y `Frontend/vite.config.ts`.
- Modelos de dominio en `Frontend/src/types/`.
- Implementación de `EventFactory.ts` en `Frontend/src/models/`.
- Repositorio limpio de archivos `.js` y `.jsx`, sustituidos íntegramente por `.ts` y `.tsx`.

IA: Migración asistida y validada mediante Gemini CLI para asegurar el cumplimiento del build.
