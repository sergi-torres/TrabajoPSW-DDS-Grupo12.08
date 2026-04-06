using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Votify.API.Models.Domain
{
    [Table("usuario")]
    public class Usuario : BaseModel
    {
        [PrimaryKey("id", false)] // Con false se autogenera el id
        public int Id { get; set; }

        [Column("nombrecompleto")]
        public string NombreCompleto { get; set; } = string.Empty;

        [Column("nombreusuario")]
        public string NombreUsuario { get; set; } = string.Empty;

        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Column("password")]
        public string Password { get; set; } = string.Empty;

        [Column("fecharegistro")]
        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
    }
}