# Votify — Plataforma Inteligente de Votación

> Gestión de votaciones para eventos competitivos con análisis IA integrado.  
> Trabajo de la asignatura PSW-DDS — Grupo 12.08

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| **Backend** | .NET 9 Web API |
| **Frontend** | React 19 + Vite + TypeScript |
| **Base de datos** | Supabase (PostgreSQL) |
| **Autenticación** | Supabase Auth (JWT) |
| **IA** | Google Gemini (síntesis de comentarios) |
| **Email** | Resend (invitaciones de jurado) |

---

## Características principales

- **Roles diferenciados** — Organizador, Jurado, Participante y Público, cada uno con su flujo y permisos propios.
- **Votación en tiempo real** — Panel de control con actualización automática cada 30 segundos.
- **Votación pública anónima** — Huella digital (FingerprintJS) para prevenir votos duplicados sin requerir registro.
- **Síntesis IA** — Análisis automático de comentarios cualitativos con Gemini, separando fortalezas y áreas de mejora.
- **Ranking por categoría** — Ponderación configurable por rol y categoría mediante `peso_categoria_rol`.
- **Invitación de jurado por email** — Token de un solo uso enviado por correo.
- **Gestión de premios** — Asignación de premios por categoría con vista pública de ganadores.
- **Hoja de ruta IA** — Generación de roadmap personalizado por proyecto.

---

## Instalación y configuración (desarrollo local)

### Requisitos previos

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 20+](https://nodejs.org/)
- Cuenta de [Supabase](https://supabase.com/) con el schema del proyecto aplicado

### 1. Variables de entorno

Copia los archivos de ejemplo y rellena los valores:

```powershell
# Backend (raíz del repo)
copy .env.example .env

# Frontend
copy Frontend\.env.example Frontend\.env
```

#### Variables del backend (`.env` en la raíz)

| Variable | Requerida | Descripción |
|---|---|---|
| `SUPABASE_URL` | Sí | URL de tu proyecto Supabase |
| `SUPABASE_KEY` | Sí | Clave `service_role` de Supabase |
| `GEMINI_API_KEY` | Para IA | Clave de API de Google Gemini |
| `GEMINI_MODEL` | No | Modelo a usar (default: `gemini-2.5-flash`) |
| `RESEND_API_KEY` | Para emails | Clave de API de Resend |

#### Variables del frontend (`Frontend/.env`)

| Variable | Requerida | Descripción |
|---|---|---|
| `VITE_API_URL` | Sí | URL base del backend (ej: `http://localhost:5245`) |

> El backend carga `.env` desde la raíz del repo (dos niveles por encima del directorio de ejecución). Si algo no carga, verificar esta ruta primero.

### 2. Backend (.NET 9)

```powershell
cd Backend/Votify.API
dotnet restore
dotnet run
# Disponible en http://localhost:5245
```

### 3. Frontend (React + Vite)

```powershell
cd Frontend
npm install
npm run dev
# Disponible en http://localhost:5173
```

---

## Scripts disponibles

### Backend

```powershell
dotnet run          # Servidor de desarrollo
dotnet build        # Compilar
dotnet test Backend/Votify.sln   # Ejecutar tests (xUnit + Moq)
```

### Frontend

```powershell
npm run dev         # Servidor de desarrollo (HMR)
npm run build       # Compilar para producción (tsc + vite)
npm run lint        # Linting con ESLint
npm test            # Tests con Vitest
```

---

## Despliegue

### Frontend (estático)

El frontend compila a archivos estáticos y puede desplegarse en cualquier CDN o hosting estático (Vercel, Netlify, GitHub Pages, etc.).

```powershell
cd Frontend
npm run build
# Salida en Frontend/dist/
```

Antes de compilar para producción, crea `Frontend/.env` con la URL del backend desplegado:

```
VITE_API_URL=https://tu-backend.ejemplo.com
```

### Backend (.NET 9)

El backend puede desplegarse como contenedor Docker, en Azure App Service, Railway, o cualquier servidor con .NET 9.

Las variables de entorno del backend deben configurarse en el servidor destino (no en el `.env` del repo).

> **CORS**: el backend solo acepta peticiones de `localhost:5173` en desarrollo. Para producción, actualizar la política CORS en `Program.cs` con el dominio del frontend desplegado.

---

## Estructura del proyecto

```
TrabajoPSW-DDS/
├── .env.example               # Plantilla de variables de entorno del backend
├── Backend/
│   ├── Votify.API/
│   │   ├── Controllers/        # Endpoints REST
│   │   ├── Services/           # Lógica de negocio
│   │   │   ├── Decorators/     # Decorator pattern
│   │   │   └── Strategies/     # Strategy pattern
│   │   ├── Repositories/       # Acceso a datos (Supabase ORM)
│   │   ├── Models/
│   │   │   ├── Domain/         # Entidades
│   │   │   │   └── Factories/  # Factory Method pattern
│   │   │   └── DTOs/           # Objetos de transferencia
│   │   ├── Filters/            # OrganizerOnlyFilter (autorización)
│   │   └── Adapters/           # GeminiClient (HTTP externo)
│   └── Votify.Tests/           # Tests unitarios
└── Frontend/
    ├── .env.example            # Plantilla de variables de entorno del frontend
    └── src/
        ├── api/                # Capa de llamadas HTTP
        ├── config/             # Configuración global (URL de API)
        ├── components/         # Componentes reutilizables
        ├── context/            # AuthContext, EventContext, VotingContext
        ├── hooks/              # Custom hooks
        ├── pages/              # Vistas de la aplicación
        └── types/              # Tipos TypeScript compartidos
```

---

## Documentación adicional

- [`docs/adr/`](docs/adr/) — Decisiones de arquitectura (ADRs)
- [`docs/ai-logs/`](docs/ai-logs/) — Registro de cambios asistidos por IA
- [`Guia_Diseño.md`](Guia_Diseño.md) — Guía de estilos y componentes visuales
