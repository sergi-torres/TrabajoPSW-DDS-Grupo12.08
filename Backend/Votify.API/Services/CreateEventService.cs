using Votify.API.Models.Domain.Factories;
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

            NuevoEvento.ComentariosObligatorios = eventDto.ComentariosObligatorios;

            var response = await _supabaseClient.From<Event>().Insert(NuevoEvento);
            var eventoCreado = response.Models.First();

            var relacion = new EventoUsuario
            {
                IdEvento = eventoCreado.Id,
                IdUsuario = eventDto.IdOrganizador,
                Rol = "Organizador"
            };

            await _supabaseClient.From<EventoUsuario>().Insert(relacion);

            // Insertar Baremos y Criterios si existen
            if (NuevoEvento.Baremos != null && NuevoEvento.Baremos.Any())
            {
                foreach (var baremo in NuevoEvento.Baremos)
                {
                    baremo.IdEvento = eventoCreado.Id;
                    var baremoResponse = await _supabaseClient.From<Baremo>().Insert(baremo);
                    var baremoCreado = baremoResponse.Models.First();

                    if (baremo.Criterios != null && baremo.Criterios.Any())
                    {
                        foreach (var criterio in baremo.Criterios)
                        {
                            criterio.IdBaremo = baremoCreado.Id;
                            await _supabaseClient.From<Criterio>().Insert(criterio);
                        }
                    }
                }
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

                // 2. Luego montamos la categoría y le metemos sus pesos
                categorias.Add(new CategoriaConPesos
                {
                    Nombre = dtoCat.Nombre,
                    PesosPorRol = pesos
                });
            }

            return categorias;
        }

        public async Task<Categoria> CreateAsync(Categoria categoria)
        {
            try
            {
                var response = await _supabaseClient
                    .From<Categoria>()
                    .Insert(categoria);

                if (response?.Models == null || response.Models.Count == 0)
                {
                    throw new Exception("No se pudo crear la categoría");
                }

                return response.Models[0];
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al crear la categoría: {ex.Message}", ex);
            }
        }
    }
}
