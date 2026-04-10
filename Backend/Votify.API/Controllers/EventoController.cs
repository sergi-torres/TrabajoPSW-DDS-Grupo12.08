using Microsoft.AspNetCore.Mvc;
using Votify.API.Services;

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
    }
}
