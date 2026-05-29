using System.Text;
using System.Text.Json;
using Votify.API.Adapters.Gemini;
using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Votify.API.Repositories;

namespace Votify.API.Services.Strategies.Sintesis
{
    public abstract class SintesisStrategyBase : ISintesisStrategy
    {
        protected readonly IGeminiClient _gemini;
        protected readonly IVotoRepository _votoRepo;

        // Sanitización del prompt: límites duros conforme spec §9.
        protected const int MaxComentarios = 50;
        protected const int MaxCharsPorComentario = 1000;

        protected SintesisStrategyBase(IGeminiClient gemini, IVotoRepository votoRepo)
        {
            _gemini = gemini;
            _votoRepo = votoRepo;
        }

        public abstract TipoSintesis Tipo { get; }

        // Template Method
        public async Task<SintesisResult> GenerarAsync(int idProyecto, int idCategoria, CancellationToken ct = default)
        {
            var comentarios = await CargarComentariosAsync(idProyecto, idCategoria, ct);
            var saneados = Sanitizar(comentarios);

            if (saneados.Count < 2)
                throw new SintesisInsuficienteException("Se requieren al menos 2 comentarios.");

            var prompt = ConstruirPrompt(saneados);
            var json = await _gemini.GenerarJsonAsync(prompt, ct);
            return Parsear(json, saneados.Count);
        }

        protected abstract Task<List<string>> CargarComentariosAsync(int idP, int idC, CancellationToken ct);
        protected abstract string ConstruirPrompt(List<string> comentarios);

        protected virtual SintesisResult Parsear(string json, int count)
        {
            SintesisJsonPayload? payload;
            try
            {
                payload = JsonSerializer.Deserialize<SintesisJsonPayload>(json);
            }
            catch (Exception ex)
            {
                throw new SintesisGeminiException(SintesisGeminiErrorKind.MalformedJson,
                    "No se pudo parsear el JSON devuelto por Gemini.", ex);
            }

            if (payload == null)
                throw new SintesisGeminiException(SintesisGeminiErrorKind.MalformedJson,
                    "El JSON de Gemini se deserializó como nulo.");

            var sentimiento = (payload.Sentimiento ?? "mixto").ToLowerInvariant();
            if (sentimiento != "positivo" && sentimiento != "mixto" && sentimiento != "negativo")
                sentimiento = "mixto";

            return new SintesisResult
            {
                Fortalezas = (payload.Fortalezas ?? new List<string>())
                    .Where(s => !string.IsNullOrWhiteSpace(s)).Take(5).ToList(),
                Mejoras = (payload.Mejoras ?? new List<string>())
                    .Where(s => !string.IsNullOrWhiteSpace(s)).Take(5).ToList(),
                Sentimiento = sentimiento,
                ResumenGeneral = payload.ResumenGeneral,
                ComentariosCount = count,
                ModeloUsado = _gemini.ModelName,
                Tipo = Tipo
            };
        }

        protected static List<string> Sanitizar(List<string> comentarios)
        {
            return comentarios
                .Where(c => !string.IsNullOrWhiteSpace(c))
                .Select(c => c!.Length > MaxCharsPorComentario
                    ? c.Substring(0, MaxCharsPorComentario)
                    : c)
                .Take(MaxComentarios)
                .ToList();
        }

        protected static string FormatComentariosNumerados(List<string> comentarios)
        {
            var sb = new StringBuilder();
            for (int i = 0; i < comentarios.Count; i++)
            {
                sb.Append(i + 1).Append(". ").AppendLine(comentarios[i]);
            }
            return sb.ToString();
        }

        protected async Task<List<string>> CargarComentariosVotoAsync(
            int idProyecto, int idCategoria, bool soloJurado, CancellationToken ct)
        {
            var votos = await _votoRepo.ObtenerVotosPorProyectoYCategoriaAsync(idProyecto, idCategoria);

            return votos
                .Where(v => soloJurado ? v.IdEvaluador.HasValue : !v.IdEvaluador.HasValue)
                .Where(v => !string.IsNullOrWhiteSpace(v.Comentario))
                .Select(v => v.Comentario!)
                .ToList();
        }
    }
}
