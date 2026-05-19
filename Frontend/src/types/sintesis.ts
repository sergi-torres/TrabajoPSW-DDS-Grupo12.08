// Tipos para la síntesis de comentarios generada por IA (Google Gemini)
// Spec: docs/claude/specs/2026-05-05-sintesis-comentarios-ia-design.md

export type TipoSintesis = "jurado" | "publico";

export type Sentimiento = "positivo" | "mixto" | "negativo";

/**
 * DTO de síntesis devuelto por la API.
 * Field naming sigue convención del backend (PascalCase serializado a camelCase).
 */
export interface SintesisDto {
    id: number;
    idProyecto: number;
    idCategoria: number;
    tipo: TipoSintesis;
    fortalezas: string[];
    mejoras: string[];
    sentimiento: Sentimiento;
    resumenGeneral?: string;
    comentariosCount: number;
    modeloUsado: string;
    fechaGeneracion: string;
}

/**
 * Respuesta de GET /api/Sintesis/proyecto/{idP}/categoria/{idC}.
 * Cada proyecto+categoría puede tener una síntesis de jurado y otra de público.
 */
export interface SintesisProyecto {
  jurado: SintesisDto | null;
  publico: SintesisDto | null;
}

/**
 * Comentario individual mostrado en el panel "Ver comentarios originales".
 * Reutiliza el endpoint existente GET /api/Comentarios/proyecto/{idP}/categoria/{idC}/resumen.
 */
export interface ComentarioOriginal {
  id: number;
  comentario: string;
  fecha: string;
  nombreUsuario?: string | null;
  email?: string | null;
}
