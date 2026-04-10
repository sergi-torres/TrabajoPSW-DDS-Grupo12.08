using Votify.API.Models.Domain;

namespace Votify.API.Factories
{
    public class VotoJuradoFactory : IVotoFactory
    {
        public Voto CrearVoto(int proyectoId, float valorBase, int idCategoria, int idCriterio, string? comentario, string? urlAudio)
        {
            return new VotoJurado
            {
                IdProyecto = proyectoId,
                Valor = valorBase,
                IdCategoria = idCategoria,
                IdCriterio = idCriterio,
                Comentario = comentario,
                UrlAudio = urlAudio,
                FechaVoto = DateTime.UtcNow
                // El IdEvaluador se asignará en el Service tras validar la sesión
            };
        }
    }
}