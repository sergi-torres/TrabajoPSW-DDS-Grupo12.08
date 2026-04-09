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


        //Actualmente no se filtra por categoria
        public async Task<List<Proyecto>> ObtenerTodosAsync()
        {
            var response = await _supabase
                .From<Proyecto>()
                .Select("*")
                .Get();

            return response.Models;
        }
    }
}