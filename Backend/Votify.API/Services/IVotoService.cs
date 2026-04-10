using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;

namespace Votify.API.Services
{
    public interface IVotoService
    {

        //? Tal vez en el futuro lo llame asi 
        //Task<Voto> ProcesarNuevoVoto(int usuarioId, int proyectoId, int categoriaId, int criterioId, float valorBase, string rol, string? comentario, string? urlAudio);

        Task<DashboardResponseDto> ObtenerDashboardAsync(int eventoId);
        Task<DashboardResponseDto> ProcesarVotoAsync(VotoRequestDto request);
    }
}