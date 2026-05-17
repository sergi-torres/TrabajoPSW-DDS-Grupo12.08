using System.Text.Json.Serialization;

namespace Votify.API.Adapters.Gemini
{
    // Request
    public class GeminiRequest
    {
        [JsonPropertyName("contents")]
        public List<GeminiContent> Contents { get; set; } = new();

        [JsonPropertyName("generationConfig")]
        public GeminiGenerationConfig? GenerationConfig { get; set; }
    }

    public class GeminiContent
    {
        [JsonPropertyName("role")]
        public string Role { get; set; } = "user";

        [JsonPropertyName("parts")]
        public List<GeminiPart> Parts { get; set; } = new();
    }

    public class GeminiPart
    {
        [JsonPropertyName("text")]
        public string Text { get; set; } = "";
    }

    public class GeminiGenerationConfig
    {
        [JsonPropertyName("responseMimeType")]
        public string ResponseMimeType { get; set; } = "application/json";

        [JsonPropertyName("responseSchema")]
        public object? ResponseSchema { get; set; }

        [JsonPropertyName("temperature")]
        public double Temperature { get; set; } = 0.4;
    }

    // Response
    public class GeminiResponse
    {
        [JsonPropertyName("candidates")]
        public List<GeminiCandidate>? Candidates { get; set; }

        [JsonPropertyName("promptFeedback")]
        public GeminiPromptFeedback? PromptFeedback { get; set; }
    }

    public class GeminiCandidate
    {
        [JsonPropertyName("content")]
        public GeminiContent? Content { get; set; }

        [JsonPropertyName("finishReason")]
        public string? FinishReason { get; set; }
    }

    public class GeminiPromptFeedback
    {
        [JsonPropertyName("blockReason")]
        public string? BlockReason { get; set; }
    }

    // Estructura del JSON producido por la síntesis (lo que Gemini devuelve dentro del text part).
    public class SintesisJsonPayload
    {
        [JsonPropertyName("fortalezas")]
        public List<string>? Fortalezas { get; set; }

        [JsonPropertyName("mejoras")]
        public List<string>? Mejoras { get; set; }

        [JsonPropertyName("sentimiento")]
        public string? Sentimiento { get; set; }

        [JsonPropertyName("resumen_general")]
        public string? ResumenGeneral { get; set; }
    }
}
