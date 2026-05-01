namespace Votify.API.Models.Domain.Strategies
{
    public interface IComentarioValidationStrategy
    {
        void Validar(string? comentario);
    }
}
