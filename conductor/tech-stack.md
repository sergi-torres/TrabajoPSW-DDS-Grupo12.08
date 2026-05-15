# Tech Stack: Votify - Plataforma Inteligente de Votación

## Overview
This document outlines the core technologies and frameworks used in the Votify platform, a smart voting system for competitive events. The architecture is designed to be decoupled, utilizing separate frontend and backend services to ensure scalability, maintainability, and specialized development.

## Frontend
-   **Framework:** React (Vite for bundling)
    -   A declarative, component-based JavaScript library for building user interfaces. Vite provides a fast development environment.
-   **Language:** TypeScript
    -   A superset of JavaScript that adds static types, enhancing code quality and developer productivity.
-   **Styling:** Tailwind CSS
    -   A utility-first CSS framework for rapidly building custom designs.

## Backend
-   **Framework:** .NET 9 Web API
    -   A robust and high-performance framework for building scalable web APIs, leveraging the capabilities of the .NET ecosystem.
-   **Language:** C#
    -   A modern, object-oriented language developed by Microsoft, known for its versatility and strong typing.

## Database & Authentication
-   **Platform:** Supabase
    -   An open-source Firebase alternative providing a PostgreSQL database, authentication, instant APIs, and real-time subscriptions.
-   **Database Type:** PostgreSQL
    -   A powerful, open-source object-relational database system known for its reliability, feature robustness, and performance.

## Architecture
The project employs a decoupled frontend and backend architecture:
-   The **Frontend** (React, Vite, TypeScript) is responsible for the user interface and user experience.
-   The **Backend** (.NET 9 Web API, C#) handles business logic, data processing, and API endpoints.
-   **Supabase** serves as the primary data store and handles user authentication, providing a secure and scalable backend-as-a-service.
