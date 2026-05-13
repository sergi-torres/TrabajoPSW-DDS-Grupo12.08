using Votify.API.Models.DTOs;
using Votify.API.Services;
using Votify.API.Repositories;

namespace Votify.API.Services
{
    public class PremioService : IPremioService
    {

        private readonly IPremioRepository _premioRepository;

        public PremioService(IPremioRepository premioRepository)
        {
            _premioRepository = premioRepository;
        }

        public async Task<bool> ActualizarPremioAsync(int premioId, ActualizarPremioRequestDto premioDto)
        {
            var premio = await _premioRepository.ObtenerPorIdAsync(premioId);

            premio.Nombre = premioDto.Nombre;
            premio.Descripcion = premioDto.Descripcion; 
            premio.IdCategoria = premioDto.IdCategoria;
            premio.Posicion = premioDto.Posicion; 
            premio.Icono = premioDto.Icono;

            return await _premioRepository.ActualizarPremioAsync(premio);
        }

        public async Task<bool> CrearPremioAsync(CrearPremioRequestDto premioDto)
        {
            return await _premioRepository.CrearPremioAsync(new Models.Domain.Premio
            {
                Nombre = premioDto.Nombre,
                Descripcion = premioDto.Descripcion,
                IdCategoria = premioDto.IdCategoria,
                Posicion = premioDto.Posicion,
                Icono = premioDto.Icono
            });
        }

        public async Task<bool> EliminarPremioAsync(int premioId)
        {
            await _premioRepository.EliminarPremioAsync(premioId);
            return true;
        }

        public async Task<List<PremioResponseDto>> ObtenerPremiosDelEventoAsync(int eventoId)
        {   
            var premios = await ObtenerPremiosDelEventoAsync(eventoId);
            return premios.Select(p => new PremioResponseDto
                {
                    Id = p.Id,
                    Nombre = p.Nombre,
                    Descripcion = p.Descripcion,
                    IdCategoria = p.IdCategoria,
                    Posicion = p.Posicion,
                    Icono = p.Icono,
                }).ToList();
        }
    }
}