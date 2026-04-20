using Votify.API.Models.Domain;
using Votify.API.Repositories;

namespace Votify.API.Services
{
    public class JuradoService : IJuradoService
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IEventoUsuarioRepository _eventoUsuarioRepository;

        public JuradoService(IUsuarioRepository usuarioRepository, IEventoUsuarioRepository eventoUsuarioRepository)
        {
            _usuarioRepository = usuarioRepository;
            _eventoUsuarioRepository = eventoUsuarioRepository;
        }

        public async Task<bool> AsignarJuradoPorEmailAsync(int idEvento, string email)
        {
            var usuario = await _usuarioRepository.GetByEmailAsync(email);

            if (usuario == null)
            {
                // TODO: Implementar sistema de invitaciones real (ej. tabla invitaciones_pendientes)
                // Por ahora simulamos que se envía la invitación
                Console.WriteLine($"[INVITACIÓN] Enviando correo de invitación a {email} para unirse como Jurado al evento {idEvento}");
                return true; 
            }

            // Verificar si ya tiene el rol en el evento
            var relacionExistente = await _eventoUsuarioRepository.GetAsync(idEvento, usuario.Id);
            if (relacionExistente != null)
            {
                if (relacionExistente.Rol == "Jurado") return true;
                
                // Si existe pero con otro rol, podríamos actualizarlo o avisar.
                // Por simplicidad, lo actualizamos a Jurado.
                relacionExistente.Rol = "Jurado";
                // TODO: UpdateAsync en repositorio si fuera necesario, 
                // pero Supabase Postgrest suele requerir Upsert o Insert directo.
                // Por ahora creamos uno nuevo o asumimos que el organizador sabe lo que hace.
            }

            var nuevaRelacion = new EventoUsuario
            {
                IdEvento = idEvento,
                IdUsuario = usuario.Id,
                Rol = "Jurado"
            };

            await _eventoUsuarioRepository.CreateAsync(nuevaRelacion);
            Console.WriteLine($"[NOTIFICACIÓN] Usuario {email} asignado como Jurado del evento {idEvento}");
            
            return true;
        }

        public async Task<List<Usuario>> GetJuradosEventoAsync(int idEvento)
        {
            var relaciones = await _eventoUsuarioRepository.GetJuradosByEventoAsync(idEvento);
            var jurados = new List<Usuario>();

            foreach (var rel in relaciones)
            {
                var user = await _usuarioRepository.GetByIdAsync(rel.IdUsuario);
                if (user != null) jurados.Add(user);
            }

            return jurados;
        }

        public async Task<bool> EliminarJuradoAsync(int idEvento, int idUsuario)
        {
            return await _eventoUsuarioRepository.DeleteAsync(idEvento, idUsuario);
        }
    }
}
