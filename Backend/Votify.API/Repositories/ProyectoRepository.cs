using Votify.API.Models.Domain;

namespace Votify.API.Repositories
{
    public class ProyectoRepository : IProyectoRepository
    {
        private readonly Supabase.Client _supabase;

        public ProyectoRepository(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        public async Task<List<Proyecto>> ObtenerTodosAsync()
        {
            var response = await _supabase
                .From<Proyecto>()
                .Select("id, nombre, descripcion, urlmultimedia, idevento, idparticipante, idcategoria")
                .Get();

            return response.Models;
        }

        public async Task<List<Proyecto>> ObtenerPorCategoriaIdAsync(int categoriaId)
        {
            var response = await _supabase
                .From<Proyecto>()
                .Select("id, nombre, descripcion, urlmultimedia, idevento, idparticipante, idcategoria")
                .Where(p => p.IdCategoria == categoriaId)
                .Get();


            return response.Models;
        }

        public async Task<List<Proyecto>> ObtenerPorIdParticipanteAsync(int id)
        {
            var response = await _supabase
                .From<Proyecto>()
                .Select("id, nombre, descripcion, urlmultimedia, idevento, idparticipante, idcategoria")
                .Where(p => p.IdParticipante == id)
                .Get();

            return response.Models;
        }

        public async Task<Proyecto> ObtenerPorIdAsync(int id)
        {
            var response = await _supabase
                .From<Proyecto>()
                .Select("id, nombre, descripcion, urlmultimedia, idevento, idparticipante, idcategoria")
                .Where(p => p.Id == id)
                .Get();
            return response.Models.FirstOrDefault();
        }

        public async Task<List<Proyecto>> ObtenerPorEventoIdAsync(int eventoId)
        {
            var response = await _supabase
                .From<Proyecto>()
                .Select("id, nombre, descripcion, urlmultimedia, idevento, idparticipante, idcategoria")
                .Where(p => p.IdEvento == eventoId)
                .Get();
            return response.Models;
        }
    }
}