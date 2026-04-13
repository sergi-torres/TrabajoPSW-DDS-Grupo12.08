using Microsoft.AspNetCore.Mvc;

using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;

namespace Votify.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ComentariosController : ControllerBase
    {
        private readonly Supabase.Client _supabase;

        public ComentariosController(Supabase.Client supabase)
        {
            _supabase = supabase;
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
