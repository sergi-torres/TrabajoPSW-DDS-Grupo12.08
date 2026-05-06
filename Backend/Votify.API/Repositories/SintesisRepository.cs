using Votify.API.Models.Domain;
using static Supabase.Postgrest.Constants;

namespace Votify.API.Repositories
{
    public class SintesisRepository : ISintesisRepository
    {
        private readonly Supabase.Client _supabase;

        public SintesisRepository(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        public async Task<SintesisComentarios?> ObtenerAsync(long idProyecto, long idCategoria, string tipo)
        {
            var response = await _supabase
                .From<SintesisComentarios>()
                .Filter("id_proyecto", Operator.Equals, idProyecto.ToString())
                .Filter("id_categoria", Operator.Equals, idCategoria.ToString())
                .Filter("tipo", Operator.Equals, tipo)
                .Get();

            return response.Models.FirstOrDefault();
        }

        public async Task<List<SintesisComentarios>> ObtenerPorProyectoCategoriaAsync(long idProyecto, long idCategoria)
        {
            var response = await _supabase
                .From<SintesisComentarios>()
                .Filter("id_proyecto", Operator.Equals, idProyecto.ToString())
                .Filter("id_categoria", Operator.Equals, idCategoria.ToString())
                .Get();

            return response.Models;
        }

        // Upsert por (id_proyecto, id_categoria, tipo). Si existe, borra y reinserta para garantizar
        // sobrescritura completa de jsonb y campos derivados sin depender de soporte de Upsert nativo.
        public async Task<SintesisComentarios> UpsertAsync(SintesisComentarios sintesis)
        {
            var existente = await ObtenerAsync(sintesis.IdProyecto, sintesis.IdCategoria, sintesis.Tipo);

            if (existente != null)
            {
                await _supabase
                    .From<SintesisComentarios>()
                    .Filter("id", Operator.Equals, existente.Id.ToString())
                    .Delete();
            }

            // Forzar id 0 para que la BD asigne uno nuevo (BIGSERIAL).
            sintesis.Id = 0;
            sintesis.FechaGeneracion = DateTime.UtcNow;

            var response = await _supabase
                .From<SintesisComentarios>()
                .Insert(sintesis);

            var inserted = response.Models.FirstOrDefault();
            if (inserted == null)
                throw new Exception("No se pudo persistir la síntesis.");

            return inserted;
        }
    }
}
