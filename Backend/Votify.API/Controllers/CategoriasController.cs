using Microsoft.AspNetCore.Mvc;

using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Repositories;
using Votify.API.Services;

namespace Votify.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriasController : ControllerBase
    {
        private readonly ICategoriaRepository _categoriaRepository;
        private readonly ICategoriaService _categoriaService;

        public CategoriasController(ICategoriaRepository categoriaRepository, ICategoriaService categoriaService)
        {
            _categoriaRepository = categoriaRepository;
            _categoriaService = categoriaService;
        }

        // GET: api/categorias
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var categorias = await _categoriaRepository.ObtenerTodasAsync();
                return Ok(categorias.Select(c => new CategoriaResponseDto
                {
                    Id = c.Id,
                    Nombre = c.Nombre,
                    IdEvento = c.IdEvento
                }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        // GET: api/categorias/evento/1
        [HttpGet("evento/{eventoId}")]
        public async Task<IActionResult> GetByEvento(int eventoId)
        {
            try
            {
                var categorias = await _categoriaRepository.ObtenerPorEventoIdAsync(eventoId);

                var dto = categorias.Select(c => new CategoriaResponseDto
                {
                    Id = c.Id,
                    Nombre = c.Nombre,
                    IdEvento = c.IdEvento
                });

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // GET: api/categorias/evento/1
        [HttpGet("id/{categoriaId}")]
        public async Task<IActionResult> GetById(int categoriaId)
        {
            try
            {
                var categoria = await _categoriaRepository.ObtenerPorIdAsync(categoriaId);
                if (categoria == null)
                {
                    return NotFound();
                }

                var dto = new CategoriaResponseDto
                {
                    Id = categoria.Id,
                    Nombre = categoria.Nombre,
                    IdEvento = categoria.IdEvento
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // POST: api/categorias
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCategoriaDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Aquí solo creamos la categoría básica
                var categoria = new Categoria
                {
                    Nombre = dto.Nombre,
                    IdEvento = dto.IdEvento
                };

                // Insert en Supabase
                var response = await _categoriaRepository
                    .CrearAsync(categoria);

                return Ok(new CategoriaResponseDto
                {
                    Id = response.Id,
                    Nombre = response.Nombre,
                    IdEvento = response.IdEvento
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex); // mensaje de eror
                return StatusCode(500, ex.Message);
            }
        }

    }
}
