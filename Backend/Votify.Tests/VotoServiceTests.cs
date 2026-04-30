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
            // Arrange
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

            _votoRepoMock.Setup(r => r.AgregarVotoAsync(It.IsAny<Voto>()))
                .ReturnsAsync(new VotoPublico { Id = 1 });

            // Mock dependencies for ObtenerDashboardAsync (called at the end of ProcesarVotoAsync)
            _categoriaRepoMock.Setup(r => r.ObtenerTodosCamposAsync(request.EventoId))
                .ReturnsAsync(new List<CategoriaResponseActualizadoDto> { 
                    new CategoriaResponseActualizadoDto { Id = 1, Nombre = "Cat 1", IdEvento = 1, Estado = "Activa" } 
                });
            _proyectoRepoMock.Setup(r => r.ObtenerPorCategoriaIdAsync(1))
                .ReturnsAsync(new List<Proyecto> { new Proyecto { Id = 1, IdCategoria = 1, Nombre = "Proj 1" } });

            // Act
            var result = await _votoService.ProcesarVotoAsync(request);

            // Assert
            Assert.NotNull(result);
            _votoRepoMock.Verify(r => r.RegistrarVotoPublicoAsync(It.Is<RegistroVotoPublico>(
                reg => reg.IdentificadorHash == "unique-hash-123" && reg.IdEvento == 1 && reg.IdCategoria == 1)), Times.Once);
        }

        [Fact]
        public async Task ObtenerDashboardAsync_ShouldMarkProjectAsVoted_WhenFingerprintExists()
        {
            // Arrange
            int eventoId = 1;
            string hash = "voted-hash";

            _votoRepoMock.Setup(r => r.ExisteVotoPublicoAsync(eventoId, 1, hash))
                .ReturnsAsync(true);

            _categoriaRepoMock.Setup(r => r.ObtenerTodosCamposAsync(eventoId))
                .ReturnsAsync(new List<CategoriaResponseActualizadoDto> { 
                    new CategoriaResponseActualizadoDto { Id = 1, Nombre = "Cat 1", IdEvento = eventoId, Estado = "Activa" } 
                });
            _proyectoRepoMock.Setup(r => r.ObtenerPorCategoriaIdAsync(1))
                .ReturnsAsync(new List<Proyecto> { new Proyecto { Id = 1, IdCategoria = 1, Nombre = "Proj 1" } });

            // Act
            var result = await _votoService.ObtenerDashboardAsync(eventoId, identificadorHash: hash);

            // Assert
            var cat = result.Categorias.First();
            Assert.Equal("completado", cat.Estado);
            Assert.Equal("votado", cat.Proyectos.First().Estado);
            Assert.Equal(0, cat.VotosRestantes);
        }

        [Fact]
        public async Task ProcesarVotoAsync_ShouldThrowException_WhenFingerprintAlreadyExists()
        {
            // Arrange
            var request = new VotoRequestDto
            {
                EventoId = 1,
                CategoriaId = 1,
                ProyectoId = 1,
                Valor = 5,
                IdentificadorHash = "existing-hash-123"
            };

            _votoRepoMock.Setup(r => r.ExisteVotoPublicoAsync(request.EventoId, request.CategoriaId, request.IdentificadorHash))
                .ReturnsAsync(true);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => _votoService.ProcesarVotoAsync(request));
            Assert.Contains("Ya se ha registrado un voto", exception.Message);
        }
    }
}
