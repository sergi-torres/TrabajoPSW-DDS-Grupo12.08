# Guía de Buenas Prácticas

## 1. Gestión de Git (Flujo de Trabajo)

Para mantener un historial limpio y trazable, utilizaremos un flujo basado en ramas por tarea.

### Nombramiento de Ramas
Cada rama debe corresponder a una única **User Task (UT)**. El formato es:
- `feat/[ID-UT]-[descripcion-breve]` (Para nuevas funcionalidades).
- `fix/[ID-UT]-[descripcion-breve]` (Para corrección de errores).
- `docs/[ID-UT]-[descripcion-breve]` (Para cambios solo en documentación).

*Ejemplo: `feat/3798-gestion-puntuacion-criterios`*

### Ciclo de vida de una rama
1.  **Creación:** Se crea a partir de `main` justo antes de empezar a trabajar en la UT.
2.  **Trabajo:** Se realizan commits frecuentes siguiendo los **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`).
3.  **Sincronización:** Antes de terminar, haz un `git pull origin main` y resuelve conflictos si los hubiera.
4.  **Merge:** Se debe abrir una **Pull Request (PR)** hacia `main`. Se requiere la aprobación de tu backup.
5.  **Eliminación:** Una vez aceptada y fusionada la PR en GitHub, la rama local y remota **debe ser eliminada** para evitar ruido.

---

## 2. Metodología Worki

Seguiremos estas pautas para asegurar el ritmo del equipo y la calidad de las entregas:

-   **Dedicación:** Se debe dedicar un mínimo de **3 horas semanales de trabajo efectivo**.
-   **Pruebas de Aceptación:** No esperes al final. Valida los criterios de aceptación de la UT **en cuanto el código sea funcional** y la UT pase al estado **Pruebas de aceptación**. Si algo no encaja con lo definido, notifícalo inmediatamente.
-   **Actualización de Estado:** Cambia el estado de las tareas en la plataforma de gestión en tiempo real y añade el tiempo de trabajo mientas trabajas.
-   **Documentación de IA:** Cada cambio relevante asistido por IA debe quedar registrado en el `ai-log` del sprint correspondiente en la carpeta `docs/ai-logs/` y en caso necesario tambien `docs/adr/`.

---

## 3. Estructura del Repositorio

### Frontend (React + Vite)
Ubicado en la carpeta `/Frontend/src/`:
-   `api/`: Funciones de comunicación con el backend (fetch/axios).
-   `components/`: Componentes reutilizables (botones, tarjetas, layouts específicos).
-   `context/`: Proveedores de estado global (ej. `AuthContext.jsx`).
-   `hooks/`: Lógica extraída en Custom Hooks (ej. `useAuth.js`).
-   `pages/`: Vistas principales asociadas a rutas.
-   `assets/`: Imágenes, logos y recursos estáticos.

### Backend (.NET Web API)
Ubicado en la carpeta `/Backend/Votify.API/`:
-   `Controllers/`: Endpoints de la API que reciben las peticiones.
-   `Services/`: Lógica de negocio (es el "cerebro" donde se procesan los datos).
-   `Models/`: Clases de dominio y DTOs (Data Transfer Objects).
-   `Repositories/`: Acceso directo a datos (Supabase/DB).
-   `Factories/`: Implementación del patrón **Factory Method** para creación de objetos complejos.

---

## 4. Buenas Prácticas de Código

### Estándares Generales
-   **Patrón Factory Method:** Es obligatorio para la creación de eventos y sistemas de evaluación. Ayuda a que el código sea extensible sin modificar lo existente.
-   **Async/Await:** Todas las operaciones de red o base de datos deben ser asíncronas para no bloquear el hilo principal.
-   **Nombramiento:**
    -   Variables/Funciones: `camelCase` en JS, `PascalCase` en C#.
    -   Clases/Componentes: `PascalCase`.
-   **Simplicidad:** Aplica el principio rector de la Guía de Diseño: *"¿Qué es lo único que el usuario necesita hacer aquí?"*. Elimina código muerto y abstracciones innecesarias.

### Estilo Visual (UI/UX)
-   **Guía de Diseño:** Todos los componentes nuevos deben usar los tokens de color (`--color-org`, `--color-jur`, etc.) y fuentes (`Poppins` para títulos, `Inter` para cuerpo) definidos en `Guia_Diseño.md`.
-   **Accesibilidad:** Asegurar que los botones tengan targets táctiles suficientes (>44px) y contrastes legibles.

---
