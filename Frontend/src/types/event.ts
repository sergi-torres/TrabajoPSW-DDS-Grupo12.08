export type EventType = 'Hackaton' | 'InnovationFair' | 'SmallEvent' | 'Competicion';

export interface BaseEvent {
  id: number;
  nombre: string;
  descripcion?: string;
  fechaini: string;
  fechafin: string;
  estado: 'Configuracion' | 'Registro' | 'EnProgreso' | 'Finalizado';
  tipo_evento: EventType;
  cod_evento: number;
}

export interface HackatonEvent extends BaseEvent {
  tipo_evento: 'Hackaton';
}

export interface InnovationFairEvent extends BaseEvent {
  tipo_evento: 'InnovationFair';
}

export type Event = HackatonEvent | InnovationFairEvent | BaseEvent;
