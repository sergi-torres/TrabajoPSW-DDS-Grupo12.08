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

        public async Task<Proyecto?> ObtenerPorIdAsync(int id)
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

        public async Task<Proyecto?> CrearAsync(Proyecto proyecto)
        {
            var response = await _supabase.From<Proyecto>().Insert(proyecto);
            return response.Model;
        }

        public async Task<bool> EliminarAsync(int id)
        {
            try
            {
                await _supabase.From<Proyecto>().Where(p => p.Id == id).Delete();
                return true; // Si no lanza excepción, asumimos éxito
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al eliminar proyecto {id}: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> ActualizarAsync(Proyecto proyecto)
        {
            try
            {
                await _supabase.From<Proyecto>().Where(p => p.Id == proyecto.Id).Update(proyecto);
                return true; // Si no lanza excepción, asumimos éxito
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al actualizar proyecto {proyecto.Id}: {ex.Message}");
                return false;
            }
        }
    }
}