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
        public async Task<IActionResult> RegistrarAsync(RegistroRequestDto request)
        {
            try
            {
                var (token, userId) = await _authService.RegistrarAsync(request);
                return Ok(new { token, userId });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.InnerException?.Message ?? ex.Message);
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> LoginAsync(LoginRequestDto request)
        {
            try
            {
                var (token, userId) = await _authService.LoginAsync(request);
                return Ok(new { token, userId });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.InnerException?.Message ?? ex.Message);
            }
        }
    }
}
