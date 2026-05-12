namespace Votify.API.Models.DTOs
{
    public class PremioResponseDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public int IdCategoria { get; set; }
        public int Posicion { get; set; } = 1;
        public string? Icono { get; set; }
    }

    public class CrearPremioRequestDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public int IdCategoria { get; set; }
        public int Posicion { get; set; } = 1;
        public string? Icono { get; set; }
    }

    public class ActualizarPremioRequestDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public int IdCategoria { get; set; }
        public int Posicion { get; set; } = 1;
        public string? Icono { get; set; }
    }
}