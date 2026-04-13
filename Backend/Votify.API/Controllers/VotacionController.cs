using Microsoft.AspNetCore.Mvc;

using Votify.API.Models.DTOs;
using Votify.API.Services;

namespace Votify.API.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class VotacionController : ControllerBase
    {
        private readonly IVotoService _votoService;
        private readonly IComentarioCualitativoService _comentarioService;


        public VotacionController(
        IVotoService votoService,
        IComentarioCualitativoService comentarioService)
        {
            _votoService = votoService;
            _comentarioService = comentarioService;
        }

        [HttpPost("votar")]
        public async Task<IActionResult> VotarAsync(VotoRequestDto request)
        {
            try
            {
                var result = await _votoService.ProcesarVotoAsync(request);

                if (!string.IsNullOrWhiteSpace(request.Comentario))
                {
                    await _comentarioService.CreateComentarioAsync(
                        request.ProyectoId,
                        request.Comentario
                    );
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.InnerException?.Message ?? ex.Message);
            }
        }



        [HttpGet("dashboard")]
        public async Task<IActionResult> ObtenerDashboard([FromQuery] int eventoId)
        {
            try
            {
                var dashboard = await _votoService.ObtenerDashboardAsync(eventoId);
                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                // Retornar error con detalles
                return BadRequest(new { error = ex.Message, inner = ex.InnerException?.Message, stack = ex.StackTrace });
            }
        }
    }
}