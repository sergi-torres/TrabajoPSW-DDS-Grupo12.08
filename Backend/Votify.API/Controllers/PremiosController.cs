using Microsoft.AspNetCore.Mvc;
using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Services;

namespace Votify.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PremiosController : ControllerBase
    {
        private readonly IPremioService _premioService;
  
        public PremiosController(IPremioService premioService)
        {
            
            _premioService = premioService;

        }

        // GET: api/premios/evento/1
        [HttpGet("evento/{eventoId}")]
        public async Task<IActionResult> ObtenerPorEvento(int eventoId)
        {
            try
            {
                var premios = await _premioService.ObtenerPremiosDelEventoAsync(eventoId);
                
                return Ok(premios);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno obtener: {ex.Message}");
            }
        }

        [HttpPost("guardar")]
        public async Task<IActionResult> CrearPremio([FromBody] CrearPremioRequestDto premioDto)
        {
            try
            {                
                if (premioDto == null)
                {
                    return BadRequest("No se proporcionó información del premio.");
                }

                var seGuardo = await _premioService.CrearPremioAsync(premioDto);
                if (seGuardo == false)
                {
                    return BadRequest("Fallo en el service para guardar el premio.");
                }

                return Ok("Premio creado exitosamente.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno crear: {ex.Message}");
            }
        }

        [HttpDelete("eliminar/{premioId}")]
        public async Task<IActionResult> EliminarPremio(int premioId)
        {
            try
            {
                var seElimino = await _premioService.EliminarPremioAsync(premioId);
                if (seElimino == false)
                {
                    return BadRequest("Fallo en el serice para eliminar el premio.");
                }

                return Ok("Premio eliminado exitosamente.");

            }catch (Exception ex){
                return StatusCode(500, $"Error interno eliminar: {ex.Message}");
            }
        }

        [HttpPut("actualizar")]
        public async Task<IActionResult> ActualizarPremio([FromBody] ActualizarPremioRequestDto premioDto)
        {
            try
            {
                if (premioDto == null)
                {
                    return BadRequest("No se proporcionó información del premio.");
                }

                var seActualizo = await _premioService.ActualizarPremioAsync(premioDto.Id, premioDto);
                if (seActualizo == false)
                {
                    return BadRequest("Fallo en el serice para actualizar el premio.");
                }

                return Ok("Premio actualizado exitosamente.");

            }catch(Exception ex)
            {
                return StatusCode(500, $"Error interno actualizar: {ex.Message}");
            }
        }
    }
}