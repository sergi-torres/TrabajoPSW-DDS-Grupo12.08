# Votify — Contexto del proyecto para agentes (Single Source of Truth)

Plataforma inteligente de gestión de votaciones para eventos competitivos.

---

## Estado Actual
- **Fase:** MVP - Sprint 3 (ACTIVO)
- **Prioridad:** Síntesis con IA (#3387) y Dashboard Organizador (#3982).

---

## Stack Tecnológico y Arquitectura

| Capa | Tecnología |
|------|-----------|
| Frontend | Vite + React 19, TypeScript, Tailwind CSS |
| Backend | .NET 9 Web API |
| DB / Auth | Supabase (PostgreSQL + JWT) |
| UI/UX | Variables CSS (theme.css), Sonner, Lucide React |

### Mandatos Arquitecturales
- **Factory Method:** Obligatorio para evaluaciones y creación de eventos.
- **Orquestación:** IMPORTANTE El agente debe actuar como orquestador, delegando en sub-agentes para tareas de MAS DE 4 PASOS (ver `AGENTS.md`).
- **Eficiencia:** Prohibido realizar lecturas/ediciones granulares si una tarea puede ser resuelta por un sub-agente especialista.

---

## Identidad Visual (Crítico)
Tokens por rol: **Org:** `#2563EB`, **Part:** `#8B5CF6`, **Jur:** `#F97316`, **Pub:** `#10B981`.
UI: Cards `rounded-[32px]`, Glassmorphism, Poppins/Inter.
La UI debe seguir la @Guia_Diseño.md.

---

## Reglas de Negocio Críticas
- **Unicidad:** Un voto por persona por categoría.
- **Pesos:** La suma de criterios debe ser exactamente 100%.
- **Estados:** Solo se vota en categorías `Activa`. Solo el Organizador cambia estados.

---

## Backlog Sprint 3 — En Progreso

| ID | Título | Estado |
|----|--------|--------|
| 3786 | Mostrar un ranking de las categorías en el dashboard del evento | ⏳ Pendiente |
| 2635 | Gestión de Premios | ⏳ Pendiente |
| 3982 | Dashboard del Organizador: Gestión de Proyectos | ⏳ Pendiente |
| 3983 | Inscripción y Gestión de Eventos para Participantes | ⏳ Pendiente |
| 3387 | Síntesis de feedback y comentarios basados en IA generativa | 🚀 Prioridad |

---

## Convenciones y Comandos
- **Nomenclatura:** Dominio (Español), Técnica (Inglés).
- **Frontend:** `npm run dev` | **Backend:** `dotnet run`.
- **Git:** No hacer commits. Rama `feat/[id]-[desc]`.
- **Documentación** Se puede usar el MCP de context7 para documentación especifica del código