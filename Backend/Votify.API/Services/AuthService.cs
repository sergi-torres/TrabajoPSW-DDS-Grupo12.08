
using Votify.API.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Supabase.Postgrest.Models;
using Votify.API.Models.Domain;
using Votify.API.Repositories;

namespace Votify.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly Supabase.Client _supabase;
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IInvitacionPendienteRepository _invitacionRepo;
        private readonly IEventoUsuarioRepository _eventoUsuarioRepo;

        public AuthService(
            Supabase.Client supabase, 
            IUsuarioRepository usuarioRepository,
            IInvitacionPendienteRepository invitacionRepo,
            IEventoUsuarioRepository eventoUsuarioRepo)
        {
            _supabase = supabase;
            _usuarioRepository = usuarioRepository;
            _invitacionRepo = invitacionRepo;
            _eventoUsuarioRepo = eventoUsuarioRepo;
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
                var created = await _usuarioRepository.CreateAsync(usuario);

                if (created != null && !string.IsNullOrEmpty(request.InvitationToken))
                {
                    await ProcesarInvitacionAsync(created.Id, created.Email, request.InvitationToken);
                }

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

                var user = await _usuarioRepository.GetByEmailAsync(request.Email);

                if (user != null && !string.IsNullOrEmpty(request.InvitationToken))
                {
                    await ProcesarInvitacionAsync(user.Id, user.Email, request.InvitationToken);
                }

                return (session?.AccessToken, user?.Id ?? 0, user?.NombreUsuario ?? request.Email);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al iniciar sesión", ex);
            }
        }

        private async Task ProcesarInvitacionAsync(int userId, string email, string token)
        {
            var invitacion = await _invitacionRepo.GetByTokenAsync(token);
            
            // Validar que la invitación existe y es para este email
            if (invitacion != null && invitacion.Email.Equals(email, StringComparison.OrdinalIgnoreCase))
            {
                // Asociar usuario al evento como Jurado
                var relacion = new EventoUsuario
                {
                    IdEvento = invitacion.IdEvento,
                    IdUsuario = userId,
                    Rol = "Jurado"
                };

                await _eventoUsuarioRepo.CreateAsync(relacion);

                // Eliminar invitación procesada
                await _invitacionRepo.DeleteAsync(invitacion.Id);
            }
        }
    }
}
