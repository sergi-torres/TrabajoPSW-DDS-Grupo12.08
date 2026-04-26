export * from './event';
export * from './vote';

export interface Usuario {
  id: number;
  nombrecompleto: string;
  nombreusuario: string;
  email: string;
  fecharegistro?: string;
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

export interface Categoria {
  id: number;
  nombre: string;
  idevento: number;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface ComentarioCualitativo {
  id?: number;
  fecha?: string;
  idVotacion?: number;
  comentario: string;
}

export interface ConfiguracionTiempoDto {
  idcategoria: number;
  fechainicio: string | null;
  fechafin: string | null;
}

export interface ConfiguracionCategoria extends Categoria {
  categoriaId?: number;
  eventoId?: number;
}

export interface OrgDashboardData {
  evento: any;
  proyectos: any[];
  estadisticas: {
    totalVotos: number;
    totalParticipantes: number;
    promedioPuntuacion: number;
  };
  ranking: any[];
}

export interface VotacionDashboardData {
  evento: any;
  proyectos: Proyecto[];
  categorias: Categoria[];
  misVotos?: any[];
}

export interface Jurado {
  id: number;
  nombrecompleto: string;
  email: string;
  rol?: string;
  idUsuario?: number;
}

export interface AsignarJuradoRequest {
  idEvento: number;
  email: string;
  customMessage?: string | null;
}

export interface ReenviarInvitacionRequest {
  idEvento: number;
  email: string;
}
