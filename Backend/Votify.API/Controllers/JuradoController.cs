using Microsoft.AspNetCore.Mvc;
using Votify.API.Services;
using Votify.API.Models.Domain;

namespace Votify.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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

            var result = await _juradoService.AsignarJuradoPorEmailAsync(request.IdEvento, request.Email);
            
            if (result)
                return Ok(new { message = $"Proceso de asignación/invitación para {request.Email} completado correctamente" });
            
            return StatusCode(500, "Error al asignar jurado");
        }

        [HttpGet("evento/{idEvento}")]
        public async Task<ActionResult<List<Usuario>>> GetJurados(int idEvento)
        {
            var jurados = await _juradoService.GetJuradosEventoAsync(idEvento);
            return Ok(jurados);
        }

        [HttpDelete("evento/{idEvento}/usuario/{idUsuario}")]
        public async Task<IActionResult> EliminarJurado(int idEvento, int idUsuario)
        {
            var result = await _juradoService.EliminarJuradoAsync(idEvento, idUsuario);
            if (result) return Ok(new { message = "Jurado eliminado correctamente" });
            return StatusCode(500, "Error al eliminar jurado");
        }
    }

    public class AsignarJuradoRequest
    {
        public int IdEvento { get; set; }
        public string Email { get; set; } = string.Empty;
    }
}
