using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Votify.API.Models.DTOs
{
    [Table("voto")]
    public class VotoQuery : BaseModel
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("valor")]
        public float Valor { get; set; }

        [Column("comentario")]
        public string? Comentario { get; set; }

        [Column("urlaudio")]
        public string? UrlAudio { get; set; }

        [Column("ipdispositivo")]
        public string IpDispositivo { get; set; } = string.Empty;

        [Column("fechavoto")]
        public DateTime FechaVoto { get; set; }

        [Column("idproyecto")]
        public int IdProyecto { get; set; }

        [Column("idevaluador")]
        public int? IdEvaluador { get; set; }

        [Column("idcriterio")]
        public int IdCriterio { get; set; }

        [Column("idcategoria")]
        public int IdCategoria { get; set; }
    }
}