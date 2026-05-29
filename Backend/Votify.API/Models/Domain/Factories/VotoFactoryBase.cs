namespace Votify.API.Models.Domain.Factories
{
    public abstract class VotoFactoryBase : IVotoFactory
    {
        public Voto CrearVoto(int proyectoId, float valorBase, int idCategoria, int idCriterio,
            string? comentario, string? urlAudio, int? idUsuario, string ipDispositivo)
        {
            var voto = CreateVoto(proyectoId, valorBase, idCategoria, idCriterio, comentario, urlAudio, idUsuario, ipDispositivo);
            voto.FechaVoto = DateTime.UtcNow;
            return voto;
        }

        protected abstract Voto CreateVoto(int proyectoId, float valorBase, int idCategoria, int idCriterio,
            string? comentario, string? urlAudio, int? idUsuario, string ipDispositivo);
    }
}
