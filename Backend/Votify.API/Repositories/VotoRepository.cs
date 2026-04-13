using Votify.API.Models.Domain;

namespace Votify.API.Repositories
{
    public class VotoRepository : IVotoRepository
    {
        private readonly Supabase.Client _supabase;

        public VotoRepository(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        public async Task<Voto> AgregarVotoAsync(Voto voto)
        {
            // Usar VotoPublico como tipo concreto para Supabase por ahora
            var votoPublico = (VotoPublico)voto;
            var response = await _supabase
                .From<VotoPublico>()
                .Insert(votoPublico);

            // Devolver el voto insertado como Voto (base class)
            return response.Models.First();
        }
    }
}