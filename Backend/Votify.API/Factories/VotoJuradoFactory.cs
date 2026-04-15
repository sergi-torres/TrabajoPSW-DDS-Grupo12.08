using Votify.API.Models.Domain;

namespace Votify.API.Factories
{
    public class VotoJuradoFactory : IVotoFactory
    {
        public Voto CrearVoto(int proyectoId, float valorBase, int idCategoria, int idCriterio, string? comentario, string? urlAudio, int? idUsuario, string ipDispositivo)
        {
            return new VotoJurado
            {
                IdProyecto = proyectoId,
                Valor = valorBase,
                IdCategoria = idCategoria,
                IdCriterio = idCriterio,
                Comentario = comentario,
                UrlAudio = urlAudio,
                FechaVoto = DateTime.UtcNow,
                IdEvaluador = idUsuario, // El jurado SÍ usa el idUsuario
                IpDispositivo = ipDispositivo // El IdEvaluador se asignará en el Service tras validar la sesión
            };
        }
    }
}