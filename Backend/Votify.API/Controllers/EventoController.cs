using Microsoft.AspNetCore.Mvc;
using Votify.API.Services;
using Votify.API.Models.DTOs;

namespace Votify.API.Controllers
{
    [ApiController]
    [Route("api/Eventos")]
    public class EventoController : ControllerBase
    {
        private readonly IEventoService _eventoService;

        public EventoController(IEventoService eventoService)
        {
            _eventoService = eventoService;
        }

        [HttpGet("mis-eventos")]
        public async Task<IActionResult> GetMisEventosAsync([FromQuery] int userId)
        {
            try
            {
                var eventos = await _eventoService.GetEventosByUsuarioAsync(userId);
                return Ok(eventos);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.InnerException?.Message ?? ex.Message);
            }
        }

        [HttpPost("join")]
        public async Task<IActionResult> JoinEventoAsync([FromQuery] int pin)
        {
            try
            {
                var evento = await _eventoService.JoinEventoPorCodigoAsync(pin);
                return Ok(evento);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.InnerException?.Message ?? ex.Message);
            }
        }

        /// <summary>
        /// Obtener detalle completo de un evento (baremos, criterios, categorías)
        /// para el formulario de edición.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetEventoDetalleAsync(int id)
        {
            try
            {
                var detalle = await _eventoService.GetEventoDetalleAsync(id);
                return Ok(detalle);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.InnerException?.Message ?? ex.Message);
            }
        }

        /// <summary>
        /// Actualizar un evento existente. Bloquea edición de baremos si está en votación.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEventoAsync(int id, [FromBody] UpdateEventDto dto)
        {
            try
            {
                var eventoActualizado = await _eventoService.UpdateEventoAsync(id, dto);
                return Ok(eventoActualizado);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.InnerException?.Message ?? ex.Message);
            }
        }
    }
}
