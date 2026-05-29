using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Repositories;
using Votify.API.Services.Strategies.Sintesis;

namespace Votify.API.Services
{
    public class SintesisComentariosService : ISintesisComentariosService
    {
        private readonly ICategoriaRepository _categoriaRepo;
        private readonly IProyectoRepository _proyectoRepo;
        private readonly IUsuarioRepository _usuarioRepo;
        private readonly ISintesisRepository _sintesisRepo;
        private readonly IVotoRepository _votoRepo;
        private readonly ISintesisStrategyFactory _factory;

        public SintesisComentariosService(
            ICategoriaRepository categoriaRepo,
            IProyectoRepository proyectoRepo,
            IUsuarioRepository usuarioRepo,
            ISintesisRepository sintesisRepo,
            IVotoRepository votoRepo,
            ISintesisStrategyFactory factory)
        {
            _categoriaRepo = categoriaRepo;
            _proyectoRepo = proyectoRepo;
            _usuarioRepo = usuarioRepo;
            _sintesisRepo = sintesisRepo;
            _votoRepo = votoRepo;
            _factory = factory;
        }

        public async Task<SintesisProyectoDto> ObtenerAsync(int idProyecto, int idCategoria, string userEmail)
        {
            await ValidarProyectoYOwnershipAsync(idProyecto, idCategoria, userEmail);

            var lista = await _sintesisRepo.ObtenerPorProyectoCategoriaAsync(idProyecto, idCategoria);
            return new SintesisProyectoDto
            {
                Jurado = lista.FirstOrDefault(s => s.Tipo == "jurado") is { } jurado ? Map(jurado) : null,
                Publico = lista.FirstOrDefault(s => s.Tipo == "publico") is { } publico ? Map(publico) : null
            };
        }

        public async Task<SintesisDto> GenerarAsync(
            int idProyecto, int idCategoria, TipoSintesis tipo,
            string userEmail, Guid? authUid, CancellationToken ct = default)
        {
            // La síntesis requiere estado "Finalizada"; no se permite sobre categorías activas para evitar resultados parciales.
            Categoria categoria;
            try
            {
                categoria = await _categoriaRepo.ObtenerPorIdAsync(idCategoria);
            }
            catch (KeyNotFoundException)
            {
                throw new CategoriaNoFinalizadaException("La categoría no existe.");
            }

            if (!string.Equals(categoria.Estado, "Finalizada", StringComparison.OrdinalIgnoreCase))
                throw new CategoriaNoFinalizadaException("La síntesis solo está disponible cuando la categoría está finalizada.");

            await ValidarProyectoYOwnershipAsync(idProyecto, idCategoria, userEmail);

            var strategy = _factory.Crear(tipo);
            var resultado = await strategy.GenerarAsync(idProyecto, idCategoria, ct);

            var entidad = new SintesisComentarios
            {
                IdProyecto = idProyecto,
                IdCategoria = idCategoria,
                Tipo = SintesisComentarios.TipoToString(tipo),
                Sentimiento = resultado.Sentimiento,
                ResumenGeneral = resultado.ResumenGeneral,
                ComentariosCount = resultado.ComentariosCount,
                ModeloUsado = resultado.ModeloUsado,
                FechaGeneracion = DateTime.UtcNow,
                GeneradoPorUid = authUid
            };
            entidad.SetFortalezas(resultado.Fortalezas);
            entidad.SetMejoras(resultado.Mejoras);

            var persistida = await _sintesisRepo.UpsertAsync(entidad);
            return Map(persistida);
        }

        private async Task ValidarProyectoYOwnershipAsync(int idProyecto, int idCategoria, string userEmail)
        {
            var proyecto = await _proyectoRepo.ObtenerPorIdAsync(idProyecto);
            if (proyecto == null)
                throw new ProyectoNoEncontradoException("El proyecto no existe.");

            if (proyecto.IdCategoria != idCategoria)
                throw new ProyectoNoEncontradoException("El proyecto no participa en esta categoría.");

            var usuario = await _usuarioRepo.GetByEmailAsync(userEmail);
            if (usuario == null)
                throw new OwnershipDeniedException("Usuario autenticado no encontrado en la base de datos.");

            var esPropietario =
                proyecto.IdParticipante == usuario.Id ||
                (proyecto.IdMiembros != null && proyecto.IdMiembros.Contains(usuario.Id));

            if (esPropietario) return;

            // El organizador puede acceder a la síntesis de cualquier proyecto, no solo a los suyos.
            if (proyecto.IdEvento.HasValue)
            {
                var rol = await _votoRepo.ObtenerRolUsuarioEnEventoAsync(usuario.Id, proyecto.IdEvento.Value);
                if (string.Equals(rol, "Organizador", StringComparison.OrdinalIgnoreCase))
                    return;
            }

            throw new OwnershipDeniedException("No tienes permiso para ver o generar esta síntesis.");
        }

        private static SintesisDto Map(SintesisComentarios s) => new SintesisDto
        {
            Id = s.Id,
            IdProyecto = s.IdProyecto,
            IdCategoria = s.IdCategoria,
            Tipo = s.Tipo,
            Fortalezas = s.GetFortalezas(),
            Mejoras = s.GetMejoras(),
            Sentimiento = s.Sentimiento,
            ResumenGeneral = s.ResumenGeneral,
            ComentariosCount = s.ComentariosCount,
            ModeloUsado = s.ModeloUsado,
            FechaGeneracion = s.FechaGeneracion
        };
    }
}
