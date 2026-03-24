/**
 * User.js
 * 
 * Modelo de datos del usuario en el Frontend.
 * Corresponde al modelo de dominio Usuario.cs en el Backend.
 */

/**
 * @typedef {Object} User
 * @property {string} email - Correo electrónico del usuario
 * @property {string} nombreCompleto - Nombre completo (ej: "Juan Pérez")
 * @property {string} nombreUsuario - Username (ej: "juan_p")
 * @property {string} rol - "Organizador" | "Participante" | "Jurado"
 * @property {string} token - JWT de Supabase Auth
 */

export const ROLES = {
    ORGANIZADOR: "Organizador",
    PARTICIPANTE: "Participante",
    JURADO: "Jurado",
};

export default ROLES;
