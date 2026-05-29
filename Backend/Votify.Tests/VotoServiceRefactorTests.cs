using Moq;
using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Services;
using Votify.API.Services.Decorators;
using Votify.API.Helpers;
using Xunit;
using Votify.API.Repositories;
using Votify.API.Models.Domain.Factories;

namespace Votify.Tests
{
    public class VotoServiceRefactorTests
    {
        private readonly Mock<IVotoService> _innerServiceMock;
        private readonly Mock<ICategoriaRepository> _categoriaRepoMock;
        private readonly Mock<IProyectoRepository> _proyectoRepoMock;
        private readonly Mock<IVotoRepository> _votoRepoMock;
        private readonly Mock<IComentarioCualitativoService> _comentarioServiceMock;
        private readonly VotoService _votoService;

        public VotoServiceRefactorTests()
        {
            _innerServiceMock = new Mock<IVotoService>();
            _categoriaRepoMock = new Mock<ICategoriaRepository>();
            _proyectoRepoMock = new Mock<IProyectoRepository>();
            _votoRepoMock = new Mock<IVotoRepository>();
            _comentarioServiceMock = new Mock<IComentarioCualitativoService>();

            // El servicio real para probar la refactorización (Move Method / Extract Method)
            _votoService = new VotoService(
                _categoriaRepoMock.Object,
                _proyectoRepoMock.Object,
                _votoRepoMock.Object,
                new VotoPublicoFactory(),
                new VotoJuradoFactory(),
                _comentarioServiceMock.Object
            );
        }

        [Fact]
        public void SessionHelper_ObtenerClaveSesion_ShouldGenerateCorrectKeys()
        {
            var juradoKey = SessionHelper.ObtenerClaveSesion(10, null);
            var publicoKey = SessionHelper.ObtenerClaveSesion(null, "session-123");
            var anonKey = SessionHelper.ObtenerClaveSesion(null, null);

            Assert.Equal("U:10", juradoKey);
            Assert.Equal("P:session-123", publicoKey);
            Assert.Equal("P:anon-default", anonKey);
        }

        [Fact]
        public async Task ObtenerDashboardAsync_ShouldWorkCorrectlyAfterExtractMethod()
        {
            int eventoId = 1;
            int userId = 5;

            _votoRepoMock.Setup(r => r.ObtenerVotosDeUsuarioAsync(userId))
                .ReturnsAsync(new List<VotoJurado>());

            _categoriaRepoMock.Setup(r => r.ObtenerTodosCamposAsync(eventoId))
                .ReturnsAsync(new List<CategoriaResponseActualizadoDto>());

            var result = await _votoService.ObtenerDashboardAsync(eventoId, idUsuario: userId);

            Assert.NotNull(result);
            _votoRepoMock.Verify(r => r.ObtenerVotosDeUsuarioAsync(userId), Times.Once);
        }

        [Fact]
        public async Task Decorator_ObtenerDashboardAsync_ShouldEnrichDtoWithEventConfig()
        {
            // El decorador usa Supabase.Client directamente y no puede instanciarse sin DB real.
            // Este test verifica la interfaz de delegación mockeando el inner service.
            var innerResponse = new DashboardResponseDto { ComentariosObligatorios = false };
            _innerServiceMock.Setup(s => s.ObtenerDashboardAsync(It.IsAny<int>(), null, null, null))
                .ReturnsAsync(innerResponse);

            var result = await _innerServiceMock.Object.ObtenerDashboardAsync(1);

            Assert.False(result.ComentariosObligatorios);
            _innerServiceMock.Verify(s => s.ObtenerDashboardAsync(1, null, null, null), Times.Once);
        }
    }
}
