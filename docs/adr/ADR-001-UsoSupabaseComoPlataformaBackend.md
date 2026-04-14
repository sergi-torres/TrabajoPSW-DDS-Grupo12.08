# ADR-001: Uso de Supabase como plataforma de Backend y Base de Datos

**Fecha:** 10-03-2026  
**Sprint:** S1  
**Estado:** Aprobado

## 1) Contexto

El proyecto Votify requiere una infraestructura de backend robusta que gestione la persistencia de datos (PostgreSQL), la autenticación de usuarios (JWT, gestión de sesiones) y funcionalidades en tiempo real. En lugar de gestionar manualmente servidores de bases de datos y servicios de autenticación complejos (como Identity en .NET Core o servidores OAuth propios), se busca una solución que acelere el desarrollo y reduzca la carga operativa de mantenimiento.

## 2) Opciones consideradas

- **Opción A: Supabase (BaaS).** Utilizar Supabase como plataforma integral que proporciona PostgreSQL, Auth, Storage y Realtime de forma gestionada.
- **Opción B: Base de datos SQL tradicional (PostgreSQL/SQL Server) gestionada localmente o en VPS.** Configurar y mantener manualmente la base de datos y desarrollar toda la lógica de autenticación desde cero en el Backend.
- **Opción C: Firebase (BaaS).** Similar a Supabase pero basado en NoSQL (Firestore).

## 3) Criterios de decisión

- **Velocidad de desarrollo:** Facilidad para integrar autenticación y base de datos sin configuración extensa.
- **Relacionalidad:** El dominio de Votify es relacional, por lo que se prefiere SQL sobre NoSQL.
- **Costo operativo:** Minimizar la necesidad de administrar servidores y actualizaciones de seguridad.
- **Ecosistema y SDK:** Disponibilidad de librerías oficiales y mantenidas para .NET y React.
- **Tiempo Real:** Capacidad nativa para notificaciones de votos o cambios en el ranking.

## 4) Decision tomada

Se elige la **Opción A (Supabase)**. Supabase ofrece la potencia de PostgreSQL (necesaria para el modelo relacional de eventos, proyectos y votos) con la simplicidad de un servicio en la nube gestionado. Su sistema de autenticación integrado simplifica enormemente la gestión de usuarios y roles. Además, el uso de su SDK oficial tanto en el Backend (C#) como en el Frontend (React) permite una integración coherente y tipada mediante atributos y modelos base.

La Opción B se descartó por el alto esfuerzo de mantenimiento y desarrollo de seguridad. La Opción C se descartó porque el modelo de datos relacional de Votify encaja mejor en PostgreSQL que en Firestore.

## 5) Consecuencias

- **Positivas:**
	- Reducción drástica del tiempo de implementación de la capa de datos y seguridad.
	- Escalabilidad automática y backups gestionados.
- **Negativas / trade-offs:**
	- Dependencia de un proveedor externo.
	- Límites de uso en la capa gratuita (aunque suficientes para el alcance actual del proyecto).
- **Riesgos y mitigaciones:**
	- Interrupciones del servicio externo: Mitigado con la posibilidad teórica de exportar el esquema y datos de PostgreSQL a cualquier otro hosting de SQL dado que Supabase es código abierto.

## 6) Evidencia

- Integración en `Backend/Votify.API/Program.cs` usando `Supabase.Client`.
- Modelos de dominio heredando de `Supabase.Postgrest.Models.BaseModel`.
- Configuración de variables de entorno `SUPABASE_URL` y `SUPABASE_KEY` en .env.
- Dependencia `@supabase/supabase-js` en el `package.json` del Frontend.
