using Votify.API.Models.Domain;
using Votify.API.Repositories;

namespace Votify.API.Services
{
    public class ProyectoService : IProyectoService
    {
        private readonly IProyectoRepository _proyectoRepository;

        public ProyectoService(IProyectoRepository proyectoRepository)
        {
            _proyectoRepository = proyectoRepository;
        }

        public Task<List<Proyecto>> ObtenerTodosAsync() =>
            _proyectoRepository.ObtenerTodosAsync();

        public Task<Proyecto?> ObtenerPorIdAsync(int id) =>
            _proyectoRepository.ObtenerPorIdAsync(id);

        public Task<List<Proyecto>> ObtenerPorCategoriaIdAsync(int categoriaId) =>
            _proyectoRepository.ObtenerPorCategoriaIdAsync(categoriaId);

        public Task<List<Proyecto>> ObtenerPorIdParticipanteAsync(int id) =>
            _proyectoRepository.ObtenerPorIdParticipanteAsync(id);

        public Task<List<Proyecto>> ObtenerPorEventoIdAsync(int eventoId) =>
            _proyectoRepository.ObtenerPorEventoIdAsync(eventoId);

        public Task<Proyecto?> CrearAsync(Proyecto proyecto) =>
            _proyectoRepository.CrearAsync(proyecto);

        public Task<bool> EliminarAsync(int id) =>
            _proyectoRepository.EliminarAsync(id);

        public Task<bool> ActualizarAsync(Proyecto proyecto) =>
            _proyectoRepository.ActualizarAsync(proyecto);
    }
}
