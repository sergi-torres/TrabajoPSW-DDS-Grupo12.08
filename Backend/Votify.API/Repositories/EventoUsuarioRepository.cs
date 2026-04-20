using Votify.API.Models.Domain;
using Supabase;

namespace Votify.API.Repositories
{
    public class EventoUsuarioRepository : IEventoUsuarioRepository
    {
        private readonly Supabase.Client _supabase;

        public EventoUsuarioRepository(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        public async Task<EventoUsuario?> GetAsync(int idEvento, int idUsuario)
        {
            var response = await _supabase
                .From<EventoUsuario>()
                .Where(eu => eu.IdEvento == idEvento)
                .Where(eu => eu.IdUsuario == idUsuario)
                .Get();

            return response.Models.FirstOrDefault();
        }

        public async Task<EventoUsuario> CreateAsync(EventoUsuario eventoUsuario)
        {
            var response = await _supabase.From<EventoUsuario>().Insert(eventoUsuario);
            return response.Models.First();
        }

        public async Task<bool> DeleteAsync(int idEvento, int idUsuario)
        {
            await _supabase
                .From<EventoUsuario>()
                .Where(eu => eu.IdEvento == idEvento)
                .Where(eu => eu.IdUsuario == idUsuario)
                .Delete();
            
            return true;
        }

        public async Task<List<EventoUsuario>> GetJuradosByEventoAsync(int idEvento)
        {
            var response = await _supabase
                .From<EventoUsuario>()
                .Where(eu => eu.IdEvento == idEvento)
                .Where(eu => eu.Rol == "Jurado")
                .Get();

            return response.Models;
        }
    }
}
