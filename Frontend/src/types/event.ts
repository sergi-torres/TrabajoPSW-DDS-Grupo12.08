export type EventType = 'Hackaton' | 'InnovationFair' | 'SmallEvent' | 'Competicion';

export interface BaseEvent {
  id: number;
  nombre: string;
  descripcion?: string;
  fechaini: string;
  fechafin: string;
  fechaInicio?: string; // Support both naming variants
  fechaFin?: string;    // Support both naming variants
  estado: 'Configuracion' | 'Registro' | 'EnProgreso' | 'Finalizado' | 'EnVotacion' | 'Activo' | string;
  tipo_evento: EventType;
  cod_evento: number;
  categorias?: any[];
  baremos?: any[];
  comentariosObligatorios?: boolean;
}

export interface HackatonEvent extends BaseEvent {
  tipo_evento: 'Hackaton';
}

export interface InnovationFairEvent extends BaseEvent {
  tipo_evento: 'InnovationFair';
}

export type Event = HackatonEvent | InnovationFairEvent | BaseEvent;
