using Microsoft.AspNetCore.Mvc;
using Votify.API.Adapters.Gemini;
using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Services;
using Votify.API.Services.Strategies.Sintesis;

namespace Votify.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SintesisController : ControllerBase
    {
        private readonly ISintesisComentariosService _service;
        private readonly Supabase.Client _supabase;

        public SintesisController(ISintesisComentariosService service, Supabase.Client supabase)
        {
            _service = service;
            _supabase = supabase;
        }

        [HttpGet("proyecto/{idProyecto:int}/categoria/{idCategoria:int}")]
        public async Task<IActionResult> ObtenerAsync(int idProyecto, int idCategoria)
        {
            // Para el GET, intentamos validar pero permitimos que continúe si falla 
            // (la validación de ownership en el service decidirá si permite acceso anónimo o no).
            // Sin embargo, por ahora el service requiere email, así que si falla la validación
            // devolvemos el error estructurado para que el frontend pueda reaccionar.
            var (email, _, errorResult) = await ValidarJwtAsync();
            if (errorResult != null) return errorResult;

            try
            {
                var dto = await _service.ObtenerAsync(idProyecto, idCategoria, email!);
                return Ok(dto);
            }
            catch (ProyectoNoEncontradoException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (OwnershipDeniedException ex)
            {
                return StatusCode(403, new { error = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SintesisController.GET] Error: {ex.Message}");
                return StatusCode(500, new { error = "Error interno." });
            }
        }

        [HttpPost("proyecto/{idProyecto:int}/categoria/{idCategoria:int}")]
        public async Task<IActionResult> GenerarAsync(int idProyecto, int idCategoria, [FromBody] GenerarSintesisRequest body, CancellationToken ct)
        {
            // El POST sí requiere validación estricta siempre.
            var (email, authUid, errorResult) = await ValidarJwtAsync();
            if (errorResult != null) return errorResult;

            var tipo = SintesisComentarios.ParseTipo(body?.Tipo);
            if (tipo == null)
                return BadRequest(new { error = "Tipo inválido. Debe ser 'jurado' o 'publico'." });

            try
            {
                var dto = await _service.GenerarAsync(idProyecto, idCategoria, tipo.Value, email!, authUid, ct);
                return Ok(dto);
            }
            catch (CategoriaNoFinalizadaException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (ProyectoNoEncontradoException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (OwnershipDeniedException ex)
            {
                return StatusCode(403, new { error = ex.Message });
            }
            catch (SintesisInsuficienteException ex)
            {
                return UnprocessableEntity(new { error = ex.Message });
            }
            catch (SintesisGeminiException ex)
            {
                Console.WriteLine($"[SintesisController.POST] Gemini error ({ex.Kind}): {ex.Message}");
                return ex.Kind switch
                {
                    SintesisGeminiErrorKind.Timeout => StatusCode(504, new { error = "Gemini tardó demasiado. Reintenta." }),
                    SintesisGeminiErrorKind.RateLimit => StatusCode(429, new { error = "Demasiadas peticiones, prueba en unos segundos." }),
                    SintesisGeminiErrorKind.SafetyBlocked => UnprocessableEntity(new { error = "No se pudo generar (contenido bloqueado)." }),
                    SintesisGeminiErrorKind.AuthFailure => StatusCode(500, new { error = "Error interno de servicio IA." }),
                    SintesisGeminiErrorKind.MalformedJson => StatusCode(500, new { error = "Respuesta inválida de servicio IA." }),
                    SintesisGeminiErrorKind.Network => StatusCode(503, new { error = "Servicio IA no disponible." }),
                    _ => StatusCode(500, new { error = "Error interno." })
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SintesisController.POST] Error: {ex.Message}");
                return StatusCode(500, new { error = "Error interno." });
            }
        }

        // Replica del flujo en OrganizerOnlyFilter pero embebido para no requerir el filter
        // (esta ruta no es del organizador, es del propietario del proyecto).
        private async Task<(string? email, Guid? authUid, IActionResult? error)> ValidarJwtAsync()
        {
            var authHeader = HttpContext.Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader))
                return (null, null, Unauthorized(new { error = "token_missing", message = "Token no proporcionado." }));

            var token = authHeader.Replace("Bearer ", "");
            if (string.IsNullOrEmpty(token))
                return (null, null, Unauthorized(new { error = "token_missing", message = "Token no proporcionado." }));

            try
            {
                var user = await _supabase.Auth.GetUser(token);
                if (user == null || string.IsNullOrEmpty(user.Email))
                    return (null, null, Unauthorized(new { error = "token_invalid", message = "Token inválido o usuario no encontrado." }));

                Guid? uid = Guid.TryParse(user.Id, out var parsed) ? parsed : null;
                return (user.Email, uid, null);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SintesisController.ValidarJwt] Error: {ex.Message}");
                
                // Si el mensaje contiene "expired" o similar, devolvemos un error específico
                if (ex.Message.Contains("expired", StringComparison.OrdinalIgnoreCase))
                {
                    return (null, null, Unauthorized(new { 
                        error = "token_expired", 
                        message = "Tu sesión ha expirado. Por favor, inicia sesión de nuevo." 
                    }));
                }

                return (null, null, Unauthorized(new { error = "token_invalid", message = "Token inválido." }));
            }
        }
    }
}
