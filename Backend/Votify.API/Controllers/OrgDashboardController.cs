using Microsoft.AspNetCore.Mvc;
using Votify.API.Models.DTOs;
using Votify.API.Services;

namespace Votify.API.Controllers
{
    [ApiController]
    [Route("api/OrgDashboard")]
    public class OrgDashboardController : ControllerBase
    {
        private readonly IOrgDashboardService _dashboardService;

        public OrgDashboardController(IOrgDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("{eventoId}")]
        public async Task<IActionResult> GetDashboardAsync(int eventoId)
        {
            try
            {
                var dashboard = await _dashboardService.GetDashboardAsync(eventoId);
                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.InnerException?.Message ?? ex.Message);
            }
        }

        [HttpPost("{eventoId}/extend")]
        public async Task<IActionResult> ExtenderTiempoAsync(int eventoId, [FromBody] ExtenderTiempoRequestDto request)
        {
            try
            {
                await _dashboardService.ExtenderTiempoAsync(eventoId, request.MinutosExtra);
                return Ok(new { message = $"Tiempo extendido {request.MinutosExtra} minutos." });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.InnerException?.Message ?? ex.Message);
            }
        }

        [HttpPost("{eventoId}/close")]
        public async Task<IActionResult> CerrarVotacionAsync(int eventoId)
        {
            try
            {
                await _dashboardService.CerrarVotacionAsync(eventoId);
                return Ok(new { message = "Votación cerrada." });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.InnerException?.Message ?? ex.Message);
            }
        }
    }
}
