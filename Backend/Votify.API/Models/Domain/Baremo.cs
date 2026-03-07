using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Votify.API.Models.Domain
{
    [Table("baremo")]
    public class Baremo : BaseModel
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("idevento")]
        public int IdEvento { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [Reference(typeof(Criterio))]
        public List<Criterio> Criterios { get; set; } = new List<Criterio>();
    }
}
