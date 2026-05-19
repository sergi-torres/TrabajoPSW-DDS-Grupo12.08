using Moq;
using Votify.API.Adapters.Gemini;
using Votify.API.Models.Domain;
using Votify.API.Repositories;
using Votify.API.Services.Strategies.Sintesis;
using Xunit;
using System.Text.Json;

namespace Votify.Tests
{
    public class SintesisStrategyTests
    {
        private readonly Mock<IGeminiClient> _geminiMock = new();
        private readonly Mock<IVotoRepository> _votoRepoMock = new();
        private readonly SintesisJuradoStrategy _strategy;

        public SintesisStrategyTests()
        {
            _strategy = new SintesisJuradoStrategy(_geminiMock.Object, _votoRepoMock.Object);
        }

        [Fact]
        public async Task Parsear_ReturnsCorrectResult()
        {
            // Parsear is protected, but we can test it indirectly or via reflection if needed.
            // However, GenerarAsync calls it.
            
            // For brevity, let's test a sample JSON response parsing.
            var json = JsonSerializer.Serialize(new
            {
                fortalezas = new[] { "F1", "F2" },
                mejoras = new[] { "M1" },
                sentimiento = "positivo",
                resumen_general = "Todo bien."
            });

            // We use a "Testable" version of the strategy or just call the strategy with mocked dependencies.
            // Since CargarComentariosAsync is protected, we can't easily mock it without a subclass.
            
            var testable = new TestableSintesisJuradoStrategy(_geminiMock.Object, _votoRepoMock.Object);
            testable.ComentariosToReturn = new List<string> { "C1", "C2" };
            
            _geminiMock.Setup(g => g.GenerarJsonAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(json);

            // Act
            var result = await testable.GenerarAsync(1, 1);

            // Assert
            Assert.Equal(2, result.Fortalezas.Count);
            Assert.Equal("F1", result.Fortalezas[0]);
            Assert.Equal("positivo", result.Sentimiento);
            Assert.Equal("Todo bien.", result.ResumenGeneral);
            _geminiMock.Verify(g => g.GenerarJsonAsync(It.Is<string>(p => p.Contains("feedback de jurado")), It.IsAny<CancellationToken>()));
        }

        private class TestableSintesisJuradoStrategy : SintesisJuradoStrategy
        {
            public List<string> ComentariosToReturn { get; set; } = new();
            public TestableSintesisJuradoStrategy(IGeminiClient gemini, IVotoRepository votoRepo) 
                : base(gemini, votoRepo) { }

            protected override Task<List<string>> CargarComentariosAsync(int idP, int idC, CancellationToken ct)
                => Task.FromResult(ComentariosToReturn);
        }
    }
}
