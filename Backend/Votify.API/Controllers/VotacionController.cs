using Microsoft.AspNetCore.Mvc;
using Votify.API.Models.DTOs;
using Votify.API.Repositories;
using Votify.API.Services;

namespace Votify.API.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class VotacionController : ControllerBase
    {
        private readonly IVotoService _votoService;
        private readonly ICategoriaRepository _categoriaRepository;
        private readonly IProyectoRepository _proyectoRepository;

        public VotacionController(IVotoService votoService, ICategoriaRepository categoriaRepository, IProyectoRepository proyectoRepository)
        {
            _votoService = votoService;
            _categoriaRepository = categoriaRepository;
            _proyectoRepository = proyectoRepository;
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

        [HttpGet("debug-bd")]
        public async Task<IActionResult> DebugBD()
        {
            var categorias = await _categoriaRepository.ObtenerTodasAsync();
            var proyectos = await _proyectoRepository.ObtenerTodosAsync();
            return Ok(new
            {
                totalCategorias = categorias.Count,
                totalProyectos = proyectos.Count,
                categorias = categorias.Select(c => new { c.Id, c.Nombre, c.IdEvento }),
                proyectos = proyectos.Select(p => new { p.Id, p.Nombre, p.IdCategoria })
            });
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