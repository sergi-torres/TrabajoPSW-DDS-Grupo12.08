using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Votify.API.Models.Domain
{
    [Table("categoria")]
    public class Categoria : BaseModel
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [Column("idevento")]
        public int IdEvento { get; set; }

        [Reference(typeof(PesoCategoriaRol))]
        public List<PesoCategoriaRol> PesosPorRol { get; set; } = new List<PesoCategoriaRol>();
    }
}