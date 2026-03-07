using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System.Collections.Generic;
using System;

namespace Votify.API.Models.Domain
{
    [Table("event")]
    public class Event : BaseModel
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

        [Reference(typeof(Categoria))]
        public List<Categoria> Categorias { get; set; } = new List<Categoria>();

        [Reference(typeof(Baremo))]
        public List<Baremo> Baremos { get; set; } = new List<Baremo>();

        [Column("tipo_evento")]
        public string TipoEvento { get; set; } = string.Empty;
    }
}