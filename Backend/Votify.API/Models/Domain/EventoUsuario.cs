using Supabase.Postgrest.Attributes;

namespace Votify.API.Models.Domain
{
    // Tabla relación entre Evento y Usuario — define el rol del usuario en cada evento
    [Table("evento_usuario")]
    public class EventoUsuario : BaseModel
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("idevento")]
        public int IdEvento { get; set; }

        [Column("idusuario")]
        public int IdUsuario { get; set; }

        [Column("rol")]
        public string Rol { get; set; } = "Publico";
    }
}