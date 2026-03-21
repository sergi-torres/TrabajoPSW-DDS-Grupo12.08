using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;

namespace Votify.API.Services
{
    public class EventoService : IEventoService
    {
        private readonly Supabase.Client _supabase;

        public EventoService(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        public async Task<List<EventoResponseDto>> GetEventosByUsuarioAsync(int userId)
        {
            try
            {
                // Buscar en la tabla relación evento_usuario los eventos de este usuario
                var relaciones = await _supabase
                    .From<EventoUsuario>()
                    .Where(eu => eu.IdUsuario == userId)
                    .Get();

                var resultado = new List<EventoResponseDto>();

                foreach (var rel in relaciones.Models)
                {
                    var eventoResponse = await _supabase
                        .From<Evento>()
                        .Where(e => e.Id == rel.IdEvento)
                        .Get();

                    var evento = eventoResponse.Models.FirstOrDefault();
                    if (evento != null)
                    {
                        resultado.Add(new EventoResponseDto
                        {
                            Id = evento.Id,
                            Nombre = evento.Nombre,
                            Descripcion = evento.Descripcion,
                            FechaIni = evento.FechaIni,
                            FechaFin = evento.FechaFin,
                            Estado = evento.Estado,
                            Rol = rel.Rol
                        });
                    }
                }

                return resultado;
            }
            catch (Exception ex)
            {
                throw new Exception("Error al obtener los eventos del usuario", ex);
            }
        }
    }
}
