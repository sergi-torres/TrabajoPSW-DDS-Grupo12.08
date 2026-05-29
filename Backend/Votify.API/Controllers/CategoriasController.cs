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

        public CategoriasController(ICategoriaRepository categoriaRepository)
        {
            _categoriaRepository = categoriaRepository;
        }

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

        [HttpGet("evento/{eventoId}")]
        public async Task<IActionResult> GetByEvento(int eventoId)
        {
            try
            {
                var categorias = await _categoriaRepository.ObtenerPorEventoIdAsync(eventoId);

                var dto = categorias.Select(c => new Votify.API.Models.DTOs.CategoriaResponseActualizadoDto
                {
                    Id = c.Id,
                    Nombre = c.Nombre,
                    IdEvento = c.IdEvento,
                    Estado = c.Estado
                });

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

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
                    IdEvento = categoria.IdEvento,
                    Estado = categoria.Estado
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCategoriaDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var categoria = new Categoria
                {
                    Nombre = dto.Nombre,
                    IdEvento = dto.IdEvento
                };

                var response = await _categoriaRepository.CrearAsync(categoria);

                if (dto.Pesos != null && dto.Pesos.Any())
                {
                    foreach (var peso in dto.Pesos)
                    {
                        await _categoriaRepository.InsertarPesoAsync(new PesoCategoriaRol
                        {
                            IdCategoria = response.Id,
                            RolVotante = peso.RolVotante,
                            Peso = peso.Peso
                        });
                    }
                }

                return Ok(new CategoriaResponseDto
                {
                    Id = response.Id,
                    Nombre = response.Nombre,
                    IdEvento = response.IdEvento
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}
