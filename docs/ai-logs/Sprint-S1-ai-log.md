# AI Usage Log — Sprint S1

## 1) Herramientas usadas

- **Herramienta/modelo:** Gemini, Claude, Copilot, Antigravity
- **Para qué se usó (2–3 bullets):**
  - Planificación y refinamiento de requisitos.
  - Arquitectura y diseño del sistema (Backend y Frontend).
  - Generación de lógica de negocio y código boilerplate.

## 2) Prompts clave (copiar/pegar) + enlace

- **Prompt 1:**
  > Estoy implementando el Dashboard principal de eventos en React @Frontend\src\pages\DashboardPage.jsx. Necesito un componente funcional que cargue los eventos desde la API usando el token JWT guardado en localStorage y la ID del usuario. Debe mostrar una lista de componentes EventCard, incluir estado de carga y manejo de errores, y añadir un buscador que filtre los eventos por nombre. Además, quiero que el diseño use únicamente las variables CSS definidas en @Frontend\src\index.css y que siga la @Guia_Diseño.md.
  > *(Sin enlace: Chat en Antigravity)*

- **Prompt 2:**
  > En el service de Event, necesito tener dos métodos que mapeen tanto los baremos como las categorías para que a la hora de crear dichos eventos, utilicen aquellos que se les pase en los dtos, dicho esto utiliza los dtos para la generación de los métodos y explícame posteriormente como enlazar el archivo CreateEventService con su correspondiente controller.
  > *(Sin enlace: Chat en Antigravity)*

- **Prompt 3:**
  > Vale mejor para que sea mas óptimo creame en CategoriasRespository una query que obtenga las categorias del eventoId , tambien hazme uno para traer solo los proyectos de cada categoria que tengamos, y despues cambia el service.
  > *(Sin enlace: Chat en Copilot)*

- **Prompt 4:**
  1. Estoy trabajando en un proyecto de ingeniería informática en el que hay una backend y una frontend. He añadido una clase a la backend en la carpeta Domain y la base de datos Supabase que tenemos como "ComentarioCualitativo". Pero luego, también en el backend hay otra carpeta con DTOs y luego en el frontend con APIs. me puedes explicar qué son y que aporta cada cosa, junto al propio Domain? Y de paso cómo almacenar y hacer consultas a la base de datos?
  2. Muéstrame cómo hacer un endpoint completo (DTO → insert → respuesta).
  3. *Adjunto el código de VotosPage* Ya está conectada al proyecto, pero necesito cargar de la api los comentarios dados ciertos ids de votación. Cómo lo hago? En particular quiero que se muestren en "MOCK DATA". ¿Cómo uso la API dada para cargarlos? si tengo que modificar algo dímelo.
  4. Me da problemas, no me reconoce el "Ok" no el "Request", hay algun using que no este usando? El problema es que en "Ok" y en "request" me da los problemas, y estoy usando los using.
  > *(Sin enlace: Chat en Copilot)*

## 3) Salidas relevantes (resumen corto)

- **Prompt 1:**
  - Propuso un componente funcional en React para la carga de eventos mediante `useEffect`, manejando el estado de carga, errores y persistencia local inicial.
  - Sugirió el uso de `useMemo` para el filtrado eficiente por nombre en el cliente.

- **Prompt 2:**
  - Generó los métodos `MapearBaremos` y `MapearCategorias` en C#.
  - En `MapearCategorias`, implementó bucles anidados para gestionar la jerarquía de categorías y pesos de forma relacional.

- **Prompt 3:**
  - Creó las queries específicas en los repositorios de C# y adaptó `mostrarDashboardAsync` para usarlas.
  - Propuso una lógica de refresco de datos agresiva (llamadas constantes a BD).

- **Prompt 4:**
  - Explicó la arquitectura de capas (Domain, DTO, API) y su propósito en la separación de responsabilidades.
  - Generó el código base para el controlador, DTOs y la integración con la API del frontend para los comentarios cualitativos.

## 4) Qué aceptamos y qué rechazamos

- **Prompt 1 Aceptado:** Se aceptó íntegramente ya que la solución estaba alineada con las buenas prácticas de React y respetaba estrictamente la `Guia_Diseño.md` y las variables CSS del proyecto.
- **Prompt 2 Aceptado:** Los métodos de mapeo eran lógicos, resolvían la complejidad de la estructura de datos y funcionaron correctamente tras las pruebas manuales.
- **Prompt 3 Corregido:** Se aceptó la lógica de las queries en los repositorios, pero se **rechazó** el borrado del método que gestionaba el refresco de datos. Se corrigió para que no hiciera llamadas innecesarias a la BD una vez iniciada la votación, ya que las categorías son estáticas en esa fase.
- **Prompt 4 Corregido:** Se aceptó la estructura base y los DTOs, pero se rechazaron detalles de implementación del controlador que daban errores de compilación (usings faltantes o métodos mal nombrados) y se realizó un control humano exhaustivo para ajustar la lógica a la arquitectura del proyecto.

## 5) Cómo lo verificamos

- [ ] Tests unitarios (indicar cuáles)
- [x] Experimento / medición: Pruebas manuales de carga de eventos, creación y visualización de comentarios en el Dashboard.
- [x] Consulta a la documentación oficial: Revisión de la documentación de Supabase C# Client y React hooks.
- [x] Revisión por pares: Pulido iterativo del código del frontend y backend para asegurar coherencia.

## 6) Resultado final / decisión humana

- **Prompt 1:** Implementado y fusionado. Reflejado en la carga principal de eventos del Dashboard.
  - **Commit:** `33db86c`
- **Prompt 2:** Solución aplicada al servicio de creación de eventos.
  - **Commit:** `bb86f63`
- **Prompt 3:** Implementado tras corregir la lógica de refresco para optimizar el rendimiento.
  - **Commit:** `5b3bfcc`
- **Prompt 4:** La base generada permitió estructurar la funcionalidad de comentarios cualitativos, aunque requirió ajustes manuales significativos.
  - **Commit:** `7d7d7b3`
