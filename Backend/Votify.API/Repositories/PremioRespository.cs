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

        public async Task<List<Premio>> ObtenerPremiosDelEventoAsync(int eventoId)
        {
            var premios = await _supabase.From<Premio>()
                .Where(p => p.IdCategoria == eventoId)
                .Get();

            return premios.Models;
        }

        public async Task<Premio> ObtenerPorIdAsync(int id)
        {
            var response = await _supabase
                    .From<Premio>()
                    .Where(p => p.Id == id)
                    .Select("*")
                    .Get();

            var premio = response.Models.FirstOrDefault();

            if (premio == null)
                throw new Exception("No se encontró el premio");

            return premio;
        }

        public async Task<bool> CrearPremioAsync(Premio premio)
        {
            var response = await _supabase
            .From<Premio>()
            .Insert(premio);

            return response.Models.Count > 0;//Verificar si renta mas pasaar el nuevo premio creado
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