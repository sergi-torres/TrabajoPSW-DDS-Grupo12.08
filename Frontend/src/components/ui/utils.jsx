// utils.js - Versión sin dependencias
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}