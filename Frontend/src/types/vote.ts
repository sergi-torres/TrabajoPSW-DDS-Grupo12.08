export type CriterioTipo = 'Numerico' | 'Checklist' | 'Rubrica';

export interface Criterio {
  id: number;
  nombre: string;
  peso: number;
  tipocriterio: CriterioTipo;
  idbaremo: number;
}

export interface Voto {
  id?: number;
  valor: number;
  comentario?: string;
  idproyecto: number;
  idcriterio: number;
  idevaluador: number;
  idcategoria: number;
}
