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

## Instalación y configuración

### Requisitos previos

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 20+](https://nodejs.org/)
- Cuenta de [Supabase](https://supabase.com/) con el schema del proyecto aplicado

### 1. Variables de entorno

Copia el archivo de ejemplo y rellena los valores:

```powershell
copy .env.example .env
```

El archivo `.env` debe estar en la **raíz del repositorio**. El backend lo busca dos niveles por encima de su directorio de ejecución.

| Variable | Requerida | Descripción |
|---|---|---|
| `SUPABASE_URL` | Sí | URL de tu proyecto Supabase |
| `SUPABASE_KEY` | Sí | Clave `service_role` de Supabase |
| `GEMINI_API_KEY` | Para IA | Clave de API de Google Gemini |
| `GEMINI_MODEL` | No | Modelo a usar (default: `gemini-2.5-flash`) |
| `RESEND_API_KEY` | Para emails | Clave de API de Resend |

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

## Estructura del proyecto

```
TrabajoPSW-DDS/
├── Backend/
│   ├── Votify.API/
│   │   ├── Controllers/        # Endpoints REST
│   │   ├── Services/           # Lógica de negocio
│   │   │   ├── Decorators/     # Decorator pattern (validación de votos)
│   │   │   └── Strategies/     # Strategy pattern (síntesis IA)
│   │   ├── Repositories/       # Acceso a datos (Supabase ORM)
│   │   ├── Models/
│   │   │   ├── Domain/         # Entidades (hereda BaseModel)
│   │   │   │   └── Factories/  # Factory Method pattern
│   │   │   └── DTOs/           # Objetos de transferencia
│   │   ├── Filters/            # OrganizerOnlyFilter (autorización)
│   │   └── Adapters/           # GeminiClient (HTTP externo)
│   └── Votify.Tests/           # Tests unitarios
└── Frontend/
    └── src/
        ├── api/                # Capa de llamadas HTTP
        ├── components/         # Componentes reutilizables
        ├── context/            # AuthContext, EventContext, VotingContext
        ├── hooks/              # Custom hooks
        ├── pages/              # Vistas de la aplicación
        └── types/              # Tipos TypeScript compartidos
```

---

## Patrones de diseño implementados

| Patrón | Ubicación | Propósito |
|---|---|---|
| **Factory Method** | `Models/Domain/Factories/` | Creación de tipos de evento y voto |
| **Decorator** | `Services/Decorators/` | Validación previa al guardado de votos |
| **Strategy** | `Services/Strategies/Sintesis/` | Prompts diferenciados por tipo de votante |

---

## Credenciales de prueba

| Campo | Valor |
|---|---|
| Usuario | `jorge@gmail.com` |
| Contraseña | `jorgeee` |
| Código de evento (Público) | `123455` |

---

## Documentación adicional

- [`docs/adr/`](docs/adr/) — Decisiones de arquitectura (ADRs)
- [`docs/ai-logs/`](docs/ai-logs/) — Registro de cambios asistidos por IA
- [`Guia_Diseño.md`](Guia_Diseño.md) — Guía de estilos y componentes visuales
