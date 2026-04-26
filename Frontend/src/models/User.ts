/**
 * User.ts
 * 
 * Modelo de datos del usuario en el Frontend.
 * Corresponde al modelo de dominio Usuario.cs en el Backend.
 */

export interface User {
    email: string;
    nombreCompleto: string;
    nombreUsuario: string;
    rol: string;
    token: string;
}

export const ROLES = {
    ORGANIZADOR: "Organizador",
    PARTICIPANTE: "Participante",
    JURADO: "Jurado",
} as const;

export default ROLES;
