# ADR-002: Gestión del estado de autenticación en el Frontend

**Fecha:** 13-04-2026  
**Sprint:** S1  
**Estado:** Aprobado

## 1) Contexto

La aplicación web de Votify necesita una forma consistente de manejar el estado de autenticación del usuario (tokens de acceso, identificación del usuario y nombre) a través de múltiples componentes. Es crucial que la información de sesión sea persistente y reactiva.

## 2) Opciones consideradas

- **Opción A: React Context API.** Crear un proveedor de contexto global que envuelva la aplicación y exponga el estado y las funciones de autenticación.
- **Opción B: Redux / Zustand.** Utilizar una librería externa de gestión de estado global para manejar la autenticación.
- **Opción C: Props Drilling.** Pasar el estado de autenticación manualmente desde el componente raíz a todos los subcomponentes que lo necesiten.
- **Opción D: Variables globales fuera del ciclo de vida de React.** Almacenar el token en una variable estática o global, accediendo directamente a `localStorage` en cada componente.

## 3) Criterios de decisión

- **Simplicidad:** Minimizar el uso de librerías externas innecesarias para una tarea puntual.
- **Reactividad:** Los componentes deben reaccionar automáticamente a los cambios de estado.
- **Escalabilidad:** Debe ser fácil de usar en toda la aplicación sin generar un código difícil de mantener.
- **Persistencia:** Capacidad de mantener la sesión entre recargas del navegador.

## 4) Decision tomada

Se elige la **Opción A (React Context API)**. Es la solución estándar e integrada de React para compartir estado global simple como la autenticación. Evita la complejidad y el peso de librerías como Redux, siendo suficiente para las necesidades actuales de Votify. Al combinar el Contexto con `localStorage` y el hook `useEffect`, se logra tanto la reactividad como la persistencia de forma nativa.

La Opción C se descartó por la alta profundidad del árbol de componentes, y la Opción D se descartó por la falta de reactividad que obligaría a recargas manuales o lógica propensa a errores.

## 5) Consecuencias

- **Positivas:**
	- Acceso sencillo al estado de autenticación desde cualquier componente mediante hooks (`useAuth`).
	- No se requieren dependencias externas adicionales.
	- Sincronización automática entre pestañas mediante el evento `storage`.
- **Negativas / trade-offs:**
	- Posibles re-renderizados innecesarios si el contexto se vuelve muy grande (mitigado manteniendo el contexto enfocado solo en auth).
	- Mayor acoplamiento de los componentes al proveedor de contexto.
- **Riesgos y mitigaciones:**
	- Almacenamiento de tokens en `localStorage`: Mitigado con buenas prácticas de seguridad en el backend y limpieza de entradas en el frontend.

## 6) Evidencia

- Implementación en `Frontend/src/context/AuthContext.jsx`.
- Uso mediante hook personalizado en `Frontend/src/hooks/useAuth.js`.
- Protección de rutas en `Frontend/src/components/auth/ProtectedRoute.jsx`.
