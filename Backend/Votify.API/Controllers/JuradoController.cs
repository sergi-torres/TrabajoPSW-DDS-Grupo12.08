using Microsoft.AspNetCore.Mvc;
using Votify.API.Services;
using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Filters;

namespace Votify.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [OrganizerOnly]
    public class JuradoController : ControllerBase
    {
        private readonly IJuradoService _juradoService;

        public JuradoController(IJuradoService juradoService)
        {
            _juradoService = juradoService;
        }

        [HttpPost("asignar")]
        public async Task<IActionResult> AsignarJurado([FromBody] AsignarJuradoRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Email))
                return BadRequest("El email es requerido");

            try 
            {
                var result = await _juradoService.AsignarJuradoPorEmailAsync(request.IdEvento, request.Email, request.CustomMessage);
                if (result) return Ok(new { message = "Invitacion enviada" });
                return StatusCode(500, "Error al asignar jurado");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("reenviar")]
        public async Task<IActionResult> ReenviarInvitacion([FromBody] AsignarJuradoRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Email))
                return BadRequest("El email es requerido");

            try 
            {
                var result = await _juradoService.ReenviarInvitacionAsync(request.IdEvento, request.Email);
                if (result) return Ok(new { message = "Invitacion reenviada correctamente" });
                return StatusCode(500, "Error al reenviar invitacion");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("evento/{idEvento}")]
        public async Task<ActionResult<List<UsuarioDto>>> GetJurados(int idEvento)
        {
            try 
            {
                var jurados = await _juradoService.GetJuradosEventoAsync(idEvento);
                return Ok(jurados);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener jurados: {ex.Message}");
            }
        }

        [HttpDelete("evento/{idEvento}/usuario/{idUsuario}")]
        public async Task<IActionResult> EliminarJurado(int idEvento, int idUsuario)
        {
            try
            {
                var result = await _juradoService.EliminarJuradoAsync(idEvento, idUsuario);
                if (result) return Ok(new { message = "Jurado eliminado correctamente" });
                return StatusCode(500, "Error al eliminar jurado");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }

    public class AsignarJuradoRequest
    {
        public int IdEvento { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? CustomMessage { get; set; }
    }
}
