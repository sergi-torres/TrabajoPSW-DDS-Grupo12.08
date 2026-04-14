# ADR-004: Refactorización de la relación Usuario-Rol-Evento

**Fecha:** 23-03-2026  
**Sprint:** S1  
**Estado:** Aprobado

## 1) Contexto

Actualmente, el rol de un usuario (Organizador, Jurado, Participante) está definido directamente en la clase Usuario. Sin embargo, un usuario puede tener diferentes roles según el evento en el que participa. Esto genera una limitación funcional y de modelado, ya que no se puede representar correctamente la relación muchos a muchos entre usuarios y eventos con roles variables. Es necesario rediseñar el modelo para soportar esta flexibilidad y mantener la integridad de los datos, afectando tanto al modelo de dominio como a la base de datos y la lógica de acceso.

## 2) Opciones consideradas

- **Opción A:** Crear una entidad intermedia EventoUsuario que relacione Usuario y Evento, incluyendo el rol como atributo. Así, un usuario puede tener distintos roles en diferentes eventos.
- **Opción B:** Mantener el rol en Usuario y almacenar una lista de eventos por cada usuario, gestionando los roles como una colección de pares (evento, rol) en la propia entidad Usuario.
- **Opción C:** No hacer nada y mantener el modelo actual, asumiendo que un usuario solo puede tener un rol global en el sistema.

## 3) Criterios de decisión

- Mantenibilidad y claridad del modelo de datos
- Extensibilidad para futuros requisitos
- Normalización y consistencia en la base de datos
- Facilidad de consulta y manipulación desde los repositorios y controladores
- Impacto en la migración de datos y compatibilidad hacia atrás

## 4) Decisión tomada

Se elige la Opción A: crear una entidad intermedia EventoUsuario que represente la participación de un usuario en un evento con un rol específico. Esta opción normaliza la relación, permite añadir fácilmente nuevos atributos y facilita consultas eficientes. Requiere modificar el modelo de dominio en .NET, los repositorios y controladores para gestionar la nueva entidad, así como crear la tabla intermedia correspondiente en la base de datos.

## 5) Consecuencias

- **Positivas:**
	- Permite que un usuario tenga diferentes roles según el evento.
	- Facilita la extensión futura (más atributos en la relación, nuevos roles).
	- Mejora la integridad y normalización de los datos.
- **Negativas / trade-offs:**
	- Incrementa la complejidad del modelo y de las consultas.
	- Requiere migración de datos y refactorización de la poca lógica existente.
- **Riesgos y mitigaciones:**
	- Riesgo de errores en la migración: mitigado con pruebas y migraciones controladas.
	- Posible aumento de la complejidad en los controladores: mitigado con servicios y repositorios bien definidos.

## 6) Evidencia

- Commit relevante: Commit d9ba5a1 - fix:patron diseño usuario y bugs visuales login.
- Base de datos actualizada con nueva tabla evento_usuario.