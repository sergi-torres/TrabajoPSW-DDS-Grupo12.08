
using Votify.API.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Supabase.Postgrest.Models;
using Votify.API.Models.Domain;

namespace Votify.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly Supabase.Client _supabase;

        public AuthService(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        public async Task<(string? token, int userId, string? nombreUsuario)> RegistrarAsync(RegistroRequestDto request)
        {
            var usuario = new Usuario
            {
                Email = request.Email,
                NombreCompleto = request.NombreCompleto,
                NombreUsuario = request.NombreUsuario ?? request.Email,
                Password = request.Password,
                FechaRegistro = DateTime.UtcNow
            };

            try
            {
                var session = await _supabase.Auth.SignUp(usuario.Email, usuario.Password);
                var insertResponse = await _supabase.From<Usuario>().Insert(usuario);
                var created = insertResponse.Models.FirstOrDefault();
                return (session?.AccessToken, created?.Id ?? 0, created?.NombreUsuario ?? request.Email);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al registrar el usuario", ex);
            }
        }

        public async Task<(string? token, int userId, string? nombreUsuario)> LoginAsync(LoginRequestDto request)
        {
            try
            {
                var session = await _supabase.Auth.SignIn(request.Email, request.Password);

                // Buscar el ID y Nombre de usuario en nuestra tabla
                var userResponse = await _supabase
                    .From<Usuario>()
                    .Where(u => u.Email == request.Email)
                    .Get();

                var user = userResponse.Models.FirstOrDefault();
                return (session?.AccessToken, user?.Id ?? 0, user?.NombreUsuario ?? request.Email);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al iniciar sesión", ex);
            }
        }
    }
}
