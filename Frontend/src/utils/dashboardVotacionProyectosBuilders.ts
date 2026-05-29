import type { Dispatch, SetStateAction } from 'react';

// Pure builder functions — no side effects, no localStorage access.

export type LocalVotingContext = {
  idUsuario: number | null;
  sessionId: string | null;
  finalEventoId: number;
};

export function getLocalVotingContext(params: {
  eventoIdFromContext: number | null | undefined;
  categoriaId: number;
}): LocalVotingContext {
  const { eventoIdFromContext } = params;

  const userIdRaw = localStorage.getItem('userId');
  const idUsuario = userIdRaw ? parseInt(userIdRaw) : null;

  const sessionId = localStorage.getItem('sessionId');

  const storedEventoId = localStorage.getItem('eventoId');
  const finalEventoId = eventoIdFromContext ?? (storedEventoId ? parseInt(storedEventoId) : 0);

  return {
    idUsuario: idUsuario !== null && Number.isNaN(idUsuario) ? null : idUsuario,
    sessionId: sessionId || null,
    finalEventoId,
  };
}

export function buildPublicVoteDto(params: {
  eventoId: number;
  categoriaId: number;
  proyectoId: number;
  comentario: string;
  idUsuario: number | undefined;
  sessionId: string | null;
  identificadorHash?: string;
  valor?: number;
}): any {
  const {
    eventoId,
    categoriaId,
    proyectoId,
    comentario,
    idUsuario,
    sessionId,
    identificadorHash,
    valor = 1,
  } = params;

  return {
    eventoId,
    categoriaId,
    proyectoId,
    comentario,
    idUsuario: idUsuario ?? undefined,
    sessionId,
    identificadorHash: identificadorHash || undefined,
    valor,
    idcriterio: null,
    idproyecto: proyectoId,
    idevaluador: idUsuario ?? undefined,
    idcategoria: categoriaId,
  };
}

export function buildJuradoBatchPayload(params: {
  eventoId: number;
  categoriaId: number;
  proyectoId: number;
  idUsuario: number | null;
  comentarioGlobal?: string;
  evaluaciones: { criterioId: number; valor: number; comentario: string }[];
}): any {
  const {
    eventoId,
    categoriaId,
    proyectoId,
    idUsuario,
    comentarioGlobal,
    evaluaciones,
  } = params;

  return {
    eventoId,
    categoriaId,
    proyectoId,
    idUsuario,
    comentarioGlobal: comentarioGlobal || undefined,
    evaluaciones: evaluaciones.map((e) => ({
      criterioId: e.criterioId,
      valor: e.valor,
      comentario: e.comentario,
    })),
  };
}

export async function withSubmitGuard(params: {
  submitLock: { current: boolean };
  setSubmitting: Dispatch<SetStateAction<boolean>>;
  action: () => Promise<void>;
}): Promise<void> {
  const { submitLock, setSubmitting, action } = params;
  if (submitLock.current) return;

  submitLock.current = true;
  setSubmitting(true);
  try {
    await action();
  } finally {
    submitLock.current = false;
    setSubmitting(false);
  }
}

