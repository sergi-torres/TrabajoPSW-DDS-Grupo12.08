using Votify.API.Models.Domain;
using Votify.API.Repositories;
using Votify.API.Models.DTOs;

namespace Votify.API.Services
{
    public class JuradoService : IJuradoService
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IEventoUsuarioRepository _eventoUsuarioRepository;
        private readonly IEmailService _emailService;
        private readonly IInvitacionPendienteRepository _invitacionRepo;

        public JuradoService(
            IUsuarioRepository usuarioRepository, 
            IEventoUsuarioRepository eventoUsuarioRepository,
            IEmailService emailService,
            IInvitacionPendienteRepository invitacionRepo)
        {
            _usuarioRepository = usuarioRepository;
            _eventoUsuarioRepository = eventoUsuarioRepository;
            _emailService = emailService;
            _invitacionRepo = invitacionRepo;
        }

        public async Task<bool> AsignarJuradoPorEmailAsync(int idEvento, string email, string? customMessage = null)
        {
            var usuario = await _usuarioRepository.GetByEmailAsync(email);
            if (usuario != null)
            {
                var relacionExistente = await _eventoUsuarioRepository.GetAsync(idEvento, usuario.Id);
                if (relacionExistente != null)
                {
                    throw new Exception($"El usuario con email {email} ya es {relacionExistente.Rol} de este evento.");
                }
            }

            var invitacionesExistentes = await _invitacionRepo.GetByEventAsync(idEvento);
            if (invitacionesExistentes.Any(i => i.Email.Equals(email, StringComparison.OrdinalIgnoreCase)))
            {
                throw new Exception($"Ya se ha enviado una invitacion a {email} para este evento.");
            }

            var token = Guid.NewGuid().ToString();
            var invitacion = new InvitacionPendiente
            {
                Email = email,
                IdEvento = idEvento,
                Token = token,
                FechaCreacion = DateTime.UtcNow
            };

            await _invitacionRepo.CreateAsync(invitacion);
            await _emailService.SendInvitationEmailAsync(email, idEvento, token, customMessage);
            
            return true;
        }

        public async Task<bool> ReenviarInvitacionAsync(int idEvento, string email)
        {
            var invitaciones = await _invitacionRepo.GetByEventAsync(idEvento);
            var invitacion = invitaciones.FirstOrDefault(i => i.Email.Equals(email, StringComparison.OrdinalIgnoreCase));

            if (invitacion == null)
            {
                throw new Exception("No se encontro una invitacion pendiente para este correo.");
            }

            await _emailService.SendInvitationEmailAsync(email, idEvento, invitacion.Token);
            return true;
        }

        public async Task<List<UsuarioDto>> GetJuradosEventoAsync(int idEvento)
        {
            var relaciones = await _eventoUsuarioRepository.GetJuradosByEventoAsync(idEvento);
            var jurados = new List<UsuarioDto>();

            foreach (var rel in relaciones)
            {
                var user = await _usuarioRepository.GetByIdAsync(rel.IdUsuario);
                if (user != null) 
                {
                    jurados.Add(new UsuarioDto {
                        Id = user.Id,
                        NombreCompleto = user.NombreCompleto,
                        NombreUsuario = user.NombreUsuario,
                        Email = user.Email
                    });
                }
            }

            var invitaciones = await _invitacionRepo.GetByEventAsync(idEvento);
            foreach (var inv in invitaciones)
            {
                jurados.Add(new UsuarioDto { 
                    Email = inv.Email, 
                    NombreCompleto = string.Empty,
                    NombreUsuario = "Pendiente",
                    Id = -inv.Id 
                });
            }

            return jurados;
        }

        public async Task<bool> EliminarJuradoAsync(int idEvento, int idUsuario)
        {
            if (idUsuario < 0)
            {
                int invitacionId = Math.Abs(idUsuario);
                return await _invitacionRepo.DeleteAsync(invitacionId);
            }

            return await _eventoUsuarioRepository.DeleteAsync(idEvento, idUsuario);
        }
    }
}