using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Factories;
using System.Threading.Tasks;
using System;

namespace Votify.API.Services
{
    public class AuthService : IAuthService
    {
        // TODO: Inyectar Supabase.Client y IUsuarioFactory en el constructor

        public async Task<string?> RegistrarAsync(RegistroRequestDto request)
        {
            // TODO: Implementar el registro
            throw new NotImplementedException();
        }

        public async Task<string?> LoginAsync(LoginRequestDto request)
        {
            // TODO: Implementar el login
            throw new NotImplementedException();
        }
    }
}
