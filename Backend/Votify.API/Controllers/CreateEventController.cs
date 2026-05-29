using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Votify.API.Services;
using Votify.API.Models.DTOs;
using Votify.API.Models.Domain;

namespace Votify.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventController : ControllerBase
    {
        private readonly ICreateEventService _eventService;


        public EventController(ICreateEventService eventService)
        {
            _eventService = eventService;
        }

        [HttpPost]
        public async Task<IActionResult> CrearEvento([FromBody] CreateEventDto dto)
        {
            try
            {
                // 1. Validar que haya al menos una categoría
                if (dto.Categorias == null || dto.Categorias.Count == 0)
                {
                    return BadRequest(new { error = "Debe especificar al menos una categoría" });
                }

                // 2. Crear el evento
                var eventoGuardado = await _eventService.CreateEventAsync(dto);

                // 3. Crear las categorías asociadas al evento
                foreach (var categoriaDto in dto.Categorias)
                {
                    var categoria = new Categoria
                    {
                        Nombre = categoriaDto.Nombre,
                        IdEvento = eventoGuardado.Id,
                        Estado = "Pendiente" // Estado inicial
                    };

                    await _eventService.CreateAsync(categoria);
                }

                return Created($"/api/event/{eventoGuardado.Id}", new
                {
                    id = eventoGuardado.Id,
                    nombre = eventoGuardado.Nombre,
                    estado = eventoGuardado.Estado,
                    categorias = dto.Categorias.Count,
                    mensaje = "¡Evento creado con éxito!"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}