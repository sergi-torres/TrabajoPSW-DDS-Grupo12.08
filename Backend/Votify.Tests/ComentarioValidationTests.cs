using System;
using Votify.API.Models.Domain.Strategies;
using Xunit;

namespace Votify.Tests
{
    public class ComentarioValidationTests
    {
        [Fact]
        public void ComentarioObligatorioStrategy_DebeLanzarExcepcion_CuandoComentarioEsVacioONulo()
        {
            var strategy = new ComentarioObligatorioStrategy();

            var ex1 = Assert.Throws<ArgumentException>(() => strategy.Validar(""));
            Assert.Equal("El comentario es obligatorio para evaluar en este evento.", ex1.Message);

            var ex2 = Assert.Throws<ArgumentException>(() => strategy.Validar(null));
            Assert.Equal("El comentario es obligatorio para evaluar en este evento.", ex2.Message);

            var ex3 = Assert.Throws<ArgumentException>(() => strategy.Validar("   "));
            Assert.Equal("El comentario es obligatorio para evaluar en este evento.", ex3.Message);
        }

        [Fact]
        public void ComentarioObligatorioStrategy_NoDebeLanzarExcepcion_CuandoComentarioEsValido()
        {
            var strategy = new ComentarioObligatorioStrategy();
            string comentarioValido = "Este es un comentario constructivo para el proyecto.";

            var excepcion = Record.Exception(() => strategy.Validar(comentarioValido));

            Assert.Null(excepcion);
        }

        [Fact]
        public void ComentarioOpcionalStrategy_NoDebeLanzarExcepcion_IndependientementeDelComentario()
        {
            var strategy = new ComentarioOpcionalStrategy();

            var excepcion1 = Record.Exception(() => strategy.Validar(""));
            var excepcion2 = Record.Exception(() => strategy.Validar(null));
            var excepcion3 = Record.Exception(() => strategy.Validar("Un comentario cualquiera"));

            Assert.Null(excepcion1);
            Assert.Null(excepcion2);
            Assert.Null(excepcion3);
        }
    }
}
