using Votify.API.Models.Domain;
using Supabase;

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
            if (voto is VotoJurado votoJurado)
            {
                var responseJurado = await _supabase
                    .From<VotoJurado>()
                    .Insert(votoJurado);

                return responseJurado.Models.First();
            }

            if (voto is VotoPublico votoPublico)
            {
                var responsePublico = await _supabase
                    .From<VotoPublico>()
                    .Insert(votoPublico);

                return responsePublico.Models.First();
            }

            throw new InvalidOperationException("Tipo de voto no soportado para persistencia.");
        }

        public async Task<string?> ObtenerRolUsuarioEnEventoAsync(int idUsuario, int idEvento)
        {
            try
            {
                var response = await _supabase
                    .From<EventoUsuario>()
                    .Where(eu => eu.IdUsuario == idUsuario && eu.IdEvento == idEvento)
                    .Single();

                return response?.Rol;
            }
            catch
            {
                // Usuario no encontrado en evento_usuario
                return null;
            }
        }
    }
}