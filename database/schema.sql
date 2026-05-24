-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.baremo (
  id integer NOT NULL DEFAULT nextval('baremo_id_seq'::regclass),
  nombre character varying NOT NULL,
  idevento integer NOT NULL,
  CONSTRAINT baremo_pkey PRIMARY KEY (id),
  CONSTRAINT baremo_idevento_fkey FOREIGN KEY (idevento) REFERENCES public.evento(id)
);
CREATE TABLE public.categoria (
  id integer NOT NULL DEFAULT nextval('categoria_id_seq'::regclass),
  nombre character varying NOT NULL,
  idevento integer NOT NULL,
  fechaini timestamp with time zone,
  fechafin timestamp with time zone,
  estado USER-DEFINED NOT NULL DEFAULT 'Pendiente'::estado_categoria,
  votosmaximos integer NOT NULL DEFAULT 3,
  CONSTRAINT categoria_pkey PRIMARY KEY (id),
  CONSTRAINT categoria_idevento_fkey FOREIGN KEY (idevento) REFERENCES public.evento(id)
);
CREATE TABLE public.comentario_cualitativo (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  fecha timestamp without time zone NOT NULL,
  idVotacion bigint UNIQUE,
  comentario text,
  CONSTRAINT comentario_cualitativo_pkey PRIMARY KEY (id),
  CONSTRAINT comentario_cualitativo_idVotacion_fkey FOREIGN KEY (idVotacion) REFERENCES public.voto(id)
);
CREATE TABLE public.criterio (
  id integer NOT NULL DEFAULT nextval('criterio_id_seq'::regclass),
  nombre character varying NOT NULL,
  peso double precision NOT NULL,
  tipocriterio USER-DEFINED NOT NULL,
  idbaremo integer NOT NULL,
  comentario_obligatorio boolean DEFAULT false,
  CONSTRAINT criterio_pkey PRIMARY KEY (id),
  CONSTRAINT criterio_idbaremo_fkey FOREIGN KEY (idbaremo) REFERENCES public.baremo(id)
);
CREATE TABLE public.evento (
  id integer NOT NULL DEFAULT nextval('evento_id_seq'::regclass),
  nombre character varying NOT NULL,
  descripcion text,
  fechaini timestamp without time zone NOT NULL,
  fechafin timestamp without time zone NOT NULL,
  estado USER-DEFINED NOT NULL DEFAULT 'Configuracion'::estado_evento,
  idorganizador integer NOT NULL,
  tipo_evento character varying NOT NULL DEFAULT 'Competicion'::character varying,
  cod_evento integer NOT NULL UNIQUE,
  comentarios_obligatorios boolean DEFAULT false,
  CONSTRAINT evento_pkey PRIMARY KEY (id),
  CONSTRAINT evento_idorganizador_fkey FOREIGN KEY (idorganizador) REFERENCES public.usuario(id)
);
CREATE TABLE public.evento_usuario (
  id integer NOT NULL DEFAULT nextval('evento_usuario_id_seq'::regclass),
  idevento integer NOT NULL,
  idusuario integer NOT NULL,
  rol USER-DEFINED,
  CONSTRAINT evento_usuario_pkey PRIMARY KEY (id),
  CONSTRAINT evento_usuario_idevento_fkey FOREIGN KEY (idevento) REFERENCES public.evento(id),
  CONSTRAINT evento_usuario_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES public.usuario(id)
);
CREATE TABLE public.hojaderuta (
  id integer NOT NULL DEFAULT nextval('hojaderuta_id_seq'::regclass),
  textoia text NOT NULL,
  fechageneracion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  idproyecto integer NOT NULL UNIQUE,
  CONSTRAINT hojaderuta_pkey PRIMARY KEY (id),
  CONSTRAINT hojaderuta_idproyecto_fkey FOREIGN KEY (idproyecto) REFERENCES public.proyecto(id)
);
CREATE TABLE public.invitaciones_pendientes (
  id integer NOT NULL DEFAULT nextval('invitaciones_pendientes_id_seq'::regclass),
  email character varying NOT NULL,
  idevento integer NOT NULL,
  token character varying NOT NULL UNIQUE,
  fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT invitaciones_pendientes_pkey PRIMARY KEY (id),
  CONSTRAINT fk_evento FOREIGN KEY (idevento) REFERENCES public.evento(id)
);
CREATE TABLE public.notificacion (
  id integer NOT NULL DEFAULT nextval('notificacion_id_seq'::regclass),
  mensaje text NOT NULL,
  fechaenvio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  idusuario integer NOT NULL,
  CONSTRAINT notificacion_pkey PRIMARY KEY (id),
  CONSTRAINT notificacion_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES public.usuario(id)
);
CREATE TABLE public.peso_categoria_rol (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  idcategoria integer NOT NULL,
  rol_votante USER-DEFINED NOT NULL,
  peso double precision NOT NULL,
  CONSTRAINT peso_categoria_rol_pkey PRIMARY KEY (id),
  CONSTRAINT peso_categoria_rol_idcategoria_fkey FOREIGN KEY (idcategoria) REFERENCES public.categoria(id)
);
CREATE TABLE public.premio (
  id integer NOT NULL DEFAULT nextval('premio_id_seq'::regclass),
  nombre character varying NOT NULL,
  descripcion text,
  icono character varying,
  idcategoria integer NOT NULL,
  posicion smallint NOT NULL DEFAULT '1'::smallint,
  CONSTRAINT premio_pkey PRIMARY KEY (id),
  CONSTRAINT premio_idcategoria_fkey FOREIGN KEY (idcategoria) REFERENCES public.categoria(id)
);
CREATE TABLE public.proyecto (
  id integer NOT NULL DEFAULT nextval('proyecto_id_seq'::regclass),
  nombre character varying NOT NULL,
  descripcion text,
  urlmultimedia character varying,
  idevento integer,
  idparticipante integer NOT NULL,
  idcategoria integer,
  idMiembros ARRAY,
  estado text,
  CONSTRAINT proyecto_pkey PRIMARY KEY (id),
  CONSTRAINT proyecto_idevento_fkey FOREIGN KEY (idevento) REFERENCES public.evento(id),
  CONSTRAINT proyecto_idparticipante_fkey FOREIGN KEY (idparticipante) REFERENCES public.usuario(id),
  CONSTRAINT proyecto_idcategoria_fkey FOREIGN KEY (idcategoria) REFERENCES public.categoria(id)
);
CREATE TABLE public.registro_votos_publicos (
  id integer NOT NULL DEFAULT nextval('registro_votos_publicos_id_seq'::regclass),
  idevento integer,
  identificador_hash text NOT NULL,
  idcategoria integer,
  idproyecto integer,
  fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT registro_votos_publicos_pkey PRIMARY KEY (id),
  CONSTRAINT registro_votos_publicos_idevento_fkey FOREIGN KEY (idevento) REFERENCES public.evento(id),
  CONSTRAINT registro_votos_publicos_idcategoria_fkey FOREIGN KEY (idcategoria) REFERENCES public.categoria(id),
  CONSTRAINT registro_votos_publicos_idproyecto_fkey FOREIGN KEY (idproyecto) REFERENCES public.proyecto(id)
);
CREATE TABLE public.resultado (
  id integer NOT NULL DEFAULT nextval('resultado_id_seq'::regclass),
  puntuacionglobal double precision NOT NULL,
  ranking integer,
  idproyecto integer NOT NULL UNIQUE,
  CONSTRAINT resultado_pkey PRIMARY KEY (id),
  CONSTRAINT resultado_idproyecto_fkey FOREIGN KEY (idproyecto) REFERENCES public.proyecto(id)
);
CREATE TABLE public.sintesis_comentarios (
  id bigint NOT NULL DEFAULT nextval('sintesis_comentarios_id_seq'::regclass),
  id_proyecto bigint NOT NULL,
  id_categoria bigint NOT NULL,
  tipo text NOT NULL CHECK (tipo = ANY (ARRAY['jurado'::text, 'publico'::text])),
  fortalezas jsonb NOT NULL DEFAULT '[]'::jsonb,
  mejoras jsonb NOT NULL DEFAULT '[]'::jsonb,
  sentimiento text NOT NULL CHECK (sentimiento = ANY (ARRAY['positivo'::text, 'mixto'::text, 'negativo'::text])),
  resumen_general text,
  comentarios_count integer NOT NULL DEFAULT 0,
  modelo_usado text NOT NULL DEFAULT ''::text,
  fecha_generacion timestamp with time zone NOT NULL DEFAULT now(),
  generado_por_uid uuid,
  CONSTRAINT sintesis_comentarios_pkey PRIMARY KEY (id),
  CONSTRAINT sintesis_comentarios_id_proyecto_fkey FOREIGN KEY (id_proyecto) REFERENCES public.proyecto(id),
  CONSTRAINT sintesis_comentarios_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES public.categoria(id)
);
CREATE TABLE public.usuario (
  id integer NOT NULL DEFAULT nextval('usuario_id_seq'::regclass),
  nombrecompleto character varying NOT NULL,
  nombreusuario character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  password character varying NOT NULL,
  fecharegistro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT usuario_pkey PRIMARY KEY (id)
);
CREATE TABLE public.voto (
  id integer NOT NULL DEFAULT nextval('votacion_id_seq'::regclass),
  valor double precision,
  comentario text,
  urlaudio character varying,
  ipdispositivo character varying,
  fechavoto timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  idproyecto integer NOT NULL,
  idevaluador integer,
  idcriterio integer,
  idcategoria integer NOT NULL,
  CONSTRAINT voto_pkey PRIMARY KEY (id),
  CONSTRAINT votacion_idproyecto_fkey FOREIGN KEY (idproyecto) REFERENCES public.proyecto(id),
  CONSTRAINT votacion_idevaluador_fkey FOREIGN KEY (idevaluador) REFERENCES public.usuario(id),
  CONSTRAINT votacion_idcriterio_fkey FOREIGN KEY (idcriterio) REFERENCES public.criterio(id),
  CONSTRAINT votacion_idcategoria_fkey FOREIGN KEY (idcategoria) REFERENCES public.categoria(id)
);