using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Repositories;

namespace Votify.API.Services
{
    public class EventoService : IEventoService
    {
        private readonly Supabase.Client _supabase;

        private readonly ICategoriaRepository _categoriaRepository;


        public EventoService(Supabase.Client supabase, ICategoriaRepository categoriaRepository)
        {
            _supabase = supabase;
            _categoriaRepository = categoriaRepository;
        }

        public async Task<List<EventoResponseDto>> GetEventosByUsuarioAsync(int userId)
        {
            try
            {
                // Buscar en la tabla relación evento_usuario los eventos de este usuario
                var relaciones = await _supabase
                    .From<EventoUsuario>()
                    .Filter("idusuario", Supabase.Postgrest.Constants.Operator.Equals, userId.ToString())
                    .Get();

                var resultado = new List<EventoResponseDto>();

                foreach (var rel in relaciones.Models)
                {
                    var eventoResponse = await _supabase
                        .From<EventoLite>()
                        .Filter("id", Supabase.Postgrest.Constants.Operator.Equals, rel.IdEvento.ToString())
                        .Get();

                    var evento = eventoResponse.Models.FirstOrDefault();
                    if (evento != null)
                    {
                        resultado.Add(new EventoResponseDto
                        {
                            Id = evento.Id,
                            CodEvento = evento.CodEvento,
                            Nombre = evento.Nombre,
                            Descripcion = evento.Descripcion,
                            FechaIni = evento.FechaInicio,
                            FechaFin = evento.FechaFin,
                            Estado = evento.Estado,
                            Rol = rel.Rol
                        });
                    }
                }

                return resultado;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener los eventos del usuario", ex);
            }
        }

        public async Task<JoinEventoResponseDto> JoinEventoPorCodigoAsync(int codEvento)
        {
            try
            {
                var response = await _supabase
                    .From<EventoLite>()
                    .Filter("cod_evento", Supabase.Postgrest.Constants.Operator.Equals, codEvento.ToString())
                    .Get();

                var evento = response.Models.FirstOrDefault();
                if (evento == null)
                {
                    throw new Exception("El PIN no corresponde a ningun evento.");
                }

                return new JoinEventoResponseDto
                {
                    Id = evento.Id,
                    CodEvento = evento.CodEvento,
                    Nombre = evento.Nombre
                };
            }
            catch (Exception ex)
            {
                throw new Exception("Error al validar el PIN del evento", ex);
            }
        }
    
        public async Task<IEnumerable<ConfigTiemposCategoriasDto>> ListarConfiguracionesTiempoAsync(int eventoId)
        {
        
            var categorias = await _categoriaRepository.ObtenerPorEventoIdConFechasAsync(eventoId);

            return categorias.Select(c => new ConfigTiemposCategoriasDto
            {
                EventoId = c.EventoId,
                CategoriaId = c.CategoriaId,
                Nombre = c.Nombre,
                FechaIni = c.FechaIni,
                FechaFin = c.FechaFin
            });
        }

        public async Task<bool> ActualizarTiemposAsync(ConfigTiemposCategoriasDto request)
        {
           
            var categoria = await _categoriaRepository.ObtenerPorIdAsync(request.CategoriaId);

            if (categoria == null)
            {
                return false; // El controlador devolverá un 404
            }
            
            categoria.FechaIni = request.FechaIni;
            categoria.FechaFin = request.FechaFin;
           
            return await _categoriaRepository.ActualizarAsync(categoria);
        }
        public async Task<EventoDetalleDto> GetEventoDetalleAsync(int eventoId)
        {
            try
            {
                // Obtener el evento básico
                var eventoResponse = await _supabase
                    .From<EventoLite>()
                    .Filter("id", Supabase.Postgrest.Constants.Operator.Equals, eventoId.ToString())
                    .Get();

                var evento = eventoResponse.Models.FirstOrDefault()
                    ?? throw new Exception("Evento no encontrado.");

                // Obtener baremos del evento
                var baremosResponse = await _supabase
                    .From<Baremo>()
                    .Filter("idevento", Supabase.Postgrest.Constants.Operator.Equals, eventoId.ToString())
                    .Get();

                var baremosDto = new List<BaremoDetalleDto>();
                foreach (var baremo in baremosResponse.Models)
                {
                    // Obtener criterios de cada baremo
                    var criteriosResponse = await _supabase
                        .From<Criterio>()
                        .Filter("idbaremo", Supabase.Postgrest.Constants.Operator.Equals, baremo.Id.ToString())
                        .Get();

                    baremosDto.Add(new BaremoDetalleDto
                    {
                        Id = baremo.Id,
                        Nombre = baremo.Nombre,
                        Criterios = criteriosResponse.Models.Select(c => new CriterioDetalleDto
                        {
                            Id = c.Id,
                            Nombre = c.Nombre,
                            Peso = c.Peso,
                            TipoCriterio = c.TipoCriterio.ToString(),
                            ComentarioObligatorio = c.ComentarioObligatorio
                        }).ToList()
                    });
                }

                // Obtener categorías del evento
                var categoriasResponse = await _supabase
                    .From<Categoria>()
                    .Filter("idevento", Supabase.Postgrest.Constants.Operator.Equals, eventoId.ToString())
                    .Get();

                var categoriasDto = new List<CategoriaDetalleDto>();
                foreach (var cat in categoriasResponse.Models)
                {
                    // Obtener pesos de cada categoría
                    var pesosResponse = await _supabase
                        .From<PesoCategoriaRol>()
                        .Filter("idcategoria", Supabase.Postgrest.Constants.Operator.Equals, cat.Id.ToString())
                        .Get();

                    categoriasDto.Add(new CategoriaDetalleDto
                    {
                        Id = cat.Id,
                        Nombre = cat.Nombre,
                        Pesos = pesosResponse.Models.Select(p => new PesoRolDetalleDto
                        {
                            RolVotante = p.RolVotante,
                            Peso = p.Peso
                        }).ToList()
                    });
                }

                return new EventoDetalleDto
                {
                    Id = evento.Id,
                    Nombre = evento.Nombre,
                    Descripcion = evento.Descripcion,
                    FechaInicio = evento.FechaInicio,
                    FechaFin = evento.FechaFin,
                    TipoEvento = evento.TipoEvento,
                    Estado = evento.Estado,
                    CodEvento = evento.CodEvento,
                    IdOrganizador = evento.IdOrganizador,
                    ComentariosObligatorios = evento.ComentariosObligatorios,
                    Baremos = baremosDto,
                    Categorias = categoriasDto
                };
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener el detalle del evento", ex);
            }
        }

        public async Task<EventoDetalleDto> UpdateEventoAsync(int eventoId, UpdateEventDto dto)
        {
            try
            {
                // Verificar que el evento existe
                var eventoResponse = await _supabase
                    .From<EventoLite>()
                    .Filter("id", Supabase.Postgrest.Constants.Operator.Equals, eventoId.ToString())
                    .Get();

                var evento = eventoResponse.Models.FirstOrDefault()
                    ?? throw new Exception("Evento no encontrado.");

                // Verificar si el evento está en votación (bloquear edición de baremos)
                bool enVotacion = evento.Estado == "Activo" || evento.Estado == "EnVotacion";

                // Actualizar campos básicos del evento
                await _supabase
                    .From<EventoLite>()
                    .Filter("id", Supabase.Postgrest.Constants.Operator.Equals, eventoId.ToString())
                    .Set(e => e.Nombre, dto.Nombre)
                    .Set(e => e.Descripcion, dto.Descripcion)
                    .Set(e => e.FechaInicio, dto.FechaInicio)
                    .Set(e => e.FechaFin, dto.FechaFin)
                    .Set(e => e.TipoEvento, dto.TipoEvento)
                    .Set(e => e.ComentariosObligatorios, dto.ComentariosObligatorios)
                    .Update();

                // Solo actualizar baremos/criterios si NO está en votación
                if (!enVotacion && dto.Baremos != null)
                {
                    // Borrar criterios existentes de los baremos del evento
                    var baremosExistentes = await _supabase
                        .From<Baremo>()
                        .Filter("idevento", Supabase.Postgrest.Constants.Operator.Equals, eventoId.ToString())
                        .Get();

                    foreach (var baremo in baremosExistentes.Models)
                    {
                        // Borrar criterios del baremo
                        await _supabase
                            .From<Criterio>()
                            .Filter("idbaremo", Supabase.Postgrest.Constants.Operator.Equals, baremo.Id.ToString())
                            .Delete();
                    }

                    // Borrar baremos existentes
                    await _supabase
                        .From<Baremo>()
                        .Filter("idevento", Supabase.Postgrest.Constants.Operator.Equals, eventoId.ToString())
                        .Delete();

                    // Crear nuevos baremos con sus criterios
                    foreach (var baremoDto in dto.Baremos)
                    {
                        var nuevoBaremo = new Baremo
                        {
                            Nombre = baremoDto.Nombre,
                            IdEvento = eventoId
                        };

                        var baremoCreado = await _supabase.From<Baremo>().Insert(nuevoBaremo);
                        var baremoId = baremoCreado.Models.First().Id;

                        if (baremoDto.Criterios != null)
                        {
                            foreach (var criterioDto in baremoDto.Criterios)
                            {
                                var tipoCriterio = Enum.Parse<TipoCriterioEnum>(criterioDto.TipoCriterio, ignoreCase: true);

                                var nuevoCriterio = new Criterio
                                {
                                    Nombre = criterioDto.Nombre,
                                    Peso = (float)criterioDto.Peso,
                                    TipoCriterio = tipoCriterio,
                                    IdBaremo = baremoId,
                                    ComentarioObligatorio = criterioDto.ComentarioObligatorio
                                };

                                await _supabase.From<Criterio>().Insert(nuevoCriterio);
                            }
                        }
                    }
                }

                // Actualizar categorías solo si se proporcionan y el evento NO está en votación
                if (!enVotacion && dto.Categorias != null)
                {
                    // Obtener categorías existentes
                    var categoriasExistentesRes = await _supabase
                        .From<Categoria>()
                        .Filter("idevento", Supabase.Postgrest.Constants.Operator.Equals, eventoId.ToString())
                        .Get();
                    
                    var categoriasExistentes = categoriasExistentesRes.Models;

                    // Para cada categoría en el DTO
                    foreach (var catDto in dto.Categorias)
                    {
                        // Buscar si ya existe por nombre (o podrías usar ID si el DTO lo tuviera)
                        var existente = categoriasExistentes.FirstOrDefault(c => c.Nombre == catDto.Nombre);
                        int catId;

                        if (existente != null)
                        {
                            catId = existente.Id;
                            // Actualizar pesos si es necesario (primero borrar pesos viejos de esta cat)
                            await _supabase.From<PesoCategoriaRol>()
                                .Filter("idcategoria", Supabase.Postgrest.Constants.Operator.Equals, catId.ToString())
                                .Delete();
                        }
                        else
                        {
                            // Crear nueva
                            var nuevaCat = new Categoria { Nombre = catDto.Nombre, IdEvento = eventoId };
                            var catCreada = await _supabase.From<Categoria>().Insert(nuevaCat);
                            catId = catCreada.Models.First().Id;
                        }

                        // Insertar nuevos pesos
                        if (catDto.Pesos != null)
                        {
                            foreach (var pesoDto in catDto.Pesos)
                            {
                                await _supabase.From<PesoCategoriaRol>().Insert(new PesoCategoriaRol
                                {
                                    IdCategoria = catId,
                                    RolVotante = pesoDto.RolVotante,
                                    Peso = (float)pesoDto.Peso
                                });
                            }
                        }
                    }

                    // Opcional: Borrar categorías que NO están en el DTO y NO tienen proyectos
                    // Pero por seguridad y para evitar el error 23503 que viste, 
                    // simplemente no borraremos categorías de forma masiva aquí.
                }

                // Devolver el evento actualizado
                return await GetEventoDetalleAsync(eventoId);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al actualizar el evento", ex);
            }
        }
    }
}



