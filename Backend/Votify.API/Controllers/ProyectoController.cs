using Microsoft.AspNetCore.Mvc;

using Votify.API.Models.Domain;
using Votify.API.Repositories;

namespace Votify.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProyectoController : ControllerBase
    {
        private readonly IProyectoRepository _proyectoRepository;

        public ProyectoController(IProyectoRepository proyectoRepository)
        {
            _proyectoRepository = proyectoRepository;
        }

        // GET: api/proyecto
        [HttpGet]
        public async Task<ActionResult<List<Proyecto>>> ObtenerTodos()
        {
            var proyectos = await _proyectoRepository.ObtenerTodosAsync();
            return Ok(proyectos);
        }

        // GET: api/proyecto/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Proyecto>> ObtenerPorId(int id)
        {
            var proyecto = await _proyectoRepository.ObtenerPorIdAsync(id);

            if (proyecto == null)
                return NotFound();

            return Ok(proyecto);
        }

        // GET: api/proyecto/categoria/{categoriaId}
        [HttpGet("categoria/{categoriaId}")]
        public async Task<ActionResult<List<Proyecto>>> ObtenerPorCategoria(int categoriaId)
        {
            var proyectos = await _proyectoRepository.ObtenerPorCategoriaIdAsync(categoriaId);
            return Ok(proyectos);
        }

        // GET: api/proyecto/participante/{id}
        [HttpGet("participante/{id}")]
        public async Task<ActionResult<List<Proyecto>>> ObtenerPorParticipante(int id)
        {
            var proyectos = await _proyectoRepository.ObtenerPorIdParticipanteAsync(id);
            return Ok(proyectos);
        }

        // GET: api/proyecto/evento/{eventoId}
        [HttpGet("evento/{eventoId}")]
        public async Task<ActionResult<List<Proyecto>>> ObtenerPorEvento(int eventoId)
        {
            var proyectos = await _proyectoRepository.ObtenerPorEventoIdAsync(eventoId);
            return Ok(proyectos);
        }
    }
}
