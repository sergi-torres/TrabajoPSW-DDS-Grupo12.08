using Votify.API.Models.Domain;
using Supabase;

namespace Votify.API.Repositories
{
    public class BaremoRepository : IBaremoRepository
    {
        private readonly Supabase.Client _supabase;

        public BaremoRepository(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        public async Task<List<Baremo>> GetByEventoIdAsync(int eventoId)
        {
            var response = await _supabase
                .From<Baremo>()
                .Filter("idevento", Supabase.Postgrest.Constants.Operator.Equals, eventoId.ToString())
                .Get();
            return response.Models;
        }

        public async Task<List<Criterio>> GetCriteriosByBaremoIdAsync(int baremoId)
        {
            var response = await _supabase
                .From<Criterio>()
                .Filter("idbaremo", Supabase.Postgrest.Constants.Operator.Equals, baremoId.ToString())
                .Get();
            return response.Models;
        }

        public async Task<Baremo> InsertAsync(Baremo baremo)
        {
            var response = await _supabase.From<Baremo>().Insert(baremo);
            return response.Models.First();
        }

        public async Task<bool> DeleteAsync(int baremoId)
        {
            await _supabase.From<Baremo>()
                .Filter("id", Supabase.Postgrest.Constants.Operator.Equals, baremoId.ToString())
                .Delete();
            return true;
        }

        public async Task<bool> DeleteCriteriosByBaremoIdAsync(int baremoId)
        {
            await _supabase.From<Criterio>()
                .Filter("idbaremo", Supabase.Postgrest.Constants.Operator.Equals, baremoId.ToString())
                .Delete();
            return true;
        }

        public async Task<bool> DeleteCriterioAsync(int criterioId)
        {
            await _supabase.From<Criterio>()
                .Filter("id", Supabase.Postgrest.Constants.Operator.Equals, criterioId.ToString())
                .Delete();
            return true;
        }

        public async Task<Criterio> InsertCriterioAsync(Criterio criterio)
        {
            var response = await _supabase.From<Criterio>().Insert(criterio);
            return response.Models.First();
        }

        public async Task<bool> UpdateCriterioAsync(Criterio criterio)
        {
            var response = await _supabase.From<Criterio>()
                .Filter("id", Supabase.Postgrest.Constants.Operator.Equals, criterio.Id.ToString())
                .Set(c => c.Peso, (float)criterio.Peso)
                .Set(c => c.TipoCriterio, criterio.TipoCriterio)
                .Set(c => c.ComentarioObligatorio, criterio.ComentarioObligatorio)
                .Update();
            return response.ResponseMessage?.IsSuccessStatusCode ?? false;
        }

        public async Task<Criterio?> GetCriterioByIdAsync(int id)
        {
            var response = await _supabase
                .From<Criterio>()
                .Filter("id", Supabase.Postgrest.Constants.Operator.Equals, id.ToString())
                .Get();
            return response.Models.FirstOrDefault();
        }
    }
}
