using Votify.API.Adapters.Gemini;
using Votify.API.Models.Domain;
using Votify.API.Repositories;

namespace Votify.API.Services.Strategies.Sintesis
{
    public class SintesisPublicoStrategy : SintesisStrategyBase
    {
        public SintesisPublicoStrategy(IGeminiClient gemini, IVotoRepository votoRepo)
            : base(gemini, votoRepo) { }

        public override TipoSintesis Tipo => TipoSintesis.Publico;

        protected override Task<List<string>> CargarComentariosAsync(int idP, int idC, CancellationToken ct)
            => CargarComentariosVotoAsync(idP, idC, soloJurado: false, ct);

        protected override string ConstruirPrompt(List<string> comentarios)
        {
            var lista = FormatComentariosNumerados(comentarios);
            return $@"Eres un asistente que sintetiza la recepción del público en eventos competitivos.
Te paso {comentarios.Count} comentarios del público sobre un proyecto. Genera un análisis estructurado en JSON con:
- fortalezas: array de 2 a 5 puntos clave (string ≤ 120 chars).
- mejoras: array de 2 a 5 áreas (string ≤ 120 chars).
- sentimiento: ""positivo"" | ""mixto"" | ""negativo"".
- resumen_general: 1-2 frases neutrales en español.

Reglas:
- No menciones nombres ni datos personales.
- Idioma: español.
- No inventes información que no esté en los comentarios.
- Tono orientado a impresión general y recepción del público (no crítica técnica).
- Si los comentarios son contradictorios, refleja ""mixto"".

Comentarios:
{lista}
Devuelve SOLO el JSON.";
        }
    }
}
