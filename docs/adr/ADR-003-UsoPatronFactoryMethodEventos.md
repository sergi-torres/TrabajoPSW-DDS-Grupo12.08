# ADR-003: Uso del patrón Factory Method para la creación de eventos

**Fecha:** 21-03-2026  
**Sprint:** S1  
**Estado:** Aprobado

## 1) Contexto

El sistema Votify debe soportar múltiples tipos de eventos (Hackaton, Innovation Fair, Small Events), cada uno con sus propias reglas de negocio, validaciones y estructuras de datos específicas (aunque compartan una base común). La creación directa de estos objetos en los servicios de aplicación (como `CreateEventService`) generaría un acoplamiento fuerte y violaría el principio de Responsabilidad Única (SRP), dificultando la extensión del sistema cuando se requieran nuevos tipos de eventos en el futuro.

## 2) Opciones consideradas

- **Opción A: Implementar el patrón Factory Method.** Definir una clase abstracta creadora con un método de fábrica que las subclases concretas implementen para instanciar el tipo de evento específico.
- **Opción B: Uso de lógica condicional (switch/if) en el servicio.** Manejar la instanciación dentro de un método en el servicio principal basándose en un discriminador de tipo de evento.
- **Opción C: Patrón Abstract Factory.** Crear una interfaz para familias de objetos relacionados (por ejemplo, si cada evento también tuviera una familia de reportes o validadores específicos).

## 3) Criterios de decisión

- **Extensibilidad:** Facilidad para añadir nuevos tipos de eventos sin modificar el código existente (Principio Open/Closed).
- **Desacoplamiento:** El código que solicita la creación no debe conocer las clases concretas de los eventos.
- **Mantenibilidad:** Centralizar la lógica de instanciación para evitar duplicidad y facilitar cambios.
- **Simplicidad:** No sobre-diseñar si los requerimientos no lo exigen.

## 4) Decision tomada

Se elige la **Opción A (Factory Method)**. Esta decisión permite que el sistema sea altamente extensible. Al delegar la responsabilidad de la instanciación a clases específicas (`HackatonEventCreator`, `InnovationFairEventCreator`, `SmallEventCreator`), el servicio de creación solo interactúa con la abstracción `EventCreator`. Esto cumple con el principio de Inversión de Dependencia y permite que añadir un nuevo tipo de evento solo requiera crear una nueva clase `Event` y su correspondiente `EventCreator`.

La Opción C se descartó por ser demasiado compleja para el estado actual del proyecto, y la Opción B se descartó por violar el principio Open/Closed y dificultar el mantenimiento a largo plazo.

## 5) Consecuencias

- **Positivas:**
	- Cumplimiento de los principios SOLID.
	- Facilita las pruebas unitarias al poder mockear los creadores.
	- Código más limpio y organizado por responsabilidades.
- **Negativas / trade-offs:**
	- Mayor número de clases en el proyecto (una clase creadora por cada tipo de evento).
	- Ligero incremento en la complejidad inicial del diseño.
- **Riesgos y mitigaciones:**
	- Riesgo de "explosión de clases": Mitigado manteniendo la jerarquía clara y solo creando subclases cuando realmente existan diferencias de comportamiento o estructura.

## 6) Evidencia

- Estructura de archivos en `Backend/Votify.API/Factories/`: `EventCreator.cs`, `HackatonEventCreator.cs`, etc.
- Implementación de modelos en `Backend/Votify.API/Models/Domain/`: `Event.cs`, `HackatonEvent.cs`, `InnovationFairEvent.cs`, `SmallEvent.cs`.
