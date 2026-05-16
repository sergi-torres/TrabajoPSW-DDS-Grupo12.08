using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Repositories;

namespace Votify.API.Services
{
    public class EventoService : IEventoService
    {
        private readonly ICategoriaRepository _categoriaRepository;
        private readonly IProyectoRepository _proyectoRepository;
        private readonly IEventoRepository _eventoRepository;
        private readonly IEventoUsuarioRepository _eventoUsuarioRepository;
        private readonly IBaremoRepository _baremoRepository;

        public EventoService(
            ICategoriaRepository categoriaRepository, 
            IProyectoRepository proyectoRepository,
            IEventoRepository eventoRepository,
            IEventoUsuarioRepository eventoUsuarioRepository,
            IBaremoRepository baremoRepository)
        {
            _categoriaRepository = categoriaRepository;
            _proyectoRepository = proyectoRepository;
            _eventoRepository = eventoRepository;
            _eventoUsuarioRepository = eventoUsuarioRepository;
            _baremoRepository = baremoRepository;
        }

        public async Task<List<EventoResponseDto>> GetEventosByUsuarioAsync(int userId)
        {
            try
            {
                var relaciones = await _eventoUsuarioRepository.GetByUsuarioAsync(userId);
                var resultado = new List<EventoResponseDto>();

                foreach (var rel in relaciones)
                {
                    var evento = await _eventoRepository.GetByIdAsync(rel.IdEvento);
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
                var evento = await _eventoRepository.GetByCodigoAsync(codEvento);
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
                FechaFin = c.FechaFin,
                Estado = c.Estado
            });
        }

        public async Task<IEnumerable<CategoriaResponseActualizadoDto>> ListarCategoriasControlAsync(int eventoId)
        {
            var categorias = await _categoriaRepository.ObtenerTodosCamposAsync(eventoId);
            
            // Fetch projects to count them per category
            var proyectos = await _proyectoRepository.ObtenerPorEventoIdAsync(eventoId);

            foreach (var cat in categorias)
            {
                cat.CantidadProyectos = proyectos.Count(p => p.IdCategoria == cat.Id);
            }

            return categorias;
        }

        public async Task<bool> ActualizarLimiteVotosAsync(int eventoId, int? categoriaId, int votosMaximos)
        {
            var categorias = await _categoriaRepository.ObtenerCategoriasDominioPorEventoIdAsync(eventoId);
                
            bool success = true;

            foreach (var cat in categorias)
            {
                if (categoriaId.HasValue)
                {
                    if (cat.Id == categoriaId.Value)
                    {
                        cat.VotosMaximos = votosMaximos;
                        success &= await _categoriaRepository.ActualizarAsync(cat);
                    }
                }
                else
                {
                    if (cat.Estado == "Pendiente")
                    {
                        cat.VotosMaximos = votosMaximos;
                        success &= await _categoriaRepository.ActualizarAsync(cat);
                    }
                }
            }

            return success;
        }

        public async Task<bool> ActualizarEstadoCategoriaAsync(int categoriaId, string nuevoEstado)
        {
            var categoria = await _categoriaRepository.ObtenerPorIdAsync(categoriaId);
            if (categoria == null) return false;

            categoria.Estado = nuevoEstado;
            return await _categoriaRepository.ActualizarAsync(categoria);
        }

        public async Task<bool> ActualizarTiemposAsync(ConfigTiemposCategoriasDto request)
        {
           
            var categoria = await _categoriaRepository.ObtenerPorIdAsync(request.CategoriaId);

            if (categoria == null)
            {
                return false;
            }
            
            categoria.FechaIni = request.FechaIni;
            categoria.FechaFin = request.FechaFin;
           
            return await _categoriaRepository.ActualizarAsync(categoria);
        }

        public async Task<EventoDetalleDto> GetEventoDetalleAsync(int eventoId)
        {
            try
            {
                var evento = await _eventoRepository.GetByIdAsync(eventoId)
                    ?? throw new Exception("Evento no encontrado.");

                var baremos = await _baremoRepository.GetByEventoIdAsync(eventoId);
                var baremosDto = new List<BaremoDetalleDto>();

                foreach (var baremo in baremos)
                {
                    var criterios = await _baremoRepository.GetCriteriosByBaremoIdAsync(baremo.Id);

                    baremosDto.Add(new BaremoDetalleDto
                    {
                        Id = baremo.Id,
                        Nombre = baremo.Nombre,
                        Criterios = criterios.Select(c => new CriterioDetalleDto
                        {
                            Id = c.Id,
                            Nombre = c.Nombre,
                            Peso = c.Peso,
                            TipoCriterio = c.TipoCriterio.ToString(),
                            ComentarioObligatorio = c.ComentarioObligatorio
                        }).ToList()
                    });
                }

                var categorias = await _categoriaRepository.ObtenerCategoriasDominioPorEventoIdAsync(eventoId);
                var categoriasDto = new List<CategoriaDetalleDto>();

                foreach (var cat in categorias)
                {
                    var pesos = await _categoriaRepository.ObtenerPesosPorCategoriaIdAsync(cat.Id);

                    categoriasDto.Add(new CategoriaDetalleDto
                    {
                        Id = cat.Id,
                        Nombre = cat.Nombre,
                        Pesos = pesos.Select(p => new PesoRolDetalleDto
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
                var evento = await _eventoRepository.GetByIdAsync(eventoId)
                    ?? throw new Exception("Evento no encontrado.");

                bool enVotacion = evento.Estado == "Activo" || evento.Estado == "EnVotacion";

                await _eventoRepository.UpdateBasicAsync(eventoId, dto);

                if (!enVotacion && dto.Baremos != null)
                {
                    var baremosExistentes = await _baremoRepository.GetByEventoIdAsync(eventoId);
                    var nombresBaremosDto = dto.Baremos.Select(b => b.Nombre).ToList();

                    foreach (var baremoExistente in baremosExistentes)
                    {
                        if (!nombresBaremosDto.Contains(baremoExistente.Nombre))
                        {
                            try
                            {
                                await _baremoRepository.DeleteCriteriosByBaremoIdAsync(baremoExistente.Id);
                                await _baremoRepository.DeleteAsync(baremoExistente.Id);
                            }
                            catch (Exception ex)
                            {
                                if (ex.Message.Contains("23503") || (ex.InnerException != null && ex.InnerException.Message.Contains("23503")))
                                {
                                    throw new Exception($"No se puede eliminar el baremo '{baremoExistente.Nombre}' porque ya tiene votos registrados.");
                                }
                                throw;
                            }
                        }
                    }

                    foreach (var baremoDto in dto.Baremos)
                    {
                        var baremoExistente = baremosExistentes.FirstOrDefault(b => b.Nombre == baremoDto.Nombre);
                        int baremoId;

                        if (baremoExistente != null)
                        {
                            baremoId = baremoExistente.Id;
                        }
                        else
                        {
                            var nuevoBaremo = new Baremo { Nombre = baremoDto.Nombre, IdEvento = eventoId };
                            var baremoCreado = await _baremoRepository.InsertAsync(nuevoBaremo);
                            baremoId = baremoCreado.Id;
                        }

                        if (baremoDto.Criterios != null)
                        {
                            var criteriosExistentes = await _baremoRepository.GetCriteriosByBaremoIdAsync(baremoId);
                            var nombresCriteriosDto = baremoDto.Criterios.Select(c => c.Nombre).ToList();

                            foreach (var criterioExistente in criteriosExistentes)
                            {
                                if (!nombresCriteriosDto.Contains(criterioExistente.Nombre))
                                {
                                    try
                                    {
                                        await _baremoRepository.DeleteCriterioAsync(criterioExistente.Id);
                                    }
                                    catch (Exception ex)
                                    {
                                        if (ex.Message.Contains("23503") || (ex.InnerException != null && ex.InnerException.Message.Contains("23503")))
                                        {
                                            throw new Exception($"No se puede eliminar el criterio '{criterioExistente.Nombre}' porque ya tiene votos registrados.");
                                        }
                                        throw;
                                    }
                                }
                            }

                            foreach (var criterioDto in baremoDto.Criterios)
                            {
                                var tipoCriterio = Enum.Parse<TipoCriterioEnum>(criterioDto.TipoCriterio, ignoreCase: true);
                                var criterioExistente = criteriosExistentes.FirstOrDefault(c => c.Nombre == criterioDto.Nombre);

                                if (criterioExistente != null)
                                {
                                    criterioExistente.Peso = (float)criterioDto.Peso;
                                    criterioExistente.TipoCriterio = tipoCriterio;
                                    criterioExistente.ComentarioObligatorio = criterioDto.ComentarioObligatorio;
                                    await _baremoRepository.UpdateCriterioAsync(criterioExistente);
                                }
                                else
                                {
                                    var nuevoCriterio = new Criterio
                                    {
                                        Nombre = criterioDto.Nombre,
                                        Peso = (float)criterioDto.Peso,
                                        TipoCriterio = tipoCriterio,
                                        IdBaremo = baremoId,
                                        ComentarioObligatorio = criterioDto.ComentarioObligatorio
                                    };
                                    await _baremoRepository.InsertCriterioAsync(nuevoCriterio);
                                }
                            }
                        }
                    }
                }

                if (!enVotacion && dto.Categorias != null)
                {
                    var categoriasExistentes = await _categoriaRepository.ObtenerCategoriasDominioPorEventoIdAsync(eventoId);

                    foreach (var catDto in dto.Categorias)
                    {
                        var existente = categoriasExistentes.FirstOrDefault(c => c.Nombre == catDto.Nombre);
                        int catId;

                        if (existente != null)
                        {
                            catId = existente.Id;
                            await _categoriaRepository.EliminarPesosPorCategoriaIdAsync(catId);
                        }
                        else
                        {
                            var nuevaCat = new Categoria { Nombre = catDto.Nombre, IdEvento = eventoId };
                            var catCreada = await _categoriaRepository.InsertarAsync(nuevaCat);
                            catId = catCreada.Id;
                        }

                        if (catDto.Pesos != null)
                        {
                            foreach (var pesoDto in catDto.Pesos)
                            {
                                await _categoriaRepository.InsertarPesoAsync(new PesoCategoriaRol
                                {
                                    IdCategoria = catId,
                                    RolVotante = pesoDto.RolVotante,
                                    Peso = (float)pesoDto.Peso
                                });
                            }
                        }
                    }
                }

                return await GetEventoDetalleAsync(eventoId);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al actualizar el evento", ex);
            }
        }

        public async Task<List<EventoResponseDto>> GetEventosDisponiblesAsync(int userId)
        {
            try
            {
                var todos = await _eventoRepository.GetAllAsync();
                var misRelaciones = await _eventoUsuarioRepository.GetByUsuarioAsync(userId);
                var misEventoIds = misRelaciones.Select(r => r.IdEvento).ToHashSet();

                return todos
                    .Where(e => !misEventoIds.Contains(e.Id))
                    .Select(e => new EventoResponseDto
                    {
                        Id = e.Id,
                        CodEvento = e.CodEvento,
                        Nombre = e.Nombre,
                        Descripcion = e.Descripcion,
                        FechaIni = e.FechaInicio,
                        FechaFin = e.FechaFin,
                        Estado = e.Estado
                    })
                    .ToList();
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener los eventos disponibles", ex);
            }
        }

        public async Task<bool> UnirseAEventoAsync(int eventoId, int userId)
        {
            try
            {
                var existing = await _eventoUsuarioRepository.GetAsync(eventoId, userId);
                if (existing != null)
                    throw new Exception("Ya estás inscrito en este evento.");

                await _eventoUsuarioRepository.CreateAsync(new EventoUsuario
                {
                    IdEvento = eventoId,
                    IdUsuario = userId,
                    Rol = "Participante"
                });
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al unirse al evento", ex);
            }
        }

        public async Task<bool> AbandonarEventoAsync(int eventoId, int userId)
        {
            try
            {
                return await _eventoUsuarioRepository.DeleteAsync(eventoId, userId);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al abandonar el evento", ex);
            }
        }
    }
}
