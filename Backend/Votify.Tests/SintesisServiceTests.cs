using Moq;
using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Repositories;
using Votify.API.Services;
using Votify.API.Services.Strategies.Sintesis;
using Xunit;

namespace Votify.Tests
{
    public class SintesisServiceTests
    {
        private readonly Mock<ICategoriaRepository> _categoriaRepoMock = new();
        private readonly Mock<IProyectoRepository> _proyectoRepoMock = new();
        private readonly Mock<IUsuarioRepository> _usuarioRepoMock = new();
        private readonly Mock<ISintesisRepository> _sintesisRepoMock = new();
        private readonly Mock<IVotoRepository> _votoRepoMock = new();
        private readonly Mock<ISintesisStrategyFactory> _factoryMock = new();
        private readonly SintesisComentariosService _service;

        public SintesisServiceTests()
        {
            _service = new SintesisComentariosService(
                _categoriaRepoMock.Object,
                _proyectoRepoMock.Object,
                _usuarioRepoMock.Object,
                _sintesisRepoMock.Object,
                _votoRepoMock.Object,
                _factoryMock.Object
            );
        }

        [Fact]
        public async Task GenerarAsync_ThrowsException_IfCategoriaNoFinalizada()
        {
            int idCat = 1;
            _categoriaRepoMock.Setup(r => r.ObtenerPorIdAsync(idCat))
                .ReturnsAsync(new Categoria { Id = idCat, Estado = "Activa" });

            var ex = await Assert.ThrowsAsync<CategoriaNoFinalizadaException>(() =>
                _service.GenerarAsync(1, idCat, TipoSintesis.Jurado, "test@test.com", null));

            Assert.Contains("finalizada", ex.Message);
        }

        [Fact]
        public async Task GenerarAsync_ThrowsException_IfNoEsPropietario()
        {
            int idCat = 1;
            int idProy = 10;
            _categoriaRepoMock.Setup(r => r.ObtenerPorIdAsync(idCat))
                .ReturnsAsync(new Categoria { Id = idCat, Estado = "Finalizada" });

            // IdParticipante = 99, pero el usuario autenticado tiene Id = 1
            _proyectoRepoMock.Setup(r => r.ObtenerPorIdAsync(idProy))
                .ReturnsAsync(new Proyecto { Id = idProy, IdCategoria = idCat, IdParticipante = 99 });

            _usuarioRepoMock.Setup(r => r.GetByEmailAsync("hacker@test.com"))
                .ReturnsAsync(new Usuario { Id = 1, Email = "hacker@test.com" });

            await Assert.ThrowsAsync<OwnershipDeniedException>(() =>
                _service.GenerarAsync(idProy, idCat, TipoSintesis.Jurado, "hacker@test.com", null));
        }

        [Fact]
        public async Task GenerarAsync_CallsStrategyAndPersists_IfValid()
        {
            int idCat = 1;
            int idProy = 10;
            int idUser = 1;
            string email = "owner@test.com";

            _categoriaRepoMock.Setup(r => r.ObtenerPorIdAsync(idCat))
                .ReturnsAsync(new Categoria { Id = idCat, Estado = "Finalizada" });

            _proyectoRepoMock.Setup(r => r.ObtenerPorIdAsync(idProy))
                .ReturnsAsync(new Proyecto { Id = idProy, IdCategoria = idCat, IdParticipante = idUser });

            _usuarioRepoMock.Setup(r => r.GetByEmailAsync(email))
                .ReturnsAsync(new Usuario { Id = idUser, Email = email });

            var strategyMock = new Mock<ISintesisStrategy>();
            strategyMock.Setup(s => s.GenerarAsync(idProy, idCat, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new SintesisResult
                {
                    Fortalezas = new List<string> { "F1" },
                    Mejoras = new List<string> { "M1" },
                    Sentimiento = "positivo",
                    ComentariosCount = 5
                });

            _factoryMock.Setup(f => f.Crear(TipoSintesis.Jurado)).Returns(strategyMock.Object);

            _sintesisRepoMock.Setup(r => r.UpsertAsync(It.IsAny<SintesisComentarios>()))
                .ReturnsAsync((SintesisComentarios s) => { s.Id = 123; return s; });

            var result = await _service.GenerarAsync(idProy, idCat, TipoSintesis.Jurado, email, null);

            Assert.NotNull(result);
            Assert.Equal(123, result.Id);
            Assert.Equal("jurado", result.Tipo);
            Assert.Single(result.Fortalezas);
            _sintesisRepoMock.Verify(r => r.UpsertAsync(It.Is<SintesisComentarios>(s => s.IdProyecto == idProy)), Times.Once);
        }

        [Fact]
        public async Task GenerarAsync_AllowsAccess_IfOrganizador()
        {
            int idCat = 1;
            int idProy = 10;
            int idEvento = 5;
            // idUser != IdParticipante del proyecto — solo puede acceder por ser Organizador
            int idUser = 2;
            string email = "organizador@test.com";

            _categoriaRepoMock.Setup(r => r.ObtenerPorIdAsync(idCat))
                .ReturnsAsync(new Categoria { Id = idCat, Estado = "Finalizada" });

            _proyectoRepoMock.Setup(r => r.ObtenerPorIdAsync(idProy))
                .ReturnsAsync(new Proyecto { Id = idProy, IdCategoria = idCat, IdParticipante = 1, IdEvento = idEvento });

            _usuarioRepoMock.Setup(r => r.GetByEmailAsync(email))
                .ReturnsAsync(new Usuario { Id = idUser, Email = email });

            _votoRepoMock.Setup(r => r.ObtenerRolUsuarioEnEventoAsync(idUser, idEvento))
                .ReturnsAsync("Organizador");

            var strategyMock = new Mock<ISintesisStrategy>();
            strategyMock.Setup(s => s.GenerarAsync(idProy, idCat, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new SintesisResult
                {
                    Fortalezas = new List<string> { "F1" },
                    Mejoras = new List<string> { "M1" },
                    Sentimiento = "positivo",
                    ComentariosCount = 5
                });

            _factoryMock.Setup(f => f.Crear(TipoSintesis.Jurado)).Returns(strategyMock.Object);

            _sintesisRepoMock.Setup(r => r.UpsertAsync(It.IsAny<SintesisComentarios>()))
                .ReturnsAsync((SintesisComentarios s) => { s.Id = 124; return s; });

            var result = await _service.GenerarAsync(idProy, idCat, TipoSintesis.Jurado, email, null);

            Assert.NotNull(result);
            Assert.Equal(124, result.Id);
            _votoRepoMock.Verify(r => r.ObtenerRolUsuarioEnEventoAsync(idUser, idEvento), Times.Once);
        }
    }
}
