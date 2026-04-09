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

        public VotacionController(IVotoService votoService)
        {
            _votoService = votoService;
        }

        [HttpPost("votar")]
        public async Task<IActionResult> VotarAsync(VotoRequestDto request)
        {
            try
            {
                var dashboard = await _votoService.ProcesarVotoAsync(request);
                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                // ex.InnerException contiene el error REAL de Supabase
                return BadRequest(ex.InnerException?.Message ?? ex.Message);
            }
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> ObtenerDashboard()
        {
            try
            {
                var dashboard = await _votoService.ObtenerDashboardAsync();
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