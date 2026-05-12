using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System.Collections.Generic;
using System;

namespace Votify.API.Models.Domain
{
    [Table("premio")]
    public class Premio : BaseModel
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [Column("descripcion")]
        public string? Descripcion { get; set; } = string.Empty;

        [Column("idcategoria")]
        public int IdCategoria { get; set; }

        [Column("posicion")]
        public int Posicion { get; set; } = 1;

        // Constructor sin parámetros (necesario para Supabase/deserialización)
        public Premio() { }

        // Constructor con parámetros (usado por las Factories)
        public Premio(int id, string nombre, int idCategoria, string descripcion, int posicion)
        {
            Id = id;
            Nombre = nombre;
            Descripcion = descripcion;
            IdCategoria = idCategoria;
            Posicion = posicion;
        }
    }
}