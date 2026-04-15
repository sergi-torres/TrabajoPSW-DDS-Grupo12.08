using System;
using System.Collections.Generic;

using Votify.API.Models.DTOs;
namespace Votify.API.Models.DTOs
{

    public class CategoriaResponseDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public int IdEvento { get; set; }
    }

}
