using System;

namespace Votify.API.Models.Domain.Strategies
{
    public class ComentarioObligatorioStrategy : IComentarioValidationStrategy
    {
        public void Validar(string? comentario)
        {
            if (string.IsNullOrWhiteSpace(comentario))
            {
                throw new ArgumentException("El comentario es obligatorio para evaluar en este evento.");
            }
        }
    }
}
