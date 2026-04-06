using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;

namespace Votify.API.Models.Domain
{
    /// <summary>
    /// Modelo ligero de solo lectura para consultas que NO necesitan
    /// cargar las relaciones (Categorias, Baremos).
    /// Evita los problemas de [Reference] al hacer .Get() simples.
    /// </summary>
    [Table("evento")]
    public class EventoLite : BaseModel
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [Column("descripcion")]
        public string Descripcion { get; set; } = string.Empty;

        [Column("fechaini")]
        public DateTime FechaInicio { get; set; }

        [Column("fechafin")]
        public DateTime FechaFin { get; set; }

        [Column("estado")]
        public string Estado { get; set; } = string.Empty;

        [Column("idorganizador")]
        public int IdOrganizador { get; set; }

        [Column("tipo_evento")]
        public string TipoEvento { get; set; } = string.Empty;

        [Column("cod_evento")]
        public int CodEvento { get; set; }
    }
}
