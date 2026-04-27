using Supabase.Postgrest.Attributes;
using System.Runtime.Serialization;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Votify.API.Models.Domain
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum TipoCriterioEnum
    {
        [EnumMember(Value = "Numerico")]
        Numerico,

        [EnumMember(Value = "Checklist")]
        Checklist,

        [EnumMember(Value = "Rubrica")]
        Rubrica
    }   

    [Table("criterio")]
    public class Criterio : BaseModel
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [Column("peso")]
        public float Peso {get; set;} = 0.0f;

        [Column("tipocriterio")]
        public TipoCriterioEnum TipoCriterio {get; set;}

        [Column("idbaremo")]
        public int IdBaremo {get; set;}

        [Column("comentario_obligatorio")]
        public bool ComentarioObligatorio { get; set; } = false;
        

    }
}