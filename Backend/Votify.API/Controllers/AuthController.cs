using Microsoft.AspNetCore.Mvc;
using Votify.API.Models.DTOs;
using Votify.API.Services;

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
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            var token = await _authService.RegisterAsync(request);
            if (token == null)
            {
                return BadRequest("No se pudo registrar al usuario. Revisa el log o comprueba si el usuario ya existe.");
            }

            return Ok(new { Token = token, Message = "Usuario registrado exitosamente" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            var token = await _authService.LoginAsync(request);
            if (token == null)
            {
                return Unauthorized("Credenciales inválidas.");
            }

            return Ok(new { Token = token, Message = "Login exitoso" });
        }
    }
}
