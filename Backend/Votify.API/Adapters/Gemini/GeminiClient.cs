using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace Votify.API.Adapters.Gemini
{
    public class GeminiClient : IGeminiClient
    {
        private readonly HttpClient _http;
        private readonly string _apiKey;
        public string ModelName { get; }

        // Schema obligatorio que Gemini debe respetar (structured output).
        private static readonly object SintesisSchema = new
        {
            type = "OBJECT",
            properties = new
            {
                fortalezas = new
                {
                    type = "ARRAY",
                    items = new { type = "STRING" }
                },
                mejoras = new
                {
                    type = "ARRAY",
                    items = new { type = "STRING" }
                },
                sentimiento = new
                {
                    type = "STRING",
                    @enum = new[] { "positivo", "mixto", "negativo" }
                },
                resumen_general = new { type = "STRING" }
            },
            required = new[] { "fortalezas", "mejoras", "sentimiento" }
        };

        public GeminiClient(HttpClient http)
        {
            _http = http;
            _apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY") ?? "";
            ModelName = Environment.GetEnvironmentVariable("GEMINI_MODEL") ?? "gemini-2.5-flash";
            _http.Timeout = TimeSpan.FromSeconds(30);
        }

        public async Task<string> GenerarJsonAsync(string prompt, CancellationToken ct = default)
        {
            if (string.IsNullOrEmpty(_apiKey))
                throw new SintesisGeminiException(SintesisGeminiErrorKind.AuthFailure,
                    "GEMINI_API_KEY no está configurada en el entorno.");

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{ModelName}:generateContent?key={_apiKey}";

            var request = new GeminiRequest
            {
                Contents = new List<GeminiContent>
                {
                    new GeminiContent
                    {
                        Role = "user",
                        Parts = new List<GeminiPart> { new GeminiPart { Text = prompt } }
                    }
                },
                GenerationConfig = new GeminiGenerationConfig
                {
                    ResponseMimeType = "application/json",
                    ResponseSchema = SintesisSchema,
                    Temperature = 0.4
                }
            };

            HttpResponseMessage response;
            try
            {
                var body = JsonSerializer.Serialize(request);
                using var content = new StringContent(body, Encoding.UTF8, "application/json");
                response = await _http.PostAsync(url, content, ct);
            }
            catch (TaskCanceledException ex)
            {
                throw new SintesisGeminiException(SintesisGeminiErrorKind.Timeout,
                    "La llamada a Gemini superó el timeout.", ex);
            }
            catch (HttpRequestException ex)
            {
                throw new SintesisGeminiException(SintesisGeminiErrorKind.Network,
                    "Error de red contactando con Gemini.", ex);
            }

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await SafeReadAsync(response);
                SintesisGeminiErrorKind kind;
                if (response.StatusCode == HttpStatusCode.TooManyRequests)
                    kind = SintesisGeminiErrorKind.RateLimit;
                else if (response.StatusCode == HttpStatusCode.Unauthorized || response.StatusCode == HttpStatusCode.Forbidden)
                    kind = SintesisGeminiErrorKind.AuthFailure;
                else if (response.StatusCode == HttpStatusCode.BadRequest &&
                         (errorBody.Contains("API_KEY_INVALID") || errorBody.Contains("API key")))
                    kind = SintesisGeminiErrorKind.AuthFailure;
                else if (response.StatusCode == HttpStatusCode.BadRequest)
                    kind = SintesisGeminiErrorKind.SafetyBlocked;
                else
                    kind = SintesisGeminiErrorKind.Unknown;
                throw new SintesisGeminiException(kind,
                    $"Gemini devolvió {(int)response.StatusCode}: {errorBody}");
            }

            GeminiResponse? parsed;
            try
            {
                parsed = await response.Content.ReadFromJsonAsync<GeminiResponse>(cancellationToken: ct);
            }
            catch (Exception ex)
            {
                throw new SintesisGeminiException(SintesisGeminiErrorKind.MalformedJson,
                    "No se pudo deserializar la respuesta de Gemini.", ex);
            }

            if (parsed?.PromptFeedback?.BlockReason != null)
                throw new SintesisGeminiException(SintesisGeminiErrorKind.SafetyBlocked,
                    $"Prompt bloqueado: {parsed.PromptFeedback.BlockReason}");

            var text = parsed?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;
            if (string.IsNullOrWhiteSpace(text))
                throw new SintesisGeminiException(SintesisGeminiErrorKind.MalformedJson,
                    "Respuesta vacía de Gemini.");

            return text;
        }

        private static async Task<string> SafeReadAsync(HttpResponseMessage r)
        {
            try { return await r.Content.ReadAsStringAsync(); }
            catch { return ""; }
        }
    }
}
