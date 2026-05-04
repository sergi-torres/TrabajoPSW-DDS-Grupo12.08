using Votify.API.Models.DTOs;

namespace Votify.API.Services
{
    public interface IVotoService
    {
        Task<DashboardResponseDto> ObtenerDashboardAsync(int eventoId, int? idUsuario = null, string? sessionId = null, string? identificadorHash = null);
        Task<DashboardResponseDto> ProcesarVotoAsync(VotoRequestDto request, int? idUsuario = null, string? sessionId = null);
        Task<DashboardResponseDto> ProcesarVotoBatchAsync(VotoBatchRequestDto request);
        Task<IEnumerable<VotoResponseDto>> ObtenerVotosPorProyectoAsync(int proyectoId);
        Task<List<TipoComentaristaDto>> ObtenerResumenComentariosAsync(int proyectoId, int categoriaId);
        Task<List<ComentarioDetalleDto>> ObtenerDetalleComentariosUsuarioAsync(int proyectoId, int categoriaId, string usuarioRef);
    }
}