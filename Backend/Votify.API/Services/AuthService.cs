using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Factories;
using System.Threading.Tasks;
using System;

namespace Votify.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly Supabase.Client _supabase;
        private readonly IUsuarioFactory _usuarioFactory;

        public AuthService(Supabase.Client supabase, IUsuarioFactory usuarioFactory)
        {
            _supabase = supabase;
            _usuarioFactory = usuarioFactory;
        }

        public async Task<string?> RegistrarAsync(RegistroRequestDto request)
        {
            var usuario = _usuarioFactory.CrearUsuario(request);

            try
            {
                var session = await _supabase.Auth.SignUp(usuario.Email, usuario.Password);
                await _supabase.From<Usuario>().Insert(usuario);
                return session?.AccessToken;
            }
            catch(Exception ex){
                throw new Exception("Error al registrar el usuario", ex);
            }
        }

        public async Task<string?> LoginAsync(LoginRequestDto request)
        {
            try{
                var session = await _supabase.Auth.SignIn(request.Email, request.Password);
                return session?.AccessToken;
            }
            catch(Exception ex){
                throw new Exception("Error al iniciar sesión", ex);
            }
        }
    }
}
