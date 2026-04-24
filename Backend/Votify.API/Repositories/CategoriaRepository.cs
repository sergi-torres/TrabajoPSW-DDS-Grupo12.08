using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;

namespace Votify.API.Repositories
{
    public class CategoriaRepository : ICategoriaRepository
    {
        private readonly Supabase.Client _supabase;

        public CategoriaRepository(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        public async Task<List<Categoria>> ObtenerTodasAsync()
        {
            var response = await _supabase
                .From<Categoria>()
                .Select("*")
                .Get();

            return response.Models;
        }

        public async Task<Categoria> CrearAsync(Categoria categoria)
        {
            var insertObj = new List<Categoria>
{
            new Categoria
                {
                    Nombre = categoria.Nombre,
                    IdEvento = categoria.IdEvento
                }
            };

            var response = await _supabase
                .From<Categoria>()
                .Insert(insertObj);

            var insertado = response.Models.FirstOrDefault();

            if (insertado == null)
                throw new Exception("No se pudo crear la categoría");

            return insertado;
        }

        public async Task<Categoria> ObtenerPorIdAsync(int id)
        {
            var response = await _supabase
                .From<Categoria>()
                .Where(c => c.Id == id)
                .Select("*")
                .Get();
            return response.Models.FirstOrDefault();
        }

        public async Task<List<CategoriaResponseDto>> ObtenerPorEventoIdAsync(int eventoId)
        {
            var response = await _supabase
                .From<Categoria>()
                .Where(c => c.IdEvento == eventoId)
                .Select("*")
                .Get();

            return response.Models.Select(c => new CategoriaResponseDto
            {
                Id = c.Id,
                Nombre = c.Nombre,
                IdEvento = c.IdEvento
            }).ToList();
        }
    }
}
