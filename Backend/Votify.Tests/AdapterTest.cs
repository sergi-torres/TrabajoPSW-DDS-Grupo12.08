using System;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

using Moq;
using Moq.Protected;

using Votify.API.Adapters.Gemini;

using Xunit;

namespace Votify.Tests.Adapters
{
    public class GeminiClientTests
    {
        private const string FakeApiKey = "fake-api-key";
        private readonly Mock<HttpMessageHandler> _mockHandler;
        private readonly HttpClient _httpClient;

        public GeminiClientTests()
        {
            _mockHandler = new Mock<HttpMessageHandler>();
            _httpClient = new HttpClient(_mockHandler.Object)
            {
                BaseAddress = new Uri("https://generativelanguage.googleapis.com/")
            };
        }

        [Fact]
        public async Task GenerarJsonAsync_CuandoApiKeyNoExiste_LanzaAuthFailure()
        {
            // Arrange
            Environment.SetEnvironmentVariable("GEMINI_API_KEY", null);
            var client = new GeminiClient(_httpClient);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<SintesisGeminiException>(() =>
                client.GenerarJsonAsync("test prompt"));

            Assert.Equal(SintesisGeminiErrorKind.AuthFailure, ex.Kind);
            Assert.Contains("GEMINI_API_KEY no está configurada", ex.Message);
        }

        [Fact]
        public async Task GenerarJsonAsync_CuandoRespuestaExitosa_DevuelveJson()
        {
            // Arrange
            Environment.SetEnvironmentVariable("GEMINI_API_KEY", FakeApiKey);

            var jsonEsperado = @"{
                ""fortalezas"": [""Buena interfaz"", ""Rendimiento óptimo""],
                ""mejoras"": [""Más documentación""],
                ""sentimiento"": ""positivo"",
                ""resumen_general"": ""Excelente proyecto""
            }";

            var response = new GeminiResponse
            {
                Candidates = new List<GeminiCandidate>
                {
                    new GeminiCandidate
                    {
                        Content = new GeminiContent
                        {
                            Parts = new List<GeminiPart>
                            {
                                new GeminiPart { Text = jsonEsperado }
                            }
                        }
                    }
                }
            };

            var responseJson = JsonSerializer.Serialize(response);

            _mockHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(responseJson, Encoding.UTF8, "application/json")
                });

            var client = new GeminiClient(_httpClient);

            // Act
            var resultado = await client.GenerarJsonAsync("Analiza este proyecto");

            // Assert
            Assert.NotNull(resultado);
            Assert.Contains("fortalezas", resultado);
            Assert.Contains("mejoras", resultado);
        }

        [Fact]
        public async Task GenerarJsonAsync_CuandoRateLimit_LanzaRateLimit()
        {
            // Arrange
            Environment.SetEnvironmentVariable("GEMINI_API_KEY", FakeApiKey);

            _mockHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = (HttpStatusCode)429, // Too Many Requests
                    Content = new StringContent("{\"error\": \"Rate limit exceeded\"}")
                });

            var client = new GeminiClient(_httpClient);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<SintesisGeminiException>(() =>
                client.GenerarJsonAsync("test"));

            Assert.Equal(SintesisGeminiErrorKind.RateLimit, ex.Kind);
        }

        [Fact]
        public async Task GenerarJsonAsync_CuandoTimeout_LanzaTimeout()
        {
            // Arrange
            Environment.SetEnvironmentVariable("GEMINI_API_KEY", FakeApiKey);

            _mockHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ThrowsAsync(new TaskCanceledException());

            var client = new GeminiClient(_httpClient);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<SintesisGeminiException>(() =>
                client.GenerarJsonAsync("test"));

            Assert.Equal(SintesisGeminiErrorKind.Timeout, ex.Kind);
        }

        [Fact]
        public async Task GenerarJsonAsync_CuandoRespuestaVacia_LanzaMalformedJson()
        {
            // Arrange
            Environment.SetEnvironmentVariable("GEMINI_API_KEY", FakeApiKey);

            var response = new GeminiResponse { Candidates = new List<GeminiCandidate>() };

            var responseJson = JsonSerializer.Serialize(response);

            _mockHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(responseJson, Encoding.UTF8, "application/json")
                });

            var client = new GeminiClient(_httpClient);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<SintesisGeminiException>(() =>
                client.GenerarJsonAsync("test"));

            Assert.Equal(SintesisGeminiErrorKind.MalformedJson, ex.Kind);
            Assert.Contains("Respuesta vacía", ex.Message);
        }

        [Fact]
        public async Task GenerarJsonAsync_CuandoJsonMalformado_LanzaMalformedJson()
        {
            // Arrange
            Environment.SetEnvironmentVariable("GEMINI_API_KEY", FakeApiKey);

            _mockHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent("{ json malformado }", Encoding.UTF8, "application/json")
                });

            var client = new GeminiClient(_httpClient);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<SintesisGeminiException>(() =>
                client.GenerarJsonAsync("test"));

            Assert.Equal(SintesisGeminiErrorKind.MalformedJson, ex.Kind);
        }
    }
}