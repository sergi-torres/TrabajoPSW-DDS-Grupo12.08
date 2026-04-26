// Services/CategoriaService.cs
using System;
using System.Threading.Tasks;
using Votify.API.Models.Domain;
using Supabase;

namespace Votify.API.Services
{
    public class CategoriaService : ICategoriaService
    {
        private readonly Client _supabase;

        public CategoriaService(Client supabase)
        {
            _supabase = supabase;
        }

        public async Task<Categoria> CreateAsync(Categoria categoria)
        {
            try
            {
                var response = await _supabase
                    .From<Categoria>()
                    .Insert(categoria);

                if (response?.Models == null || response.Models.Count == 0)
                {
                    throw new Exception("No se pudo crear la categoría");
                }

                return response.Models[0];
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al crear la categoría: {ex.Message}", ex);
            }
        }
    }
}
