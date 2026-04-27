namespace Votify.API.Models.DTOs
{
    /// <summary>
    /// DTO de respuesta con toda la información del evento para el formulario de edición.
    /// </summary>
    public class EventoDetalleDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public string TipoEvento { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public int CodEvento { get; set; }
        public int IdOrganizador { get; set; }
        public bool ComentariosObligatorios { get; set; }
        public List<BaremoDetalleDto> Baremos { get; set; } = new List<BaremoDetalleDto>();
        public List<CategoriaDetalleDto> Categorias { get; set; } = new List<CategoriaDetalleDto>();
    }

    /// <summary>
    /// Detalle de un baremo con sus criterios.
    /// </summary>
    public class BaremoDetalleDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public List<CriterioDetalleDto> Criterios { get; set; } = new List<CriterioDetalleDto>();
    }

    /// <summary>
    /// Detalle de un criterio individual.
    /// </summary>
    public class CriterioDetalleDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public double Peso { get; set; }
        public string TipoCriterio { get; set; } = string.Empty;
        public bool ComentarioObligatorio { get; set; }
    }

    /// <summary>
    /// Detalle de una categoría con sus pesos por rol.
    /// </summary>
    public class CategoriaDetalleDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public List<PesoRolDetalleDto> Pesos { get; set; } = new List<PesoRolDetalleDto>();
    }

    /// <summary>
    /// Peso asignado a un rol de votante dentro de una categoría.
    /// </summary>
    public class PesoRolDetalleDto
    {
        public string RolVotante { get; set; } = string.Empty;
        public double Peso { get; set; }
    }
}
