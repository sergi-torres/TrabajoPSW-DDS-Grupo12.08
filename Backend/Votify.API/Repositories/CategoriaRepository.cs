using Votify.API.Models.Domain;
using Supabase;

namespace Votify.API.Repositories
{
    public class CategoriaRepository : ICategoriaRepository
    {
        private readonly Supabase.Client _supabase;

        public CategoriaRepository(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        public async Task<List<Categoria>> ObtenerTodasAsync()
        {
            var response = await _supabase
                .From<Categoria>()
                .Select("*")
                .Get();

            return response.Models;
        }

        public async Task<List<Categoria>> ObtenerPorEventoIdAsync(int eventoId)
        {
            var response = await _supabase
                .From<Categoria>()
                .Where(c => c.IdEvento == eventoId)
                .Select("*")
                .Get();

            return response.Models;
        }
    }
}
