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
  estado: string;
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
  liveInfo: {
    eventName: string;
    phase: string;
    eventCode: string;
    fechaFin?: string;
  };
  stats: {
    proyectosSubidos: number;
    proyectosTotal: number;
    participantesConectados: number;
    votosJuradoPorcentaje: number;
    votosPublicoCount: number;
  };
  ranking: any[];
  feed: any[];
}

export interface VotacionDashboardData {
  eventInfo: any;
  categorias: any[];
  comentariosObligatorios?: boolean;
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

export interface Premio 
{
  id: number;
  idCategoria: number;
  nombre: string;
  descripcion?: string;
  posicion: number;
  icono?: string;
}

export type CrearPremioRequest =  Omit<Premio, 'id'>;