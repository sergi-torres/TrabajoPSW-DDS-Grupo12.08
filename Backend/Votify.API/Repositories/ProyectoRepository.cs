using Votify.API.Models.Domain;
using Supabase;

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
    }
}