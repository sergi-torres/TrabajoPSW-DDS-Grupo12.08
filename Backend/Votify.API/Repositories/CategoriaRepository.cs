using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using static Supabase.Postgrest.Constants;

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

            var categoria = response.Models.FirstOrDefault();

            if (categoria == null)
            {
                throw new KeyNotFoundException($"Categoría con ID {id} no encontrada");
            }

            return categoria;
        }

        public async Task<List<CategoriaResponseActualizadoDto>> ObtenerPorEventoIdAsync(int eventoId)
        {
            var response = await _supabase
                .From<Categoria>()
                .Where(c => c.IdEvento == eventoId)
                .Select("*")
                .Get();

            return response.Models.Select(c => new CategoriaResponseActualizadoDto
            {
                Id = c.Id,
                Nombre = c.Nombre,
                IdEvento = c.IdEvento,
                Estado = c.Estado
            }).ToList();
        }


        public async Task<List<Categoria>> ObtenerCategoriasDominioPorEventoIdAsync(int eventoId)
        {
            var response = await _supabase
                .From<Categoria>()
                .Where(c => c.IdEvento == eventoId)
                .Select("*")
                .Get();

            return response.Models;
        }

        //!a parir los asñadiste tu brad 
        //Deberiamos tener siempre el ID de categoria pero por asegurar
        
        public async Task<bool> ActualizarAsync(Categoria categoria)
        {
            try
            {
               
                var response = await _supabase
                    .From<Categoria>()
                    .Update(categoria);

                // Si ResponseMessage es null, devuelve false. 
                // Si no es null, devuelve el valor de IsSuccessStatusCode.
                return response.ResponseMessage?.IsSuccessStatusCode ?? false;
            }
            catch (Exception ex)
            {
                // Loguear el error si es necesario
                Console.WriteLine($"Error en Supabase: {ex.Message}");
                return false;
            }
        }

        public async Task<List<ConfigTiemposCategoriasDto>> ObtenerPorEventoIdConFechasAsync(int eventoId)
        {
            var response = await _supabase
                .From<Categoria>()
                .Where(c => c.IdEvento == eventoId)
                .Filter("estado", Supabase.Postgrest.Constants.Operator.Equals, "Pendiente")
                .Select("*")
                .Get();

            return response.Models.Select(c => new ConfigTiemposCategoriasDto
            {   
                EventoId = c.IdEvento,
                CategoriaId = c.Id,
                Nombre = c.Nombre,
                FechaIni = c.FechaIni,
                FechaFin = c.FechaFin,
            }).ToList();
        }

        public async Task<List<CategoriaResponseActualizadoDto>> ObtenerTodosCamposAsync(int eventoId)
        {
            var response = await _supabase
                .From<Categoria>()
                .Where(c => c.IdEvento == eventoId)
                .Select("*")
                .Get();

            return response.Models.Select(c => new CategoriaResponseActualizadoDto
            {
                Id = c.Id,
                Nombre = c.Nombre,
                IdEvento = c.IdEvento,
                FechaIni = c.FechaIni,
                FechaFin = c.FechaFin,
                Estado = c.Estado,
                VotosMaximos = c.VotosMaximos
            }).ToList();
        }


    }
}
