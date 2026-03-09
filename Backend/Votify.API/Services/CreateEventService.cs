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
              "Configuración", // por poner uno ahora mismo
              eventDto.IdOrganizador,
              categorias,
              baremos
            );

            var response = await _supabaseClient.From<Event>().Insert(NuevoEvento);

            return response.Models.First();
        }

        private List<Baremo> MapearBaremos(List<CreateBaremoDto> dtos)
        {
            var baremos = new List<Baremo>();

            if (dtos == null) return baremos;

            foreach (var dtoBaremo in dtos)
            {
                // 1. Primero traducimos los criterios que van por dentro
                var criterios = new List<Criterio>();
                if (dtoBaremo.Criterios != null)
                {
                    foreach (var dtoCrit in dtoBaremo.Criterios)
                    {
                        // TRUCO: Convertimos el texto (ej: "Numerico") al Enum real de C#
                        // 'ignoreCase: true' hace que funcione aunque el Frontend mande "numerico" o "NUMERICO"
                        var tipoEnum = Enum.Parse<TipoCriterioEnum>(dtoCrit.TipoCriterio, ignoreCase: true);

                        criterios.Add(new Criterio
                        {
                            Nombre = dtoCrit.Nombre,
                            Peso = (float)dtoCrit.Peso,
                            TipoCriterio = tipoEnum
                        });
                    }
                }

                // 2. Luego montamos el baremo y le metemos sus criterios
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

            // Si no hay categorías, devolvemos la lista vacía para que no pete
            if (dtos == null) return categorias;

            foreach (var dtoCat in dtos)
            {
                // 1. Primero traducimos los pesos que van por dentro
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
                categorias.Add(new Categoria
                {
                    Nombre = dtoCat.Nombre,
                    PesosPorRol = pesos
                });
            }

            return categorias;
        }
    }
}
