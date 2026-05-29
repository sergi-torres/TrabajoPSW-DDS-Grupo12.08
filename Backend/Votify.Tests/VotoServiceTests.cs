using Moq;
using Votify.API.Models.Domain;
using Votify.API.Models.Domain.Factories;
using Votify.API.Models.DTOs;
using Votify.API.Repositories;
using Votify.API.Services;
using Xunit;

namespace Votify.Tests
{
    public class VotoServiceTests
    {
        private readonly Mock<ICategoriaRepository> _categoriaRepoMock;
        private readonly Mock<IProyectoRepository> _proyectoRepoMock;
        private readonly Mock<IVotoRepository> _votoRepoMock;
        private readonly Mock<IComentarioCualitativoService> _comentarioServiceMock;
        private readonly VotoPublicoFactory _votoPublicoFactory;
        private readonly VotoJuradoFactory _votoJuradoFactory;
        private readonly VotoService _votoService;

        public VotoServiceTests()
        {
            _categoriaRepoMock = new Mock<ICategoriaRepository>();
            _proyectoRepoMock = new Mock<IProyectoRepository>();
            _votoRepoMock = new Mock<IVotoRepository>();
            _comentarioServiceMock = new Mock<IComentarioCualitativoService>();
            _votoPublicoFactory = new VotoPublicoFactory();
            _votoJuradoFactory = new VotoJuradoFactory();

            _votoService = new VotoService(
                _categoriaRepoMock.Object,
                _proyectoRepoMock.Object,
                _votoRepoMock.Object,
                _votoPublicoFactory,
                _votoJuradoFactory,
                _comentarioServiceMock.Object
            );
        }

        [Fact]
        public async Task ProcesarVotoAsync_ShouldSucceed_WhenFingerprintIsNew()
        {
            var request = new VotoRequestDto
            {
                EventoId = 1,
                CategoriaId = 1,
                ProyectoId = 1,
                Valor = 5,
                IdentificadorHash = "unique-hash-123"
            };

            _votoRepoMock.Setup(r => r.ExisteVotoPublicoAsync(request.EventoId, request.CategoriaId, request.IdentificadorHash))
                .ReturnsAsync(false);
            _votoRepoMock.Setup(r => r.ObtenerProyectosVotadosPublicoAsync(request.EventoId, request.CategoriaId, request.IdentificadorHash))
                .ReturnsAsync(new List<int>());
            _votoRepoMock.Setup(r => r.AgregarVotoAsync(It.IsAny<Voto>()))
                .ReturnsAsync(new VotoPublico { Id = 1 });
            _votoRepoMock.Setup(r => r.ObtenerTodosVotosPublicosPorHashAsync(request.EventoId, request.IdentificadorHash))
                .ReturnsAsync(new List<RegistroVotoPublico>());

            // ProcesarVotoAsync llama a ObtenerDashboardAsync internamente al final
            _categoriaRepoMock.Setup(r => r.ObtenerTodosCamposAsync(request.EventoId))
                .ReturnsAsync(new List<CategoriaResponseActualizadoDto> {
                    new CategoriaResponseActualizadoDto { Id = 1, Nombre = "Cat 1", IdEvento = 1, Estado = "Activa" }
                });
            _proyectoRepoMock.Setup(r => r.ObtenerPorCategoriaIdAsync(1))
                .ReturnsAsync(new List<Proyecto> { new Proyecto { Id = 1, IdCategoria = 1, Nombre = "Proj 1" } });

            var result = await _votoService.ProcesarVotoAsync(request);

            Assert.NotNull(result);
            _votoRepoMock.Verify(r => r.RegistrarVotoPublicoAsync(It.Is<RegistroVotoPublico>(
                reg => reg.IdentificadorHash == "unique-hash-123" && reg.IdEvento == 1 && reg.IdCategoria == 1)), Times.Once);
        }

        [Fact]
        public async Task ObtenerDashboardAsync_ShouldMarkProjectAsVoted_WhenFingerprintExists()
        {
            int eventoId = 1;
            string hash = "voted-hash";

            _votoRepoMock.Setup(r => r.ExisteVotoPublicoAsync(eventoId, 1, hash))
                .ReturnsAsync(true);
            _votoRepoMock.Setup(r => r.ObtenerTodosVotosPublicosPorHashAsync(eventoId, hash))
                .ReturnsAsync(new List<RegistroVotoPublico> {
                    new RegistroVotoPublico { IdEvento = eventoId, IdCategoria = 1, IdProyecto = 1, IdentificadorHash = hash }
                });
            _categoriaRepoMock.Setup(r => r.ObtenerTodosCamposAsync(eventoId))
                .ReturnsAsync(new List<CategoriaResponseActualizadoDto> {
                    new CategoriaResponseActualizadoDto { Id = 1, Nombre = "Cat 1", IdEvento = eventoId, Estado = "Activa", VotosMaximos = 1 }
                });
            _proyectoRepoMock.Setup(r => r.ObtenerPorCategoriaIdAsync(1))
                .ReturnsAsync(new List<Proyecto> { new Proyecto { Id = 1, IdCategoria = 1, Nombre = "Proj 1" } });

            var result = await _votoService.ObtenerDashboardAsync(eventoId, identificadorHash: hash);

            var cat = result.Categorias.First();
            Assert.Equal("completado", cat.Estado);
            Assert.Equal("votado", cat.Proyectos.First().Estado);
            Assert.Equal(0, cat.VotosRestantes);
        }

        [Fact]
        public async Task ProcesarVotoAsync_ShouldThrowException_WhenFingerprintAlreadyExists()
        {
            var request = new VotoRequestDto
            {
                EventoId = 1,
                CategoriaId = 1,
                ProyectoId = 1,
                Valor = 5,
                IdentificadorHash = "existing-hash-123"
            };

            _votoRepoMock.Setup(r => r.ObtenerProyectosVotadosPublicoAsync(request.EventoId, request.CategoriaId, request.IdentificadorHash))
                .ReturnsAsync(new List<int> { request.ProyectoId });

            var exception = await Assert.ThrowsAsync<Exception>(() => _votoService.ProcesarVotoAsync(request));
            Assert.Contains("Ya has votado por este proyecto", exception.Message);
        }

        [Fact]
        public async Task ProcesarVotoAsync_ShouldSucceed_WhenJuradoVotes()
        {
            int userId = 10;
            var request = new VotoRequestDto
            {
                EventoId = 1,
                CategoriaId = 1,
                ProyectoId = 1,
                Valor = 8,
                Comentario = "Gran proyecto"
            };

            _votoRepoMock.Setup(r => r.ObtenerRolUsuarioEnEventoAsync(userId, request.EventoId))
                .ReturnsAsync("Jurado");
            _votoRepoMock.Setup(r => r.AgregarVotoAsync(It.IsAny<Voto>()))
                .ReturnsAsync(new VotoJurado { Id = 100 });

            // ProcesarVotoAsync llama a ObtenerDashboardAsync internamente tras persistir el voto
            _categoriaRepoMock.Setup(r => r.ObtenerTodosCamposAsync(request.EventoId))
                .ReturnsAsync(new List<CategoriaResponseActualizadoDto> {
                    new CategoriaResponseActualizadoDto { Id = 1, Nombre = "Cat 1", IdEvento = 1, Estado = "Activa" }
                });
            _proyectoRepoMock.Setup(r => r.ObtenerPorCategoriaIdAsync(1))
                .ReturnsAsync(new List<Proyecto> { new Proyecto { Id = 1, IdCategoria = 1, Nombre = "Proj 1" } });
            _votoRepoMock.Setup(r => r.ObtenerVotosDeUsuarioAsync(userId))
                .ReturnsAsync(new List<VotoJurado> { new VotoJurado { IdCategoria = 1, IdProyecto = 1 } });

            var result = await _votoService.ProcesarVotoAsync(request, idUsuario: userId);

            Assert.NotNull(result);
            _votoRepoMock.Verify(r => r.AgregarVotoAsync(It.Is<Voto>(v => v.IdEvaluador == userId && v.Valor == 8)), Times.Once);
        }

        [Fact]
        public async Task ObtenerResumenComentariosAsync_ShouldGroupAndAnonymizeCorrectly()
        {
            int proyectoId = 1;
            int categoriaId = 1;

            var votos = new List<Voto>
            {
                new VotoJurado { Id = 1, IdProyecto = proyectoId, IdCategoria = categoriaId, IdEvaluador = 101, Comentario = "Comentario 1" },
                new VotoJurado { Id = 2, IdProyecto = proyectoId, IdCategoria = categoriaId, IdEvaluador = 101, Comentario = "Comentario 2" },
                new VotoJurado { Id = 3, IdProyecto = proyectoId, IdCategoria = categoriaId, IdEvaluador = 102, Comentario = "Comentario 3" },
                new VotoPublico { Id = 4, IdProyecto = proyectoId, IdCategoria = categoriaId, IpDispositivo = "hash1", Comentario = "Publico 1" }
            };

            _votoRepoMock.Setup(r => r.ObtenerVotosPorProyectoYCategoriaAsync(proyectoId, categoriaId))
                .ReturnsAsync(votos);

            var result = await _votoService.ObtenerResumenComentariosAsync(proyectoId, categoriaId);

            Assert.Equal(2, result.Count);
            var jurado = result.First(t => t.Tipo == "Jurado");
            Assert.Equal(2, jurado.Usuarios.Count);
            Assert.Equal(3, jurado.TotalComentarios);

            var publico = result.First(t => t.Tipo == "Público");
            Assert.Single(publico.Usuarios);
            Assert.Equal(1, publico.TotalComentarios);

            // Nombres anonimizados: IdEvaluador no se expone, solo alias "Jurado" + referencia opaca
            Assert.All(jurado.Usuarios, u => Assert.Equal("Jurado", u.Nombre));
            Assert.All(jurado.Usuarios, u => Assert.NotEmpty(u.Referencia));
        }
    }
}
