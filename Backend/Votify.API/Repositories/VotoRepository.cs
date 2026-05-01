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

        public async Task<List<VotoPublico>> ObtenerPorProyectoIdAsync(int proyectoId)
        {
            var response = await _supabase
                .From<VotoPublico>()
                .Filter("idproyecto", Supabase.Postgrest.Constants.Operator.Equals, proyectoId.ToString())
                .Get();

            return response.Models;
        }

        public async Task<List<VotoJurado>> ObtenerVotosDeUsuarioAsync(int idUsuario)
        {
            var response = await _supabase
                .From<VotoJurado>()
                .Filter("idevaluador", Supabase.Postgrest.Constants.Operator.Equals, idUsuario.ToString())
                .Get();

            return response.Models;
        }

        public async Task<bool> ExisteVotoPublicoAsync(int idEvento, int idCategoria, string hash)
        {
            var response = await _supabase
                .From<RegistroVotoPublico>()
                .Filter("idevento", Supabase.Postgrest.Constants.Operator.Equals, idEvento.ToString())
                .Filter("idcategoria", Supabase.Postgrest.Constants.Operator.Equals, idCategoria.ToString())
                .Filter("identificador_hash", Supabase.Postgrest.Constants.Operator.Equals, hash)
                .Get();

            return response.Models.Any();
        }

        public async Task RegistrarVotoPublicoAsync(RegistroVotoPublico registro)
        {
            await _supabase
                .From<RegistroVotoPublico>()
                .Insert(registro);
        }

    }
}