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


        public VotacionController(
        IVotoService votoService)
        {
            _votoService = votoService;
        }

        [HttpPost("votar")]
        public async Task<IActionResult> VotarAsync(VotoRequestDto request)
        {
            try
            {
                // IdUsuario viene del frontend (localStorage) - null = PIN flow, valor = Jurado flow
                var dashboard = await _votoService.ProcesarVotoAsync(request, request.IdUsuario, request.SessionId);

                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.InnerException?.Message ?? ex.Message);
            }
        }



        [HttpGet("dashboard")]
        public async Task<IActionResult> ObtenerDashboard([FromQuery] int eventoId, [FromQuery] int? idUsuario = null, [FromQuery] string? sessionId = null)
        {
            try
            {
                // idUsuario from query param (localStorage) - null = PIN flow, valor = Jurado flow
                var dashboard = await _votoService.ObtenerDashboardAsync(eventoId, idUsuario, sessionId);
                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message, inner = ex.InnerException?.Message, stack = ex.StackTrace });
            }
        }
    }
}