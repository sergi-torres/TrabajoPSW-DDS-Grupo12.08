using Votify.API.Models.Domain.Factories;
using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Repositories;

namespace Votify.API.Services
{
    public class CreateEventService : ICreateEventService
    {
        private readonly IEventoRepository _eventoRepository;
        private readonly IEventoUsuarioRepository _eventoUsuarioRepository;
        private readonly IBaremoRepository _baremoRepository;
        private readonly ICategoriaRepository _categoriaRepository;

        public CreateEventService(
            IEventoRepository eventoRepository,
            IEventoUsuarioRepository eventoUsuarioRepository,
            IBaremoRepository baremoRepository,
            ICategoriaRepository categoriaRepository)
        {
            _eventoRepository = eventoRepository;
            _eventoUsuarioRepository = eventoUsuarioRepository;
            _baremoRepository = baremoRepository;
            _categoriaRepository = categoriaRepository;
        }

        public async Task<Event> CreateEventAsync(CreateEventDto eventDto)
        {
            var categorias = MapearCategorias(eventDto.Categorias);
            var baremos = MapearBaremos(eventDto.Baremos);

            EventCreator creator = eventDto.TipoEvento switch
            {
                "Hackaton" => new HackatonEventCreator(),
                "Evento Pequeño" => new SmallEventCreator(),
                "Feria" => new InnovationFairEventCreator(),
                _ => throw new ArgumentException($"Tipo de evento desconocido: {eventDto.TipoEvento}")
            };

            var NuevoEvento = creator.PrepareEvent(
              0,
              eventDto.Nombre,
              eventDto.Descripcion,
              eventDto.FechaInicio,
              eventDto.FechaFin,
              "Configuracion",
              eventDto.IdOrganizador,
              categorias,
              baremos,
              eventDto.CodEvento
            );

            NuevoEvento.ComentariosObligatorios = eventDto.ComentariosObligatorios;

            var eventoCreado = await _eventoRepository.InsertAsync(NuevoEvento);

            var relacion = new EventoUsuario
            {
                IdEvento = eventoCreado.Id,
                IdUsuario = eventDto.IdOrganizador,
                Rol = "Organizador"
            };

            await _eventoUsuarioRepository.CreateAsync(relacion);

            if (NuevoEvento.Baremos != null && NuevoEvento.Baremos.Any())
            {
                foreach (var baremo in NuevoEvento.Baremos)
                {
                    baremo.IdEvento = eventoCreado.Id;
                    var baremoCreado = await _baremoRepository.InsertAsync(baremo);

                    if (baremo.Criterios != null && baremo.Criterios.Any())
                    {
                        foreach (var criterio in baremo.Criterios)
                        {
                            criterio.IdBaremo = baremoCreado.Id;
                            await _baremoRepository.InsertCriterioAsync(criterio);
                        }
                    }
                }
            }

            foreach (var catDto in eventDto.Categorias)
            {
                await _categoriaRepository.InsertarAsync(new Categoria
                {
                    Nombre = catDto.Nombre,
                    IdEvento = eventoCreado.Id,
                    Estado = "Pendiente"
                });
            }

            return eventoCreado;
        }

        private List<Baremo> MapearBaremos(List<CreateBaremoDto> dtos)
        {
            var baremos = new List<Baremo>();

            if (dtos == null) return baremos;

            foreach (var dtoBaremo in dtos)
            {
                var criterios = new List<Criterio>();
                if (dtoBaremo.Criterios != null)
                {
                    foreach (var dtoCrit in dtoBaremo.Criterios)
                    {
                        var tipoEnum = Enum.Parse<TipoCriterioEnum>(dtoCrit.TipoCriterio, ignoreCase: true);

                        criterios.Add(new Criterio
                        {
                            Nombre = dtoCrit.Nombre,
                            Peso = (float)dtoCrit.Peso,
                            TipoCriterio = tipoEnum,
                            ComentarioObligatorio = dtoCrit.ComentarioObligatorio
                        });
                    }
                }

                baremos.Add(new Baremo
                {
                    Nombre = dtoBaremo.Nombre,
                    Criterios = criterios
                });
            }

            return baremos;
        }


        private List<Categoria> MapearCategorias(List<CreateCategoriaDto> dtos)
        {
            var categorias = new List<Categoria>();

            if (dtos == null) return categorias;

            foreach (var dtoCat in dtos)
            {
                var pesos = new List<PesoCategoriaRol>();
                if (dtoCat.Pesos != null)
                {
                    foreach (var dtoPeso in dtoCat.Pesos)
                    {
                        pesos.Add(new PesoCategoriaRol
                        {
                            RolVotante = dtoPeso.RolVotante,
                            Peso = (float)dtoPeso.Peso
                        });
                    }
                }

                categorias.Add(new CategoriaConPesos
                {
                    Nombre = dtoCat.Nombre,
                    PesosPorRol = pesos
                });
            }

            return categorias;
        }

    }
}
