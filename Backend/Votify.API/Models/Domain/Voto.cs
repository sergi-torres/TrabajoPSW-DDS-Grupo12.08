using Postgrest.Attributes; // <--- Aquí vive [PrimaryKey] y [Column]


namespace Votify.API.Models.Domain
{
    [Table("Voto")]
    public class Voto : BaseModel
    {
        [PrimaryKey("id", false)]
        public string Id { get; set; }

        [Column("valor")]
        public float valor { get; set; }

        [Column("comentario")]
        public String comentario { get; set; }

        [Column("urlaudio")]
        public String urlaudio { get; set; }

        [Column("ipdispositivo")]
        public float ipdispositivo { get; set; }

        [Column("fechavoto")]
        public DateTime fechavoto { get; set; }

        [Column("idproyecto")]
        public int idproyecto { get; set; }

        [Column("idevaluador")]
        public int idevaluador { get; set; }

        [Column("idcriterio")]
        public int idcriterio { get; set; }

        [Column("idcategoria")]
        public int idcategoria { get; set; }

        [Column("idProyecto")]
        public int IdProyecto { get; set; }

        [Column("idCriterio")]
        public int IdCriterio { get; set; }

        [Column("comentario")]
        public string Comentario { get; set; }

        public Voto() { }

        public Voto(string id, float valor,
            string comentario, string urlaudio,
            float ipddispositivo, DateTime fechavoto,
            int idproyecto, int idevaluador,
            int idcriterio, int idcategoria)
        {
            Id = id;
            this.valor = valor;
            this.Comentario = comentario;
            this.urlaudio = urlaudio;
            this.ipdispositivo = ipddispositivo;
            this.fechavoto = fechavoto;
            this.idproyecto = idproyecto;
            this.idevaluador = idevaluador;
            this.idcriterio = idcriterio;
            this.idcategoria = idcategoria;
            this.IdProyecto = idproyecto;
        }
    }
}
