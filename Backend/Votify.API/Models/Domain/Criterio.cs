using Supabase.Postgrest.Attributes;

namespace Votify.API.Models.Domain
{
    public enum TipoCriterioEnum
    {
    [MapTo("Numerico")]
    Numerico,
    
    [MapTo("Checklist")]
    Checklist,
    
    [MapTo("Rubrica")]
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
        

    }
}