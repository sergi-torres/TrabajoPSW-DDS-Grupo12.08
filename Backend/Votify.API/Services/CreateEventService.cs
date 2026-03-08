using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Factories;
using System.Threading.Tasks;
using System;
using Supabase;
using System.Collections.Generic;
using System.Linq;

namespace Votify.API.Services
{
    public class CreateEventService : ICreateEventService
    {
        private readonly EventFactory _eventFactory;

        public CreateEventService(EventFactory eventFactory)
        {
            _eventFactory = eventFactory;
        }

        private readonly SupabaseClient _supabaseClient;

        public EventService(SupabaseClient supabaseClient)
        {
            _supabaseClient = supabaseClient;
        }

        public async Task<Event> CreateNewEventAsync(CreateEventDto eventDto)
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
            eventDto.Nombre,
            eventDto.Descripcion,
            eventDto.FechaInicio,
            eventDto.FechaFin,
            "Configuración", // por poner uno ahora mismo
            eventDto.IdOrganizador,
            categorias,
            baremos
          );

          var response = await _supabaseClient.From<Event>().Insert(NuevoEvento);
          
          if (response.Error != null)
          {
            throw response.Error;
          }

          return response.Model.First();
        }

        private List<Baremo> MapearBaremos(List<CreateBaremoDto> baremosDto)
        {
            return baremosDto.Select(b => new Baremo
            {
                Nombre = b.Nombre,
                Descripcion = b.Descripcion,
                Peso = b.Peso,
                TipoBaremo = b.TipoBaremo,
                IdEvento = b.IdEvento
            }).ToList();
        }

        private List<Categoria> MapearCategorias(List<CreateCategoriaDto> categoriasDto)
        {
            return categoriasDto.Select(c => new Categoria
            {
                Nombre = c.Nombre,
                Descripcion = c.Descripcion,
                IdEvento = c.IdEvento
            }).ToList();
        }
    }
}
    