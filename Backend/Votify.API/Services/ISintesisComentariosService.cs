using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;

namespace Votify.API.Services
{
    public interface ISintesisComentariosService
    {
        Task<SintesisProyectoDto> ObtenerAsync(int idProyecto, int idCategoria, string userEmail);
        Task<SintesisDto> GenerarAsync(int idProyecto, int idCategoria, TipoSintesis tipo, string userEmail, Guid? authUid, CancellationToken ct = default);
    }

    // Excepciones tipadas para mapear cleanly a status codes en el controller.
    public class CategoriaNoFinalizadaException : Exception
    {
        public CategoriaNoFinalizadaException(string message) : base(message) { }
    }

    public class ProyectoNoEncontradoException : Exception
    {
        public ProyectoNoEncontradoException(string message) : base(message) { }
    }

    public class OwnershipDeniedException : Exception
    {
        public OwnershipDeniedException(string message) : base(message) { }
    }
}
