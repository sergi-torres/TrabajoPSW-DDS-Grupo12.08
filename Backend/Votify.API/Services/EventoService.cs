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
                    .Filter("idusuario", Supabase.Postgrest.Constants.Operator.Equals, userId.ToString())
                    .Get();

                var resultado = new List<EventoResponseDto>();

                foreach (var rel in relaciones.Models)
                {
                    var eventoResponse = await _supabase
                        .From<EventoLite>()
                        .Filter("id", Supabase.Postgrest.Constants.Operator.Equals, rel.IdEvento.ToString())
                        .Get();

                    var evento = eventoResponse.Models.FirstOrDefault();
                    if (evento != null)
                    {
                        resultado.Add(new EventoResponseDto
                        {
                            Id = evento.Id,
                            CodEvento = evento.CodEvento,
                            Nombre = evento.Nombre,
                            Descripcion = evento.Descripcion,
                            FechaIni = evento.FechaInicio,
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

        public async Task<JoinEventoResponseDto> JoinEventoPorCodigoAsync(int codEvento)
        {
            try
            {
                var response = await _supabase
                    .From<EventoLite>()
                    .Filter("cod_evento", Supabase.Postgrest.Constants.Operator.Equals, codEvento.ToString())
                    .Get();

                var evento = response.Models.FirstOrDefault();
                if (evento == null)
                {
                    throw new Exception("El PIN no corresponde a ningun evento.");
                }

                return new JoinEventoResponseDto
                {
                    Id = evento.Id,
                    CodEvento = evento.CodEvento,
                    Nombre = evento.Nombre
                };
            }
            catch (Exception ex)
            {
                throw new Exception("Error al validar el PIN del evento", ex);
            }
        }
    }
}
