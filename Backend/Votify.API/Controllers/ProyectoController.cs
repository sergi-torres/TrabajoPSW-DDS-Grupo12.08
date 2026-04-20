using Microsoft.AspNetCore.Mvc;

using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
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

            var response = proyectos.Select(p => new ProyectoRequestDto
            {
                Id = p.Id,
                Nombre = p.Nombre,
                Descripcion = p.Descripcion,
                UrlMultimedia = p.UrlMultimedia,
                IdEvento = p.IdEvento,
                IdParticipante = p.IdParticipante,
                IdCategoria = p.IdCategoria,
                Estado = p.Estado
            }).ToList();

            return Ok(response);
        }

        // GET: api/proyecto/evento/{eventoId}
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

            //Console.WriteLine($"Recibido: Nombre={proyecto.Nombre}, Descripcion={proyecto.Descripcion}");

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
                Estado = creado.Estado ?? "disponible"  // ← Solución CS8602
            };

            //Console.WriteLine($"Creado: ID={creado.Id}, Nombre={response.Nombre}");

            return Ok(response);
        }
    }
}
