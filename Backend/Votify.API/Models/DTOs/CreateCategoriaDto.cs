namespace Votify.API.Models.DTOs
{
    public class CreateCategoriaDto
    {
        public string Nombre { get; set; } = string.Empty;
        public int IdEvento { get; set; }
        public List<CreatePesoRolDto> Pesos { get; set; } = new();
    }
}