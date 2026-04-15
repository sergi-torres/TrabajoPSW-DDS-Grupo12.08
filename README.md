# Votify — Plataforma Inteligente de Votación
Trabajo de la asignatura PSW-DDS (Grupo 12.08)

---

## Guía de Instalación y Configuración

### 1. Configurar Variables de Entorno
El proyecto utiliza un archivo `.env` en la raíz para la configuración de Supabase.
1.  Copia el archivo de ejemplo:
    ```powershell
    copy .env.example .env
    ```
2.  Abre el nuevo archivo `.env` y rellena los valores `SUPABASE_URL` y `SUPABASE_KEY` con tus credenciales de Supabase.

### 2. Configurar el Backend (.NET 9.0)
Navega a la carpeta del backend y restaura las dependencias:
```powershell
cd Backend/Votify.API
dotnet restore
dotnet run
```

### 3. Configurar el Frontend (React + Vite)
En una nueva terminal, navega a la carpeta del frontend e instala las dependencias:
```powershell
cd Frontend
npm install
npm run dev
```
### Credenciales de prueba
Usuario de prueba: jorge@gmail.com
Contraseña: jorgeee

Para la vista del público - Código evento: 123455
---
