using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Votify.API.Models.Domain
{
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
        public float ipddispositivo { get; set; }

        [Column("fechavoto")]
        public  DateTime fechavoto { get; set; }

        [Column("idproyecto")]
        public int idproyecto { get; set; }

        [Column("idevaluador")]
        public int idevaluador { get; set; }

        [Column("idcriterio")]
        public int idcriterio { get; set; }

        [Column("idcategoria")]
        public int idcategoria { get; set; }

        public Voto() { }

        public Voto (string id, float valor,
            string comentario, string urlaudio,
            float ipddispositivo, DateTime fechavoto,
            int idproyecto, int idevaluador,
            int idcriterio, int idcategoria)
        {
            Id = id;
            this.valor = valor;
            this.comentario = comentario;
            this.urlaudio = urlaudio;
            this.ipddispositivo = ipddispositivo;
            this.fechavoto = fechavoto;
            this.idproyecto = idproyecto;
            this.idevaluador = idevaluador;
            this.idcriterio = idcriterio;
            this.idcategoria = idcategoria;
        }
    }
}
