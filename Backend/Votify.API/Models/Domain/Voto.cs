using Supabase.Postgrest.Attributes;

namespace Votify.API.Models.Domain
{
    [Table("voto")]
    public abstract class Voto : BaseModel
    {

        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("valor")]
        public float? Valor { get; set; }

        [Column("comentario")]
        public string? Comentario { get; set; }

        [Column("urlaudio")]
        public string? UrlAudio { get; set; }

        [Column("ipdispositivo")]
        public string IpDispositivo { get; set; } = string.Empty;

        [Column("fechavoto")]
        public DateTime FechaVoto { get; set; } = DateTime.UtcNow;

        [Column("idproyecto")]
        public int IdProyecto { get; set; }

        [Column("idevaluador")]
        public int? IdEvaluador { get; set; }

        [Column("idcriterio")]
        public int? IdCriterio { get; set; }

        [Column("idcategoria")]
        public int IdCategoria { get; set; }

        public abstract float CalcularPuntuacionFinal(float peso);


    }
}