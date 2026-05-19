using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;

namespace Votify.API.Services.Strategies.Sintesis
{
    public interface ISintesisStrategy
    {
        TipoSintesis Tipo { get; }
        Task<SintesisResult> GenerarAsync(int idProyecto, int idCategoria, CancellationToken ct = default);
    }

    // Lanzada cuando hay menos de 2 comentarios disponibles para sintetizar.
    public class SintesisInsuficienteException : Exception
    {
        public SintesisInsuficienteException(string message) : base(message) { }
    }
}
