namespace Votify.API.Strategies
{
    public class ComentarioOpcionalStrategy : IComentarioValidationStrategy
    {
        public void Validar(string? comentario)
        {
            // El comentario es opcional, no hacemos validación estricta
        }
    }
}
