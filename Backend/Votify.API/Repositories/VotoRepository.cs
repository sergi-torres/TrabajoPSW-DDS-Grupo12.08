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

        public async Task<List<int>> ObtenerProyectosVotadosPublicoAsync(int idEvento, int idCategoria, string hash)
        {
            var response = await _supabase
                .From<RegistroVotoPublico>()
                .Filter("idevento", Supabase.Postgrest.Constants.Operator.Equals, idEvento.ToString())
                .Filter("idcategoria", Supabase.Postgrest.Constants.Operator.Equals, idCategoria.ToString())    
                .Filter("identificador_hash", Supabase.Postgrest.Constants.Operator.Equals, hash)
                .Get();

            return response.Models
                .Where(m => m.IdProyecto.HasValue)
                .Select(m => m.IdProyecto!.Value)
                .ToList();
        }

        public async Task<List<RegistroVotoPublico>> ObtenerTodosVotosPublicosPorHashAsync(int idEvento, string hash)
        {
            var response = await _supabase
                .From<RegistroVotoPublico>()
                .Filter("idevento", Supabase.Postgrest.Constants.Operator.Equals, idEvento.ToString())
                .Filter("identificador_hash", Supabase.Postgrest.Constants.Operator.Equals, hash)
                .Get();

            return response.Models;
        }

        public async Task RegistrarVotoPublicoAsync(RegistroVotoPublico registro)
        {
            await _supabase
                .From<RegistroVotoPublico>()
                .Insert(registro);
        }

        public async Task<List<Voto>> ObtenerVotosPorProyectoYCategoriaAsync(int proyectoId, int categoriaId)
        {
            // 1. Obtener votos básicos
            var response = await _supabase
                .From<VotoJurado>()
                .Filter("idproyecto", Supabase.Postgrest.Constants.Operator.Equals, proyectoId.ToString())
                .Filter("idcategoria", Supabase.Postgrest.Constants.Operator.Equals, categoriaId.ToString())
                .Get();

            var votos = response.Models.Cast<Voto>().ToList();

            // 2. Obtener comentarios cualitativos detallados para estos votos
            var idsVotacion = votos.Select(v => (long)v.Id).ToList();
            if (idsVotacion.Any())
            {
                var responseComentarios = await _supabase
                    .From<ComentarioCualitativo>()
                    .Filter("idVotacion", Supabase.Postgrest.Constants.Operator.In, idsVotacion)
                    .Get();

                var comentarios = responseComentarios.Models;

                // 3. Vincular los comentarios a los votos. 
                // El campo 'Comentario' en Voto suele venir de la tabla 'voto'. 
                // Si preferimos el de 'comentario_cualitativo', lo sobreescribimos o concatenamos.
                foreach (var v in votos)
                {
                    var c = comentarios.FirstOrDefault(cc => cc.IdVotacion == v.Id);
                    if (c != null)
                    {
                        v.Comentario = c.Comentario; 
                    }
                }
            }

            return votos;
        }
    }
}
