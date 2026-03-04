using Supabase.Gotrue;
using Votify.API.Models.DTOs;

namespace Votify.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly Supabase.Client _supabaseClient;
        private readonly ILogger<AuthService> _logger;

        public AuthService(Supabase.Client supabaseClient, ILogger<AuthService> logger)
        {
            _supabaseClient = supabaseClient;
            _logger = logger;
        }

        public async Task<string?> RegisterAsync(RegisterRequestDto request)
        {
            try
            {
                var signUpOptions = new SignUpOptions
                {
                    Data = new Dictionary<string, object>
                    {
                        { "nombre_completo", request.NombreCompleto },
                        { "nombre_usuario", request.NombreUsuario }
                    }
                };

                var session = await _supabaseClient.Auth.SignUp(request.Email, request.Password, signUpOptions);
                return session?.AccessToken;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering user in Supabase");
                return null;
            }
        }

        public async Task<string?> LoginAsync(LoginRequestDto request)
        {
            try
            {
                var session = await _supabaseClient.Auth.SignIn(request.Email, request.Password);
                return session?.AccessToken;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging in to Supabase");
                return null;
            }
        }
    }
}
