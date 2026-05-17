using Microsoft.AspNetCore.Mvc;
using Moq;
using Votify.API.Controllers;
using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Repositories;
using Votify.API.Services;
using Xunit;

namespace Votify.Tests
{
    public class CategoriasControllerTests
    {
        private readonly Mock<ICategoriaRepository> _repoMock = new();
        private readonly Mock<ICategoriaService> _serviceMock = new();
        private readonly CategoriasController _controller;

        public CategoriasControllerTests()
        {
            _controller = new CategoriasController(_repoMock.Object, _serviceMock.Object, null!);
        }

        [Fact]
        public async Task GetById_ReturnsOk_WithMappedEstado()
        {
            // Arrange
            var categoriaId = 1;
            var categoria = new Categoria 
            { 
                Id = categoriaId, 
                Nombre = "Test Cat", 
                IdEvento = 10, 
                Estado = "Finalizada" 
            };
            
            _repoMock.Setup(r => r.ObtenerPorIdAsync(categoriaId))
                .ReturnsAsync(categoria);

            // Act
            var result = await _controller.GetById(categoriaId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var dto = Assert.IsType<CategoriaResponseDto>(okResult.Value);
            Assert.Equal(categoriaId, dto.Id);
            Assert.Equal("Finalizada", dto.Estado);
            Assert.Equal("Test Cat", dto.Nombre);
        }

        [Fact]
        public async Task GetById_ReturnsNotFound_IfCategoriaDoesNotExist()
        {
            // Arrange
            _repoMock.Setup(r => r.ObtenerPorIdAsync(It.IsAny<int>()))
                .ReturnsAsync((Categoria)null!);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }
    }
}
