using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Votify.API.Models.Domain
{
    [Table("Voto")] 
    public class Voto : BaseModel
    {
        [PrimaryKey("id", false)]
        public string Id { get; set; } = string.Empty; // Inicializado para evitar null warnings

        [Column("valor")]
        public float valor { get; set; }

        [Column("comentario")]
        public string comentario { get; set; } = string.Empty;

        [Column("urlaudio")]
        public string urlaudio { get; set; } = string.Empty;

        [Column("ipdispositivo")]
        public float ipdispositivo { get; set; }

        [Column("fechavoto")]
        public DateTime fechavoto { get; set; }

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

        // Constructor vacío necesario para Supabase/Postgrest
        public Voto() { }

        public Voto(string id, float valor,
            string comentario, string urlaudio,
            float ipddispositivo, DateTime fechavoto,
            int idproyecto, int idevaluador,
            int idcriterio, int idcategoria)
        {
            Id = id;
            this.valor = valor;
            this.comentario = comentario; // ASIGNACIÓN FALTANTE: Corregido
            this.urlaudio = urlaudio;
            this.ipdispositivo = ipddispositivo;
            this.fechavoto = fechavoto;
            this.idevaluador = idevaluador;
            this.idcriterio = idcriterio;
            this.idcategoria = idcategoria;
            this.IdProyecto = idproyecto;
            this.IdCriterio = idcriterio; // Aseguramos también esta
        }
    }
}