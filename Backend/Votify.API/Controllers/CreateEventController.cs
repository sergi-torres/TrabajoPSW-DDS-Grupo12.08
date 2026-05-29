using Microsoft.AspNetCore.Mvc;
using Votify.API.Services;
using Votify.API.Models.DTOs;

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
                if (dto.Categorias == null || dto.Categorias.Count == 0)
                    return BadRequest(new { error = "Debe especificar al menos una categoría" });

                var eventoGuardado = await _eventService.CreateEventAsync(dto);

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