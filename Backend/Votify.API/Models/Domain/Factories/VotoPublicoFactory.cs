using Votify.API.Models.Domain;

namespace Votify.API.Models.Domain.Factories
{
    public class VotoPublicoFactory : IVotoFactory
    {
        public Voto CrearVoto(int proyectoId, float valorBase, int idCategoria, int idCriterio, string? comentario, string? urlAudio, int? idUsuario, string ipDispositivo)
        {
            return new VotoPublico
            {
                IdProyecto = proyectoId,
                Valor = valorBase,
                IdCategoria = idCategoria,
                IdCriterio = idCriterio,
                Comentario = comentario,
                UrlAudio = urlAudio,
                FechaVoto = DateTime.UtcNow,
                IdEvaluador = null, // El público es anónimo, ignora el idUsuario
                IpDispositivo = ipDispositivo
            };
        }
    }
}