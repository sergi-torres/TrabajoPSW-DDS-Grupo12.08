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
                var eventoGuardado = await _eventService.CreateEventAsync(dto);

                return Created($"/api/event/{eventoGuardado.Id}", new
                {
                    id = eventoGuardado.Id,
                    nombre = eventoGuardado.Nombre,
                    estado = eventoGuardado.Estado,
                    mensaje = "¡Evento creado con éxito en Supabase!"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Hubo un problema al crear el evento.", detalle = ex.Message });
            }
        }
    }
}