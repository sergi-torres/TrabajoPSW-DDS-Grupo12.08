using Votify.API.Models.Domain;
using Supabase;

namespace Votify.API.Repositories
{
    public class UsuarioRepository : IUsuarioRepository
    {
        private readonly Supabase.Client _supabase;

        public UsuarioRepository(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        public async Task<Usuario?> GetByEmailAsync(string email)
        {
            var response = await _supabase
                .From<Usuario>()
                .Where(u => u.Email == email)
                .Get();

            return response.Models.FirstOrDefault();
        }

        public async Task<Usuario?> GetByIdAsync(int id)
        {
            var response = await _supabase
                .From<Usuario>()
                .Where(u => u.Id == id)
                .Get();

            return response.Models.FirstOrDefault();
        }

        public async Task<Usuario> CreateAsync(Usuario usuario)
        {
            var response = await _supabase.From<Usuario>().Insert(usuario);
            return response.Models.FirstOrDefault()
                ?? await GetByEmailAsync(usuario.Email)
                ?? throw new InvalidOperationException("No se pudo crear el usuario en la base de datos.");
        }
    }
}
