# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Votify** — Plataforma inteligente de gestión de votaciones para eventos competitivos.
Full-stack: .NET 9 Web API (Backend) + React 19 + Vite + TypeScript (Frontend), Supabase (PostgreSQL + JWT Auth).

---

## Development Commands

### Backend (.NET 9)
```powershell
cd Backend/Votify.API
dotnet restore
dotnet run           # http://localhost:5245
```

### Frontend (React + Vite)
```powershell
cd Frontend
npm install
npm run dev          # http://localhost:5173
npm run build        # tsc && vite build
npm run lint
```

### Tests
```powershell
# Backend (xUnit + Moq) — desde la raíz
dotnet test Backend/Votify.sln

# Filtrar por clase
dotnet test Backend/Votify.sln --filter "ClassName=EventoServiceTests"

# Frontend (vitest + testing-library) — desde Frontend/
npm test
```

### Testing a Change End-to-End
1. Levantar backend: `dotnet run` en `Backend/Votify.API`
2. Levantar frontend: `npm run dev` en `Frontend`
3. Supabase: entorno compartido de dev (no hay instancia local — no intentar levantar Supabase en local)

### Environment
Copiar `.env.example` → `.env` en la raíz del repo. Variables requeridas:
- `SUPABASE_URL`, `SUPABASE_KEY` — obligatorias, el backend lanza excepción sin ellas
- `GEMINI_API_KEY` — para síntesis IA; el modelo se puede cambiar con `GEMINI_MODEL` (default: `gemini-2.5-flash`)
- `RESEND_API_KEY` — para emails de invitación de jurado

El backend carga `.env` desde `../../` (dos niveles arriba del directorio de ejecución, llegando a la raíz del repo). Si algo no carga, verificar esta ruta primero.

---

## Architecture

### Backend — `Backend/Votify.API/`

Capas: **Controllers → Services → Repositories → Supabase Client**.

Todos los modelos de dominio heredan de `Supabase.Postgrest.Models.BaseModel` y usan atributos `[Table]`, `[Column]`, `[PrimaryKey]`, `[Reference]` para el mapeo ORM.

**Patrones obligatorios:**

- **Factory Method** (`Models/Domain/Factories/`): Para crear eventos y votos. Creadores: `HackatonEventCreator`, `InnovationFairEventCreator`, `SmallEventCreator`. Votos: `VotoJuradoFactory`, `VotoPublicoFactory`. Todo nuevo tipo de evento o voto debe seguir este patrón (ADR-003).
- **Decorator** (`Services/Decorators/VotoServiceValidationDecorator`): Envuelve `VotoService` en el DI para añadir validación antes de persistir. Registrado en `Program.cs` con doble paso: primero el concreto, luego el decorator.
- **Strategy** (`Services/Strategies/Sintesis/`): `SintesisJuradoStrategy` y `SintesisPublicoStrategy` implementan prompts distintos para Gemini. `SintesisStrategyFactory` selecciona la estrategia según el tipo.

**Autorización:** `OrganizerOnlyFilter` (`Filters/`) valida el JWT contra Supabase Auth, busca el usuario en `usuario`, y verifica `EventoUsuario.Rol == "Organizador"` para el evento. Se aplica con `[ServiceFilter(typeof(OrganizerOnlyFilter))]`. Extrae `idEvento` de la ruta o del body.

**Adaptadores externos:** `Adapters/Gemini/GeminiClient` — cliente HTTP para Google Gemini con salida JSON estructurada (schema: `fortalezas[]`, `mejoras[]`, `sentimiento`, `resumen_general`).

---

### Frontend — `Frontend/src/`

**Contextos globales:**

- `AuthContext`: token JWT + `userId` + `userName` + `sessionId` (público). `isAuthenticated = !!token`, `isPublic = !!sessionId && !token`.
- `EventContext`: `eventoId`, `userRole`, `userColor`, `isCollapsed`. `userColor` controla el tema visual. Sincroniza con `localStorage` solo para sobrevivir F5 — los componentes consumen siempre el contexto, nunca `localStorage` directamente (ADR-006).

**Rutas:** Todas las vistas de evento siguen `/eventos/:eventoId/...`. Los componentes obtienen el ID con `useParams()`, nunca desde `localStorage` (ADR-005).

**API layer (`api/`):** Una función por recurso, agrupadas por archivo. Los endpoints protegidos incluyen el header `Authorization: Bearer ${token}` obtenido de `localStorage`:
```ts
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
};
```
Los endpoints de voto público no usan JWT — pasan `sessionId` e `identificadorHash` como query params.

---

## Database Schema (Supabase / PostgreSQL)

### Relaciones principales

```
evento
  ├── categoria (idevento) ── peso_categoria_rol (idcategoria)
  │                        ├── criterio ← baremo (idevento → evento)
  │                        ├── proyecto (idcategoria)
  │                        └── premio (idcategoria)
  ├── evento_usuario (idevento) → usuario
  ├── baremo (idevento)
  └── invitaciones_pendientes (idevento)

proyecto (idparticipante → usuario, idcategoria, idevento)
  ├── voto (idproyecto, idevaluador → usuario, idcriterio)
  │     └── comentario_cualitativo (idVotacion → voto.id)
  ├── resultado (idproyecto)
  ├── hojaderuta (idproyecto) — roadmap generado por IA
  └── sintesis_comentarios (id_proyecto, id_categoria)

registro_votos_publicos (idevento, idcategoria, idproyecto) — unicidad por hash
notificacion (idusuario)
```

### Tablas con detalles no obvios

| Tabla | Columna clave | Notas |
|---|---|---|
| `evento` | `estado` | Enum `estado_evento`, default **`Configuracion`** (no `Pendiente`) |
| `evento` | `tipo_evento` | `'Competicion'` por defecto; valores: `Hackaton`, `InnovationFair`, `Small` |
| `categoria` | `estado` | Enum `estado_categoria`, default **`Pendiente`**; valores: `Pendiente`, `Activa`, `Pausada`, `Finalizada` |
| `categoria` | `votosmaximos` | Número máximo de votos por votante en esa categoría (default 3) |
| `evento_usuario` | `rol` | Enum USER-DEFINED; valores: `Organizador`, `Jurado`, `Participante`, `Publico` |
| `criterio` | `tipocriterio` | Enum USER-DEFINED (tipos de evaluación numérica/cualitativa) |
| `criterio` | `peso` | `double precision`; suma de todos los criterios del baremo debe ser 100 |
| `peso_categoria_rol` | — | Define cuánto pesa el voto de cada rol (`rol_votante`) en cada categoría. Tabla clave para el cálculo final de puntuaciones |
| `proyecto` | `idMiembros` | `ARRAY` de IDs de usuarios miembro del equipo |
| `sintesis_comentarios` | `fortalezas`, `mejoras` | `jsonb` arrays; `tipo` discrimina entre `'jurado'` y `'publico'`; `modelo_usado` registra la versión de Gemini |
| `hojaderuta` | `textoia` | Texto libre generado por IA para un proyecto; una por proyecto |
| `registro_votos_publicos` | `identificador_hash` | Hash FingerprintJS; unicidad por `(idevento, idcategoria, idproyecto, identificador_hash)` |
| `resultado` | `puntuacionglobal`, `ranking` | Resultado calculado final por proyecto |
| `comentario_cualitativo` | `idVotacion` | FK a `voto.id` — comentario extendido adjunto a un voto concreto |
| `invitaciones_pendientes` | `token` | GUID de un solo uso; se borra al ser consumido |

---

## Key Business Rules

- **Unicidad de voto:** Un voto por evaluador por categoría/proyecto. Jurado/Participante: validado por `IdEvaluador`. Público: validado por `identificadorHash` contra `registro_votos_publicos`. Si FingerprintJS está bloqueado, hay fallback a `localStorage` (ADR-008).
- **Pesos de baremo:** La suma de `criterio.peso` de un baremo debe ser exactamente 100.
- **Estados de categoría:** Solo se puede votar en `Activa`. Solo el `Organizador` cambia estados.
- **Estados de evento:** Ciclo `Configuracion → [activo] → Finalizado`. El estado inicial es `Configuracion`.
- **Invitación de jurado:** Token GUID enviado por email (Resend), de un solo uso — se borra de `invitaciones_pendientes` al consumirse (ADR-007).
- **Síntesis IA:** Se persiste en `sintesis_comentarios` para evitar llamadas duplicadas a Gemini. La salida es JSON estructurado con schema estricto.
- **`peso_categoria_rol`:** Al calcular el ranking final, el peso del voto varía según el rol del votante y la categoría. Tener esto en cuenta al tocar lógica de puntuaciones.

---

## Current State

- **Módulo de resultados/ranking:** en construcción — la lógica de `peso_categoria_rol` está pendiente de validar. No asumir que el cálculo de puntuaciones es correcto.
- **Tests de frontend:** cobertura mínima; no bloquean PR ni deben usarse como referencia de comportamiento esperado.
- **Tests de backend:** cobertura media en servicios principales; repositorios sin tests.
- **Síntesis IA:** funcional en happy path; edge cases con Gemini sin cubrir.

---

## Do Not Touch

- **`VotoServiceValidationDecorator`**: No modificar sin revisar el orden de registro en `Program.cs`. El decorator debe registrarse siempre después del concreto o el DI rompe.
- **Schema JSON de salida de Gemini**: No cambiar los campos `fortalezas`, `mejoras`, `sentimiento`, `resumen_general` — el parsing en `sintesis_comentarios` depende de este schema estricto.
- **`localStorage` en componentes**: Nunca acceder directamente. Siempre a través de `AuthContext` o `EventContext` (ADR-006).
- **`useParams()` para `eventoId`**: Nunca obtener el ID de evento desde `localStorage` en componentes (ADR-005).
- **`BaseModel` de Supabase**: Requiere constructor sin parámetros. No añadir constructores con parámetros obligatorios en modelos de dominio.
- **CORS**: Solo habilitado para `localhost:5173` en desarrollo. No ampliar sin revisar configuración de producción.

---

## Common Pitfalls

- **`.env` no carga:** El backend lo busca en `../../` relativo al directorio de ejecución. Si las variables no están disponibles, verificar que el `.env` está en la raíz del repo y no en `Backend/Votify.API/`.
- **Estado inicial de evento:** Es `Configuracion`, no `Pendiente`. Confundirlos rompe el flujo de estados.
- **Suma de pesos:** Si se crean criterios de prueba, la suma debe ser exactamente 100 o el backend rechazará operaciones de voto.
- **Voto público sin JWT:** Los endpoints de voto público no llevan `Authorization` header — pasan `sessionId` e `identificadorHash` como query params. No añadir auth header en esas llamadas.
- **`ShadingType` en tablas UI:** Usar siempre `CLEAR`, nunca `SOLID` — produce fondos negros.

---
10B981                                              qq  qqqqq       
## Design & Conventions

- **Nomenclatura:** Conceptos de dominio en español, identificadores técnicos en inglés.
- **Color tokens** (`theme.css`): `--color-org #2563EB`, `--color-part #8B5CF6`, `--color-jur #F97316`, `--color-pub #10B981`. Derivados del rol en `EventContext.userColor`.
- **UI:** Cards `rounded-[32px]`, glassmorphism, Poppins (headings) / Inter (body). Ver `Guia_Diseño.md` para reglas visuales completas.
- **Git:** Ramas `feat/[ID]-[desc]` o `fix/[ID]-[desc]`. PRs a `main`. **No hacer commits** — solo staging cuando se solicite explícitamente.
- **IA:** Documentar cambios asistidos por IA en `docs/ai-logs/`. Si el cambio afecta a decisiones arquitecturales, crear/actualizar ADR en `docs/adr/`.