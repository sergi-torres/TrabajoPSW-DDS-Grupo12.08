namespace Votify.API.Models.DTOs
{

    public class CategoriaResponseDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public int IdEvento { get; set; }
        public string Estado { get; set; } = "Pendiente";
    }

    public class CategoriaResponseActualizadoDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public int IdEvento { get; set; }
        public DateTime? FechaIni { get; set; }
        public DateTime? FechaFin { get; set; }
        public string Estado { get; set; } = "Pendiente"; // Pendiente,Activa, Finalizada
        public int CantidadProyectos { get; set; }
        public int VotosMaximos { get; set; } = 3;
    }

}
