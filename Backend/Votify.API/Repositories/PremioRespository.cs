using Votify.API.Models.Domain;

namespace Votify.API.Repositories
{
    public class PremioRespository : IPremioRepository
    {
        private readonly Supabase.Client _supabase;

        public PremioRespository(Supabase.Client client)
        {
            _supabase = client;
        }

        public async Task<List<Categoria>> ObtenerCategoriasPorEventoAsync(int eventoId)
        {
            var response = await _supabase.From<Categoria>()
                .Where(c => c.IdEvento == eventoId)
                .Get();
            return response.Models;
        }

        public async Task<List<Premio>> ObtenerPremiosPorCategoriasAsync(List<int> categoriasIds)
        {
            var response = await _supabase.From<Premio>()
                .Filter(p => p.IdCategoria, Supabase.Postgrest.Constants.Operator.In, categoriasIds)
                .Get();

            return response.Models;
        }

        public async Task<Premio> ObtenerPorIdAsync(int id)
        {
            var response = await _supabase.From<Premio>()
                .Where(p => p.Id == id)
                .Get();

            var premio = response.Models.FirstOrDefault();
            if (premio == null)
                throw new Exception("No se encontró el premio");

            return premio;
        }

        public async Task<List<Premio>> ObtenerPremiosDelEventoAsync(int eventoId)
        {
            var categorias = await ObtenerCategoriasPorEventoAsync(eventoId);
            if (categorias == null || categorias.Count == 0)
                return new List<Premio>();

            var categoriasIds = categorias.Select(c => c.Id).ToList();
            return await ObtenerPremiosPorCategoriasAsync(categoriasIds);
        }

        public async Task<bool> CrearPremioAsync(Premio premio)
        {
            var response = await _supabase
            .From<Premio>()
            .Insert(premio);

            return response.Models.Count > 0;
        }

        public async Task EliminarPremioAsync(int premioId)
        {

            await _supabase
                .From<Premio>()
                .Where(p => p.Id == premioId)
                .Delete();
        }

        public async Task<bool> ActualizarPremioAsync(Premio premio)
        {
            var response = await _supabase
            .From<Premio>()
            .Where(p => p.Id == premio.Id)
            .Update(premio);

            return response.ResponseMessage?.IsSuccessStatusCode?? false;
        }
    }
}