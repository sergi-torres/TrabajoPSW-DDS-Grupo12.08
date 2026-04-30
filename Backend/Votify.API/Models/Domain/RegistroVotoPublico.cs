using Supabase.Postgrest.Attributes;
using System;

namespace Votify.API.Models.Domain
{
    [Table("registro_votos_publicos")]
    public class RegistroVotoPublico : BaseModel
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("idevento")]
        public int? IdEvento { get; set; }

        [Column("identificador_hash")]
        public string IdentificadorHash { get; set; } = string.Empty;

        [Column("idcategoria")]
        public int? IdCategoria { get; set; }

        [Column("idproyecto")]
        public int? IdProyecto { get; set; }

        [Column("fecha_registro")]
        public DateTime? FechaRegistro { get; set; }
    }
}
