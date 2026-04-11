using Votify.API.Models.Domain;

namespace Votify.API.Factories
{
    public class VotoPublicoFactory : IVotoFactory
    {
        public Voto CrearVoto(int proyectoId, float valorBase, int idCategoria, int idCriterio, string? comentario, string? urlAudio)
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
                IpDispositivo = "" // Se llenará en el Service con la IP real del cliente
            };
        }
    }
}