using System.Text.Json;
using Supabase.Postgrest.Attributes;

namespace Votify.API.Models.Domain
{
    public enum TipoSintesis { Jurado, Publico }

    [Table("sintesis_comentarios")]
    public class SintesisComentarios : BaseModel
    {
        [PrimaryKey("id", false)]
        public long Id { get; set; }

        [Column("id_proyecto")]
        public long IdProyecto { get; set; }

        [Column("id_categoria")]
        public long IdCategoria { get; set; }

        [Column("tipo")]
        public string Tipo { get; set; } = "jurado";

        // jsonb columns persisted as raw JSON strings (Postgrest sends string straight to jsonb)
        [Column("fortalezas")]
        public string FortalezasJson { get; set; } = "[]";

        [Column("mejoras")]
        public string MejorasJson { get; set; } = "[]";

        [Column("sentimiento")]
        public string Sentimiento { get; set; } = "mixto";

        [Column("resumen_general")]
        public string? ResumenGeneral { get; set; }

        [Column("comentarios_count")]
        public int ComentariosCount { get; set; }

        [Column("modelo_usado")]
        public string ModeloUsado { get; set; } = "";

        [Column("fecha_generacion")]
        public DateTime FechaGeneracion { get; set; } = DateTime.UtcNow;

        [Column("generado_por_uid")]
        public Guid? GeneradoPorUid { get; set; }

        // Helpers que NO se mapean a la BD
        public List<string> GetFortalezas()
            => DeserializeList(FortalezasJson);

        public void SetFortalezas(List<string> v)
            => FortalezasJson = JsonSerializer.Serialize(v ?? new List<string>());

        public List<string> GetMejoras()
            => DeserializeList(MejorasJson);

        public void SetMejoras(List<string> v)
            => MejorasJson = JsonSerializer.Serialize(v ?? new List<string>());

        private static List<string> DeserializeList(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return new List<string>();
            try
            {
                return JsonSerializer.Deserialize<List<string>>(raw) ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }

        public static string TipoToString(TipoSintesis t) => t switch
        {
            TipoSintesis.Jurado => "jurado",
            TipoSintesis.Publico => "publico",
            _ => "jurado"
        };

        public static TipoSintesis? ParseTipo(string? raw) => raw?.ToLowerInvariant() switch
        {
            "jurado" => TipoSintesis.Jurado,
            "publico" => TipoSintesis.Publico,
            _ => null
        };
    }
}
