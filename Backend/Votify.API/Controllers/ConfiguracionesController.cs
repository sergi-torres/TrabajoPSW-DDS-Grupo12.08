
using Microsoft.AspNetCore.Mvc;
using Votify.API.Models.DTOs;
using Votify.API.Services;

namespace Votify.API.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class ConfiguracionesController : ControllerBase
    {
        private readonly IEventoService _eventoService;

        public ConfiguracionesController(
        IEventoService eventoService)
        {
            _eventoService = eventoService;
        }

        // GET: api/VotacionConfig/evento/5
        [HttpGet("evento/{eventoId}")]
        public async Task<IActionResult> ObtenerConfiguracionesTiemposEvento(int eventoId)
        {
            try 
            {
                var resultado = await _eventoService.ListarConfiguracionesTiempoAsync(eventoId);
                return Ok(resultado);
            }
            catch (Exception)
            {
                return StatusCode(500, "Error al recuperar la configuración");
            }
        }

        [HttpPost("configurar")]
        public async Task<IActionResult> ConfigurarTiempos([FromBody] ConfigTiemposCategoriasDto request)
        {
            if (request.CategoriaId <= 0) return BadRequest("El ID de categoría es obligatorio.");

            try
            {
                var exito = await _eventoService.ActualizarTiemposAsync(request);
                if (!exito) return NotFound("No se encontró la categoría especificada.");

                return Ok(new { message = "Configuración actualizada correctamente." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
       
    }
}





        