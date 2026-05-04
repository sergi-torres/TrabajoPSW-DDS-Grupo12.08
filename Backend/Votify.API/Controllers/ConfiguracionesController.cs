
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

        [HttpGet("evento/{eventoId}/control")]
        public async Task<IActionResult> ObtenerCategoriasControl(int eventoId)
        {
            try 
            {
                var resultado = await _eventoService.ListarCategoriasControlAsync(eventoId);
                return Ok(resultado);
            }
            catch (Exception)
            {
                return StatusCode(500, "Error al recuperar las categorías");
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

        [HttpPatch("categoria/{id}/estado")]
        public async Task<IActionResult> ActualizarEstado(int id, [FromBody] ActualizarEstadoRequestDto request)
        {
            if (request == null || string.IsNullOrEmpty(request.NuevoEstado)) return BadRequest("El estado es obligatorio.");

            try
            {
                var exito = await _eventoService.ActualizarEstadoCategoriaAsync(id, request.NuevoEstado);
                if (!exito) return NotFound("No se encontró la categoría especificada.");

                return Ok(new { message = "Estado actualizado correctamente." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPatch("evento/{eventoId}/limite-votos")]
        public async Task<IActionResult> ActualizarLimiteVotos(int eventoId, [FromBody] ActualizarLimiteVotosRequestDto request)
        {
            if (request == null || request.VotosMaximos <= 0) return BadRequest("El límite de votos es obligatorio y debe ser mayor a 0.");

            try
            {
                var exito = await _eventoService.ActualizarLimiteVotosAsync(eventoId, request.CategoriaId, request.VotosMaximos);
                if (!exito) return StatusCode(500, "Error al actualizar el límite de votos.");

                return Ok(new { message = "Límite de votos actualizado correctamente." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}





        