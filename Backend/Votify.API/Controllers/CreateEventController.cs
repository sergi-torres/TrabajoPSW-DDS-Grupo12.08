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

        // 2. Inyectamos el servicio (el controlador no hace la lógica, se la delega al servicio)
        public EventController(ICreateEventService eventService)
        {
            _eventService = eventService;
        }

        // 3. Este endpoint escucha peticiones POST (creación)
        [HttpPost]
        public async Task<IActionResult> CrearEvento([FromBody] CreateEventDto dto)
        {

            try
            {
                // Le pasamos el paquete al Servicio y esperamos (await) a que lo monte y guarde
                var eventoGuardado = await _eventService.CreateEventAsync(dto);

                // Devolvemos un código HTTP 201 (Created) que es el estándar para creaciones exitosas.
                // Le pasamos la URL ficticia de dónde podría ver su evento, y el objeto creado.
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
                // (Tipo de evento no válido)
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Hubo un problema al crear el evento.", detalle = ex.Message });
            }
        }
    }
}