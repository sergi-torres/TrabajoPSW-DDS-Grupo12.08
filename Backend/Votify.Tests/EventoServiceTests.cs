using Moq;
using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Repositories;
using Votify.API.Services;
using Xunit;

namespace Votify.Tests
{
    public class EventoServiceTests
    {
        private readonly Mock<IEventoRepository> _eventoRepoMock;
        private readonly Mock<IEventoUsuarioRepository> _eventoUsuarioRepoMock;
        private readonly Mock<ICategoriaRepository> _categoriaRepoMock;
        private readonly Mock<IProyectoRepository> _proyectoRepoMock;
        private readonly Mock<IBaremoRepository> _baremoRepoMock;
        private readonly EventoService _eventoService;

        public EventoServiceTests()
        {
            _eventoRepoMock = new Mock<IEventoRepository>();
            _eventoUsuarioRepoMock = new Mock<IEventoUsuarioRepository>();
            _categoriaRepoMock = new Mock<ICategoriaRepository>();
            _proyectoRepoMock = new Mock<IProyectoRepository>();
            _baremoRepoMock = new Mock<IBaremoRepository>();

            _eventoService = new EventoService(
                _categoriaRepoMock.Object, 
                _proyectoRepoMock.Object,
                _eventoRepoMock.Object,
                _eventoUsuarioRepoMock.Object,
                _baremoRepoMock.Object
            );
        }

        [Fact]
        public async Task GetEventosByUsuarioAsync_ShouldReturnEvents_WhenUserHasRelations()
        {
            // Arrange
            int userId = 1;
            var relaciones = new List<EventoUsuario>
            {
                new EventoUsuario { Id = 1, IdEvento = 101, IdUsuario = userId, Rol = "Organizador" }
            };
            var evento = new EventoLite 
            { 
                Id = 101, 
                Nombre = "Evento Test", 
                CodEvento = 1234, 
                Descripcion = "Desc",
                Estado = "Activo",
                FechaInicio = DateTime.Now,
                FechaFin = DateTime.Now.AddDays(1)
            };

            _eventoUsuarioRepoMock.Setup(r => r.GetByUsuarioAsync(userId))
                .ReturnsAsync(relaciones);
            _eventoRepoMock.Setup(r => r.GetByIdAsync(101))
                .ReturnsAsync(evento);

            // Act
            var result = await _eventoService.GetEventosByUsuarioAsync(userId);

            // Assert
            Assert.Single(result);
            Assert.Equal("Evento Test", result[0].Nombre);
            Assert.Equal("Organizador", result[0].Rol);
            Assert.Equal(1234, result[0].CodEvento);
        }

        [Fact]
        public async Task JoinEventoPorCodigoAsync_ShouldReturnEvent_WhenPinIsValid()
        {
            // Arrange
            int pin = 1234;
            var evento = new EventoLite 
            { 
                Id = 101, 
                Nombre = "Evento Encontrado", 
                CodEvento = pin
            };

            _eventoRepoMock.Setup(r => r.GetByCodigoAsync(pin))
                .ReturnsAsync(evento);

            // Act
            var result = await _eventoService.JoinEventoPorCodigoAsync(pin);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(101, result.Id);
            Assert.Equal("Evento Encontrado", result.Nombre);
        }

        [Fact]
        public async Task JoinEventoPorCodigoAsync_ShouldThrowException_WhenPinIsInvalid()
        {
            // Arrange
            int pin = 9999;
            _eventoRepoMock.Setup(r => r.GetByCodigoAsync(pin))
                .ReturnsAsync((EventoLite?)null);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => _eventoService.JoinEventoPorCodigoAsync(pin));
            Assert.Equal("Error al validar el PIN del evento", ex.Message);
            Assert.Contains("El PIN no corresponde a ningun evento", ex.InnerException?.Message);
        }

        [Fact]
        public async Task GetEventoDetalleAsync_ShouldReturnFullDetail()
        {
            // Arrange
            int eventoId = 101;
            var evento = new EventoLite { Id = eventoId, Nombre = "Evento Completo" };
            var baremos = new List<Baremo> { new Baremo { Id = 1, Nombre = "Baremo 1" } };
            var criterios = new List<Criterio> { new Criterio { Id = 1, Nombre = "Criterio 1", TipoCriterio = TipoCriterioEnum.Numerico } };
            var categorias = new List<Categoria> { new Categoria { Id = 1, Nombre = "Cat 1" } };
            var pesos = new List<PesoCategoriaRol> { new PesoCategoriaRol { RolVotante = "Jurado", Peso = 1.0f } };

            _eventoRepoMock.Setup(r => r.GetByIdAsync(eventoId)).ReturnsAsync(evento);
            _baremoRepoMock.Setup(r => r.GetByEventoIdAsync(eventoId)).ReturnsAsync(baremos);
            _baremoRepoMock.Setup(r => r.GetCriteriosByBaremoIdAsync(1)).ReturnsAsync(criterios);
            _categoriaRepoMock.Setup(r => r.ObtenerCategoriasDominioPorEventoIdAsync(eventoId)).ReturnsAsync(categorias);
            _categoriaRepoMock.Setup(r => r.ObtenerPesosPorCategoriaIdAsync(1)).ReturnsAsync(pesos);

            // Act
            var result = await _eventoService.GetEventoDetalleAsync(eventoId);

            // Assert
            Assert.Equal("Evento Completo", result.Nombre);
            Assert.Single(result.Baremos);
            Assert.Single(result.Categorias);
            Assert.Equal("Numerico", result.Baremos[0].Criterios[0].TipoCriterio);
        }

        [Fact]
        public async Task UpdateEventoAsync_ShouldUpdateBasicInfoAndBaremos()
        {
            // Arrange
            int eventoId = 101;
            var dto = new UpdateEventDto
            {
                Nombre = "Evento Actualizado",
                Baremos = new List<CreateBaremoDto>
                {
                    new CreateBaremoDto { Nombre = "Nuevo Baremo", Criterios = new List<CreateCriterioDto>() }
                }
            };

            var eventoExistente = new EventoLite { Id = eventoId, Nombre = "Viejo", Estado = "Pendiente" };
            var baremosExistentes = new List<Baremo> { new Baremo { Id = 5, Nombre = "Baremo Antiguo" } };

            _eventoRepoMock.Setup(r => r.GetByIdAsync(eventoId)).ReturnsAsync(eventoExistente);
            _eventoRepoMock.Setup(r => r.UpdateBasicAsync(eventoId, dto)).ReturnsAsync(true);
            
            // First call returns old baremos, second call (from GetEventoDetalleAsync) returns new ones
            _baremoRepoMock.SetupSequence(r => r.GetByEventoIdAsync(eventoId))
                .ReturnsAsync(baremosExistentes)
                .ReturnsAsync(new List<Baremo> { new Baremo { Id = 6, Nombre = "Nuevo Baremo" } });
            
            // Mock deletion of old baremo
            _baremoRepoMock.Setup(r => r.DeleteCriteriosByBaremoIdAsync(5)).ReturnsAsync(true);
            _baremoRepoMock.Setup(r => r.DeleteAsync(5)).ReturnsAsync(true);
            
            // Mock insertion of new baremo
            _baremoRepoMock.Setup(r => r.InsertAsync(It.IsAny<Baremo>()))
                .ReturnsAsync(new Baremo { Id = 6, Nombre = "Nuevo Baremo" });
            
            // Mock criteria for new baremo
            _baremoRepoMock.Setup(r => r.GetCriteriosByBaremoIdAsync(It.IsAny<int>()))
                .ReturnsAsync(new List<Criterio>());

            // Mock categories for the final GetEventoDetalleAsync call
            _categoriaRepoMock.Setup(r => r.ObtenerCategoriasDominioPorEventoIdAsync(eventoId))
                .ReturnsAsync(new List<Categoria>());

            // Act
            var result = await _eventoService.UpdateEventoAsync(eventoId, dto);

            // Assert
            _eventoRepoMock.Verify(r => r.UpdateBasicAsync(eventoId, dto), Times.Once);
            _baremoRepoMock.Verify(r => r.DeleteAsync(5), Times.Once);
            _baremoRepoMock.Verify(r => r.InsertAsync(It.Is<Baremo>(b => b.Nombre == "Nuevo Baremo")), Times.Once);
        }
    }
}
