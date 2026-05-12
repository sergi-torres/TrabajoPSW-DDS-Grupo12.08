namespace Votify.API.Adapters.Gemini
{
    public interface IGeminiClient
    {
        // Devuelve una cadena JSON conforme al schema de síntesis (fortalezas, mejoras, sentimiento, resumen_general).
        Task<string> GenerarJsonAsync(string prompt, CancellationToken ct = default);

        // Modelo configurado (para auditoría: SintesisComentarios.ModeloUsado).
        string ModelName { get; }
    }

    public class SintesisGeminiException : Exception
    {
        public SintesisGeminiErrorKind Kind { get; }

        public SintesisGeminiException(SintesisGeminiErrorKind kind, string message, Exception? inner = null)
            : base(message, inner)
        {
            Kind = kind;
        }
    }

    public enum SintesisGeminiErrorKind
    {
        Timeout,
        RateLimit,
        SafetyBlocked,
        AuthFailure,
        MalformedJson,
        Network,
        Unknown
    }
}
