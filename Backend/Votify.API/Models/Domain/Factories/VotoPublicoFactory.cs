namespace Votify.API.Models.Domain.Factories
{
    public class VotoPublicoFactory : VotoFactoryBase
    {
        protected override Voto CreateVoto(int proyectoId, float valorBase, int idCategoria, int idCriterio,
            string? comentario, string? urlAudio, int? idUsuario, string ipDispositivo)
        {
            return new VotoPublico
            {
                IdProyecto = proyectoId,
                Valor = valorBase,
                IdCategoria = idCategoria,
                IdCriterio = idCriterio,
                Comentario = comentario,
                UrlAudio = urlAudio,
                IdEvaluador = null,
                IpDispositivo = ipDispositivo
            };
        }
    }
}