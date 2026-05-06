using Votify.API.Models.Domain;

namespace Votify.API.Models.DTOs
{
    public class SintesisDto
    {
        public long Id { get; set; }
        public long IdProyecto { get; set; }
        public long IdCategoria { get; set; }
        public string Tipo { get; set; } = "";
        public List<string> Fortalezas { get; set; } = new();
        public List<string> Mejoras { get; set; } = new();
        public string Sentimiento { get; set; } = "";
        public string? ResumenGeneral { get; set; }
        public int ComentariosCount { get; set; }
        public string ModeloUsado { get; set; } = "";
        public DateTime FechaGeneracion { get; set; }
    }

    public class SintesisProyectoDto
    {
        public SintesisDto? Jurado { get; set; }
        public SintesisDto? Publico { get; set; }
    }

    public class GenerarSintesisRequest
    {
        // "jurado" | "publico"
        public string Tipo { get; set; } = "jurado";
    }

    // Resultado intermedio que devuelven las strategies
    public class SintesisResult
    {
        public List<string> Fortalezas { get; set; } = new();
        public List<string> Mejoras { get; set; } = new();
        public string Sentimiento { get; set; } = "mixto";
        public string? ResumenGeneral { get; set; }
        public int ComentariosCount { get; set; }
        public string ModeloUsado { get; set; } = "";
        public TipoSintesis Tipo { get; set; }
    }
}
