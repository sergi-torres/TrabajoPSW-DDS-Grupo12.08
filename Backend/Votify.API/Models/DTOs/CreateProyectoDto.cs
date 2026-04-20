using System;
using System.Collections.Generic;

namespace Votify.API.Models.DTOs
{
    public class CreateProyectoDto
    {

        public string? Nombre { get; set; }

        public string? Descripcion { get; set; }

        public string? UrlMultimedia { get; set; }

        public int? IdEvento { get; set; }

        public int IdParticipante { get; set; }

        public int? IdCategoria { get; set; }

        public string Estado { get; set; } = "disponible";
    }
}
