export * from './event';
export * from './vote';

export interface Usuario {
  id: number;
  nombrecompleto: string;
  nombreusuario: string;
  email: string;
}

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion?: string;
  urlmultimedia?: string;
  idevento: number;
  idparticipante: number;
  idcategoria?: number;
}
