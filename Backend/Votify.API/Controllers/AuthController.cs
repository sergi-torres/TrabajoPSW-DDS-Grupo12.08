using Microsoft.AspNetCore.Mvc;
using Votify.API.Models.DTOs;
using Votify.API.Services;
using System.Threading.Tasks;

namespace Votify.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegistrarAsync(RegistroRequestDto request)
        {
            try
            {
                var session = await _authService.RegistrarAsync(request);
                return Ok(new { token = session }); // El token sirve para autenticar las peticiones posteriores
            }
            catch (Exception ex)
            {
                // ex.InnerException contiene el error REAL de Supabase
                return BadRequest(ex.InnerException?.Message ?? ex.Message);
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> LoginAsync(LoginRequestDto request)
        {
            try
            {
                var session = await _authService.LoginAsync(request);
                return Ok(new { token = session });
            }
            catch (Exception ex)
            {
                // ex.InnerException contiene el error real de Supabase
                return BadRequest(ex.InnerException?.Message ?? ex.Message);
            }
        }
    }
}
