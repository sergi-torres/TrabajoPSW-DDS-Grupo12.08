using Xunit;
using Moq;
using System.Threading.Tasks;
using Votify.API.Repositories;
using Votify.API.Models.Domain;

namespace Votify.Tests
{
    public class ObtenerPorIdTests
    {
        private readonly Mock<IProyectoRepository> _mockRepo;

        public ObtenerPorIdTests()
        {
            _mockRepo = new Mock<IProyectoRepository>();
        }

        [Fact]
        public async Task ObtenerProyectoPorId_CuandoExiste_DevuelveProyectoCorrecto()
        {
            // Arrange
            var proyectoId = 1;
            var proyectoEsperado = new Proyecto { Id = 1, Nombre = "Test" };

            _mockRepo.Setup(x => x.ObtenerPorIdAsync(proyectoId))
                     .ReturnsAsync(proyectoEsperado);

            // Act
            var resultado = await _mockRepo.Object.ObtenerPorIdAsync(proyectoId);

            // Assert
            Assert.Equal(proyectoEsperado.Id, resultado.Id);
        }
    }
}