// Controllers/UsuarioController.cs
using Microsoft.AspNetCore.Mvc;
using Votify.API.Models.Domain;
using Supabase;

namespace Votify.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuarioController : ControllerBase
    {
        private readonly Client _supabase;

        public UsuarioController(Client supabase)
        {
            _supabase = supabase;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var response = await _supabase
                    .From<Usuario>()
                    .Filter("id", Supabase.Postgrest.Constants.Operator.Equals, id.ToString())
                    .Get();

                var usuario = response.Models.FirstOrDefault();

                if (usuario == null)
                    return NotFound(new { message = "Usuario no encontrado" });

                return Ok(new
                {
                    id = usuario.Id,
                    nombreCompleto = usuario.NombreCompleto,
                    nombreUsuario = usuario.NombreUsuario,
                    email = usuario.Email,
                    fechaRegistro = usuario.FechaRegistro
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("email/{email}")]
        public async Task<IActionResult> GetByEmail(string email)
        {
            try
            {
                var response = await _supabase
                    .From<Usuario>()
                    .Where(u => u.Email == email)
                    .Get();

                var usuario = response.Models.FirstOrDefault();

                if (usuario == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                return Ok(new { id = usuario.Id, email = usuario.Email });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var response = await _supabase
                    .From<Usuario>()
                    .Where(u => u.Id == id)
                    .Get();

                var usuario = response.Models.FirstOrDefault();

                if (usuario == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                return Ok(new
                {
                    id = usuario.Id,
                    email = usuario.Email,
                    nombreCompleto = usuario.NombreCompleto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}