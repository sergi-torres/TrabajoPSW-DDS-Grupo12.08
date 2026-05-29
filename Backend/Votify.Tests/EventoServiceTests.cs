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

            _eventoUsuarioRepoMock.Setup(r => r.GetByUsuarioAsync(userId)).ReturnsAsync(relaciones);
            _eventoRepoMock.Setup(r => r.GetByIdAsync(101)).ReturnsAsync(evento);

            var result = await _eventoService.GetEventosByUsuarioAsync(userId);

            Assert.Single(result);
            Assert.Equal("Evento Test", result[0].Nombre);
            Assert.Equal("Organizador", result[0].Rol);
            Assert.Equal(1234, result[0].CodEvento);
        }

        [Fact]
        public async Task JoinEventoPorCodigoAsync_ShouldReturnEvent_WhenPinIsValid()
        {
            int pin = 1234;
            var evento = new EventoLite { Id = 101, Nombre = "Evento Encontrado", CodEvento = pin };

            _eventoRepoMock.Setup(r => r.GetByCodigoAsync(pin)).ReturnsAsync(evento);

            var result = await _eventoService.JoinEventoPorCodigoAsync(pin);

            Assert.NotNull(result);
            Assert.Equal(101, result.Id);
            Assert.Equal("Evento Encontrado", result.Nombre);
        }

        [Fact]
        public async Task JoinEventoPorCodigoAsync_ShouldThrowException_WhenPinIsInvalid()
        {
            int pin = 9999;
            _eventoRepoMock.Setup(r => r.GetByCodigoAsync(pin)).ReturnsAsync((EventoLite?)null);

            var ex = await Assert.ThrowsAsync<Exception>(() => _eventoService.JoinEventoPorCodigoAsync(pin));
            Assert.Equal("Error al validar el PIN del evento", ex.Message);
            Assert.Contains("El PIN no corresponde a ningun evento", ex.InnerException?.Message);
        }

        [Fact]
        public async Task GetEventoDetalleAsync_ShouldReturnFullDetail()
        {
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

            var result = await _eventoService.GetEventoDetalleAsync(eventoId);

            Assert.Equal("Evento Completo", result.Nombre);
            Assert.Single(result.Baremos);
            Assert.Single(result.Categorias);
            Assert.Equal("Numerico", result.Baremos[0].Criterios[0].TipoCriterio);
        }

        [Fact]
        public async Task UpdateEventoAsync_ShouldUpdateBasicInfoAndBaremos()
        {
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

            // Primera llamada devuelve baremos previos; la segunda (desde GetEventoDetalleAsync al final) devuelve los nuevos
            _baremoRepoMock.SetupSequence(r => r.GetByEventoIdAsync(eventoId))
                .ReturnsAsync(baremosExistentes)
                .ReturnsAsync(new List<Baremo> { new Baremo { Id = 6, Nombre = "Nuevo Baremo" } });

            _baremoRepoMock.Setup(r => r.DeleteCriteriosByBaremoIdAsync(5)).ReturnsAsync(true);
            _baremoRepoMock.Setup(r => r.DeleteAsync(5)).ReturnsAsync(true);
            _baremoRepoMock.Setup(r => r.InsertAsync(It.IsAny<Baremo>()))
                .ReturnsAsync(new Baremo { Id = 6, Nombre = "Nuevo Baremo" });
            _baremoRepoMock.Setup(r => r.GetCriteriosByBaremoIdAsync(It.IsAny<int>()))
                .ReturnsAsync(new List<Criterio>());
            _categoriaRepoMock.Setup(r => r.ObtenerCategoriasDominioPorEventoIdAsync(eventoId))
                .ReturnsAsync(new List<Categoria>());

            var result = await _eventoService.UpdateEventoAsync(eventoId, dto);

            _eventoRepoMock.Verify(r => r.UpdateBasicAsync(eventoId, dto), Times.Once);
            _baremoRepoMock.Verify(r => r.DeleteAsync(5), Times.Once);
            _baremoRepoMock.Verify(r => r.InsertAsync(It.Is<Baremo>(b => b.Nombre == "Nuevo Baremo")), Times.Once);
        }

        [Fact]
        public async Task GetEventosDisponiblesAsync_ShouldExcludeUserEvents()
        {
            int userId = 1;
            var todos = new List<EventoLite>
            {
                new EventoLite { Id = 1, Nombre = "Evento A", Estado = "Activo", FechaInicio = DateTime.Now, FechaFin = DateTime.Now.AddDays(1) },
                new EventoLite { Id = 2, Nombre = "Evento B", Estado = "Activo", FechaInicio = DateTime.Now, FechaFin = DateTime.Now.AddDays(1) },
                new EventoLite { Id = 3, Nombre = "Evento C", Estado = "Activo", FechaInicio = DateTime.Now, FechaFin = DateTime.Now.AddDays(1) }
            };
            var misRelaciones = new List<EventoUsuario>
            {
                new EventoUsuario { IdEvento = 1, IdUsuario = userId, Rol = "Participante" }
            };

            _eventoRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(todos);
            _eventoUsuarioRepoMock.Setup(r => r.GetByUsuarioAsync(userId)).ReturnsAsync(misRelaciones);

            var result = await _eventoService.GetEventosDisponiblesAsync(userId);

            Assert.Equal(2, result.Count);
            Assert.DoesNotContain(result, e => e.Id == 1);
            Assert.Contains(result, e => e.Id == 2);
            Assert.Contains(result, e => e.Id == 3);
        }

        [Fact]
        public async Task UnirseAEventoAsync_ShouldCreateRelation_WhenNotAlreadyRegistered()
        {
            int eventoId = 10, userId = 5;
            _eventoUsuarioRepoMock.Setup(r => r.GetAsync(eventoId, userId)).ReturnsAsync((EventoUsuario?)null);
            _eventoUsuarioRepoMock.Setup(r => r.CreateAsync(It.IsAny<EventoUsuario>()))
                .ReturnsAsync(new EventoUsuario { IdEvento = eventoId, IdUsuario = userId, Rol = "Participante" });

            var result = await _eventoService.UnirseAEventoAsync(eventoId, userId);

            Assert.True(result);
            _eventoUsuarioRepoMock.Verify(r => r.CreateAsync(It.Is<EventoUsuario>(
                eu => eu.IdEvento == eventoId && eu.IdUsuario == userId && eu.Rol == "Participante"
            )), Times.Once);
        }

        [Fact]
        public async Task UnirseAEventoAsync_ShouldThrow_WhenAlreadyRegistered()
        {
            int eventoId = 10, userId = 5;
            _eventoUsuarioRepoMock.Setup(r => r.GetAsync(eventoId, userId))
                .ReturnsAsync(new EventoUsuario { IdEvento = eventoId, IdUsuario = userId, Rol = "Participante" });

            var ex = await Assert.ThrowsAsync<Exception>(
                () => _eventoService.UnirseAEventoAsync(eventoId, userId));
            Assert.Contains("Ya estás inscrito", ex.InnerException?.Message);
        }

        [Fact]
        public async Task AbandonarEventoAsync_ShouldCallDelete()
        {
            int eventoId = 10, userId = 5;
            _eventoUsuarioRepoMock.Setup(r => r.DeleteAsync(eventoId, userId)).ReturnsAsync(true);

            var result = await _eventoService.AbandonarEventoAsync(eventoId, userId);

            Assert.True(result);
            _eventoUsuarioRepoMock.Verify(r => r.DeleteAsync(eventoId, userId), Times.Once);
        }
    }
}
