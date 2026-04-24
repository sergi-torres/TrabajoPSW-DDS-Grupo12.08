using Votify.API.Models.Domain;

namespace Votify.API.Repositories
{
    public class InvitacionPendienteRepository : IInvitacionPendienteRepository
    {
        private readonly Supabase.Client _supabase;

        public InvitacionPendienteRepository(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        public async Task<bool> CreateAsync(InvitacionPendiente invitacion)
        {
            var response = await _supabase.From<InvitacionPendiente>().Insert(invitacion);
            return response.Models.Count > 0;
        }

        public async Task<InvitacionPendiente?> GetByTokenAsync(string token)
        {
            var response = await _supabase
                .From<InvitacionPendiente>()
                .Where(x => x.Token == token)
                .Single();
            return response;
        }

        public async Task<List<InvitacionPendiente>> GetByEventAsync(int idEvento)
        {
            var response = await _supabase
                .From<InvitacionPendiente>()
                .Where(x => x.IdEvento == idEvento)
                .Get();
            return response.Models ?? new List<InvitacionPendiente>();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            await _supabase
                .From<InvitacionPendiente>()
                .Where(x => x.Id == id)
                .Delete();
            return true;
        }

        public async Task<bool> DeleteByEmailAndEventAsync(string email, int idEvento)
        {
            await _supabase
                .From<InvitacionPendiente>()
                .Where(x => x.Email == email && x.IdEvento == idEvento)
                .Delete();
            return true;
        }
    }
}