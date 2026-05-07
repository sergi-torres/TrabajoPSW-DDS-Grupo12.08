using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Supabase;

namespace Votify.API.Repositories
{
    public class EventoRepository : IEventoRepository
    {
        private readonly Supabase.Client _supabase;

        public EventoRepository(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        public async Task<EventoLite?> GetByIdAsync(int id)
        {
            var response = await _supabase
                .From<EventoLite>()
                .Filter("id", Supabase.Postgrest.Constants.Operator.Equals, id.ToString())
                .Get();

            return response.Models.FirstOrDefault();
        }

        public async Task<EventoLite?> GetByCodigoAsync(int codEvento)
        {
            var response = await _supabase
                .From<EventoLite>()
                .Filter("cod_evento", Supabase.Postgrest.Constants.Operator.Equals, codEvento.ToString())
                .Get();

            return response.Models.FirstOrDefault();
        }

        public async Task<bool> UpdateBasicAsync(int id, UpdateEventDto dto)
        {
            var response = await _supabase
                .From<EventoLite>()
                .Filter("id", Supabase.Postgrest.Constants.Operator.Equals, id.ToString())
                .Set(e => e.Nombre, dto.Nombre)
                .Set(e => e.Descripcion, dto.Descripcion)
                .Set(e => e.FechaInicio, dto.FechaInicio)
                .Set(e => e.FechaFin, dto.FechaFin)
                .Set(e => e.TipoEvento, dto.TipoEvento)
                .Set(e => e.ComentariosObligatorios, dto.ComentariosObligatorios)
                .Update();
            return response.ResponseMessage?.IsSuccessStatusCode ?? false;
        }
    }
}
