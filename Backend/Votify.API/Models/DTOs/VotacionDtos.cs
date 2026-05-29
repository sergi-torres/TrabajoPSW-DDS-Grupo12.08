using System.ComponentModel.DataAnnotations;

namespace Votify.API.Models.DTOs
{
    // Lo que enviamos al Front para pintar el Dashboard
    public class DashboardResponseDto
    {
        public int VotosGlobalesRealizados { get; set; }
        public int VotosGlobalesMaximos { get; set; }
        public int ProyectosActivos { get; set; }
        public string TiempoRestante { get; set; } = "00:00";
        public bool ComentariosObligatorios { get; set; } = false;
        public List<CategoriaResumenDto> Categorias { get; set; } = new();
    }

    public class CategoriaResumenDto
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public int VotosRestantes { get; set; }
        public string Estado { get; set; } = "pendiente"; // "pendiente" o "completado"
        public List<ProyectosResponseDto> Proyectos { get; set; } = new();
    }

    // Lo que recibimos cuando el usuario vota
    public class VotoRequestDto
    {
        [Required]
        public int EventoId { get; set; }

        [Required]
        public int CategoriaId { get; set; }

        [Required]
        public int ProyectoId { get; set; }

        public int? IdCriterio { get; set; }

        public float Valor { get; set; } = 1.0f;

        [MaxLength(200)]
        public string? Comentario { get; set; }

        // null → voto público anónimo; valor → evaluador autenticado (Jurado/Participante)
        public int? IdUsuario { get; set; }

        public string? SessionId { get; set; }

        // FingerprintJS hash; garantiza unicidad de voto público por dispositivo
        public string? IdentificadorHash { get; set; }
    }

    public class ProyectosResponseDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string Estado { get; set; } = "disponible"; // "disponible" o "votado"
    }

    public class ConfigTiemposCategoriasDto //sirve como request como responses
    {

        public int? EventoId { get; set; }

        public int CategoriaId { get; set; }

        public required string Nombre { get; set; }

        public DateTime? FechaIni { get; set; }

        public DateTime? FechaFin { get; set; }

        public string? Estado { get; set; }
    }


    public class VotoResponseDto
    {
        public int Id { get; set; }
        public int ProyectoId { get; set; }
        public int CategoriaId { get; set; }
        public string? Comentario { get; set; }
        public DateTime Fecha { get; set; }
    }

    // Batch request for Jurado: all criteria evaluations for one project in one request
    public class VotoBatchRequestDto
    {
        [Required]
        public int EventoId { get; set; }

        [Required]
        public int CategoriaId { get; set; }

        [Required]
        public int ProyectoId { get; set; }

        // null → voto público anónimo; valor → evaluador autenticado (Jurado/Participante)
        public int? IdUsuario { get; set; }

        public string? SessionId { get; set; }

        [MaxLength(500)]
        public string? ComentarioGlobal { get; set; }

        [Required]
        public List<EvaluacionCriterioDto> Evaluaciones { get; set; } = new();
    }

    public class EvaluacionCriterioDto
    {
        [Required]
        public int CriterioId { get; set; }

        public float Valor { get; set; } = 1.0f;

        [MaxLength(200)]
        public string? Comentario { get; set; }
    }

    public class ActualizarEstadoRequestDto
    {
        [Required]
        public string NuevoEstado { get; set; } = string.Empty;
    }

    public class ActualizarLimiteVotosRequestDto
    {
        [Required]
        public int VotosMaximos { get; set; }

        public int? CategoriaId { get; set; }
    }
}