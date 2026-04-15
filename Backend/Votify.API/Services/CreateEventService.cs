using Votify.API.Factories;
using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;

namespace Votify.API.Services
{
    public class CreateEventService : ICreateEventService
    {
        private readonly Supabase.Client _supabaseClient;

        public CreateEventService(Supabase.Client supabaseClient)
        {
            _supabaseClient = supabaseClient;
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

            var NuevoEvento = creator.CreateEvent(
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

            var response = await _supabaseClient.From<Event>().Insert(NuevoEvento);
            var eventoCreado = response.Models.First();

            var relacion = new EventoUsuario
            {
                IdEvento = eventoCreado.Id,
                IdUsuario = eventDto.IdOrganizador,
                Rol = "Organizador"
            };

            await _supabaseClient.From<EventoUsuario>().Insert(relacion);

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
                            TipoCriterio = tipoEnum
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

                // 2. Luego montamos la categoría y le metemos sus pesos
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
