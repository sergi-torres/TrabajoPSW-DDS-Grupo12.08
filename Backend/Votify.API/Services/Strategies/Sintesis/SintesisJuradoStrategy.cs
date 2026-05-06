using Votify.API.Adapters.Gemini;
using Votify.API.Models.Domain;
using Votify.API.Repositories;

namespace Votify.API.Services.Strategies.Sintesis
{
    public class SintesisJuradoStrategy : SintesisStrategyBase
    {
        public SintesisJuradoStrategy(IGeminiClient gemini, IVotoRepository votoRepo)
            : base(gemini, votoRepo) { }

        public override TipoSintesis Tipo => TipoSintesis.Jurado;

        protected override Task<List<string>> CargarComentariosAsync(int idP, int idC, CancellationToken ct)
            => CargarComentariosVotoAsync(idP, idC, soloJurado: true, ct);

        protected override string ConstruirPrompt(List<string> comentarios)
        {
            var lista = FormatComentariosNumerados(comentarios);
            return $@"Eres un asistente que sintetiza feedback de jurado de eventos competitivos.
Te paso {comentarios.Count} comentarios del jurado sobre un proyecto. Genera un análisis estructurado en JSON con:
- fortalezas: array de 2 a 5 puntos clave (string ≤ 120 chars).
- mejoras: array de 2 a 5 áreas (string ≤ 120 chars).
- sentimiento: ""positivo"" | ""mixto"" | ""negativo"".
- resumen_general: 1-2 frases neutrales en español.

Reglas:
- No menciones nombres de jurados.
- Idioma: español.
- No inventes información que no esté en los comentarios.
- Si los comentarios son contradictorios, refleja ""mixto"".
- Tono orientado a feedback técnico y crítica constructiva.

Comentarios:
{lista}
Devuelve SOLO el JSON.";
        }
    }
}
