namespace Votify.API.Adapters.Gemini
{
    public interface IGeminiClient
    {
        // Devuelve JSON conforme al schema de síntesis (fortalezas, mejoras, sentimiento, resumen_general).
        Task<string> GenerarJsonAsync(string prompt, CancellationToken ct = default);

        // Expone el modelo activo para guardarlo en SintesisComentarios.ModeloUsado.
        string ModelName { get; }
    }
}
