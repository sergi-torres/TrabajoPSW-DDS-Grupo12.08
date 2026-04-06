using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Votify.API.Models.Domain
{
    [Table("peso_categoria_rol")]
    public class PesoCategoriaRol : BaseModel
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("idcategoria")]
        public int IdCategoria { get; set; }

        [Column("rol_votante")]
        public string RolVotante { get; set; } = string.Empty;

        [Column("peso")]
        public float Peso { get; set; }
    }
}