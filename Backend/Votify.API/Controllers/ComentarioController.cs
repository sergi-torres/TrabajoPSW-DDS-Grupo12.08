using Microsoft.AspNetCore.Mvc;

using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Services;

namespace Votify.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ComentariosController : ControllerBase
    {
        private readonly IComentarioCualitativoService _comentarioService;
        private readonly IVotoService _votoService;

        public ComentariosController(IComentarioCualitativoService comentarioService, IVotoService votoService)
        {
            _comentarioService = comentarioService;
            _votoService = votoService;
        }

        [HttpGet("proyecto/{proyectoId}/categoria/{categoriaId}/resumen")]
        public async Task<IActionResult> GetResumenComentarios(int proyectoId, int categoriaId)
        {
            try
            {
                var resumen = await _votoService.ObtenerResumenComentariosAsync(proyectoId, categoriaId);
                return Ok(resumen);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener resumen de comentarios: {ex.Message}");
            }
        }

        [HttpGet("proyecto/{proyectoId}/categoria/{categoriaId}/usuario/{usuarioRef}")]
        public async Task<IActionResult> GetDetalleComentariosUsuario(int proyectoId, int categoriaId, string usuarioRef)
        {
            try
            {
                var detalle = await _votoService.ObtenerDetalleComentariosUsuarioAsync(proyectoId, categoriaId, usuarioRef);
                return Ok(detalle);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener detalle de comentarios: {ex.Message}");
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetComentarios([FromQuery] long idVotacion)
        {
            try
            {
                var comentarios = await _comentarioService.GetComentariosPorVotacion(idVotacion);

                var dto = comentarios.Select(c => new ComentarioRequestDTO
                {
                    Id = c.Id,
                    Comentario = c.Comentario,
                    Fecha = c.Fecha
                });

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener comentarios: {ex.Message}");
            }
        }



        [HttpPost]
        public async Task<IActionResult> CreateComentario([FromBody] CreateComentarioDTO dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Comentario))
                    return BadRequest("El comentario no puede estar vacío");

                var insertado = await _comentarioService.CreateComentarioAsync(dto.IdVotacion, dto.Comentario);

                if (insertado == null)
                    return StatusCode(500, "No se pudo crear el comentario");

                var resultado = new ComentarioRequestDTO
                {
                    Id = insertado.Id,
                    Fecha = insertado.Fecha,
                    IdVotacion = insertado.IdVotacion,
                    Comentario = insertado.Comentario
                };

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }
    }
}
