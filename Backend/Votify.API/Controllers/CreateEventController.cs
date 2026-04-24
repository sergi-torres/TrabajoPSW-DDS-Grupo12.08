using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Votify.API.Services;
using Votify.API.Models.DTOs;
using Votify.API.Models.Domain;

namespace Votify.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventController : ControllerBase
    {
        private readonly ICreateEventService _eventService;
        private readonly ICategoriaService _categoriaService;

        public EventController(ICreateEventService eventService, ICategoriaService categoriaService)
        {
            _eventService = eventService;
            _categoriaService = categoriaService;
        }

        [HttpPost]
        public async Task<IActionResult> CrearEvento([FromBody] CreateEventDto dto)
        {
            try
            {
                var eventoGuardado = await _eventService.CreateEventAsync(dto);

                // Si no se enviaron categorías o la lista está vacía, crear una categoría "Global"
                if (eventoGuardado.Categorias == null || eventoGuardado.Categorias.Count == 0)
                {
                    var categoriaGlobal = new Categoria
                    {
                        Nombre = "Global",
                        IdEvento = eventoGuardado.Id
                    };

                    var categoriaCreada = await _categoriaService.CreateAsync(categoriaGlobal);

                    eventoGuardado.Categorias = new List<Categoria> { categoriaCreada };
                }

                return Created($"/api/event/{eventoGuardado.Id}", new
                {
                    id = eventoGuardado.Id,
                    nombre = eventoGuardado.Nombre,
                    estado = eventoGuardado.Estado,
                    mensaje = "¡Evento creado con éxito en Supabase!"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Hubo un problema al crear el evento.", detalle = ex.Message });
            }
        }
    }
}