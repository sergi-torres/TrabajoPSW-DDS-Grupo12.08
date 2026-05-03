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
        private readonly Supabase.Client _supabase;
        private readonly IVotoService _votoService;

        public ComentariosController(Supabase.Client supabase, IVotoService votoService)
        {
            _supabase = supabase;
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
            var response = await _supabase
                .From<ComentarioCualitativo>()
                .Where(x => x.IdVotacion == idVotacion)
                .Get();

            var dto = response.Models.Select(c => new ComentarioRequestDTO
            {
                Id = c.Id,
                Comentario = c.Comentario,
                Fecha = c.Fecha
            });


            //Console.WriteLine($"Comentarios obtenidos para votación {idVotacion}: {dto.Count()} texto: {string.Join(", ", dto.Select(d => d.Comentario))}");


            return Ok(dto);
        }



        [HttpPost]
        public async Task<IActionResult> CreateComentario([FromBody] CreateComentarioDTO dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Comentario))
                    return BadRequest("El comentario no puede estar vacío");

                var comentario = new ComentarioCualitativo
                {
                    IdVotacion = dto.IdVotacion,
                    Comentario = dto.Comentario,
                    Fecha = DateTime.UtcNow
                };

                var response = await _supabase
                    .From<ComentarioCualitativo>()
                    .Insert(comentario);

                var insertado = response.Models.FirstOrDefault();

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
