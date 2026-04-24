using Microsoft.AspNetCore.Mvc;

using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Repositories;

namespace Votify.API.Controllers
{
    [ApiController]
    [Route("api/proyectos")]
    public class ProyectosController : ControllerBase
    {
        private readonly IProyectoRepository _proyectoRepository;

        public ProyectosController(IProyectoRepository proyectoRepository)
        {
            _proyectoRepository = proyectoRepository;
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok("ProyectosController is working");
        }

        // GET: api/proyectos
        [HttpGet]
        public async Task<ActionResult<List<Proyecto>>> ObtenerTodos()
        {
            var proyectos = await _proyectoRepository.ObtenerTodosAsync();
            return Ok(proyectos);
        }

        // GET: api/proyectos/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Proyecto>> ObtenerPorId(int id)
        {
            var proyecto = await _proyectoRepository.ObtenerPorIdAsync(id);

            if (proyecto == null)
                return NotFound();

            return Ok(proyecto);
        }

        // GET: api/proyectos/categoria/{categoriaId}
        [HttpGet("categoria/{categoriaId}")]
        public async Task<ActionResult<List<Proyecto>>> ObtenerPorCategoria(int categoriaId)
        {
            var proyectos = await _proyectoRepository.ObtenerPorCategoriaIdAsync(categoriaId);
            return Ok(proyectos);
        }

        // GET: api/proyectos/participante/{id}
        [HttpGet("participante/{id}")]
        public async Task<ActionResult<List<ProyectoRequestDto>>> ObtenerPorParticipante(int id)
        {
            var proyectos = await _proyectoRepository.ObtenerPorIdParticipanteAsync(id);

            if (proyectos == null)
            {
                return Ok(new List<ProyectoRequestDto>());
            }

            var response = proyectos.Select(p => new ProyectoRequestDto
            {
                Id = p.Id,
                Nombre = p.Nombre,
                Descripcion = p.Descripcion,
                UrlMultimedia = p.UrlMultimedia,
                IdEvento = p.IdEvento,
                IdParticipante = p.IdParticipante,
                IdCategoria = p.IdCategoria,
                Estado = p.Estado,
                IdMiembros = p.IdMiembros
            }).ToList();

            return Ok(response);
        }

        // GET: api/proyectos/evento/{eventoId}
        [HttpGet("evento/{eventoId}")]
        public async Task<ActionResult<List<Proyecto>>> ObtenerPorEvento(int eventoId)
        {
            var proyectos = await _proyectoRepository.ObtenerPorEventoIdAsync(eventoId);
            return Ok(proyectos);
        }

        [HttpPost]
        public async Task<IActionResult> CrearProyecto([FromBody] Proyecto proyecto)
        {
            // No null
            if (proyecto == null)
            {
                return BadRequest("El proyecto no puede ser null");
            }

            var creado = await _proyectoRepository.CrearAsync(proyecto);

            // Se creó?
            if (creado == null)
            {
                return StatusCode(500, "Error al crear el proyecto");
            }

            // Mapear a DTO
            var response = new CreateProyectoDto
            {
                Nombre = creado.Nombre ?? string.Empty,
                Descripcion = creado.Descripcion ?? string.Empty,
                UrlMultimedia = creado.UrlMultimedia ?? string.Empty,
                IdEvento = creado.IdEvento ?? 0,
                IdParticipante = creado.IdParticipante,
                IdCategoria = creado.IdCategoria ?? 0,
                Estado = creado.Estado ?? "disponible",
                IdMiembros = creado.IdMiembros ?? new List<int>()
            };

            return Ok(response);
        }
    }
}
