using Supabase.Postgrest.Attributes;
using System;

namespace Votify.API.Models.Domain
{
    [Table("invitaciones_pendientes")]
    public class InvitacionPendiente : BaseModel
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Column("idevento")]
        public int IdEvento { get; set; }

        [Column("token")]
        public string Token { get; set; } = string.Empty;

        [Column("fecha_creacion")]
        public DateTime FechaCreacion { get; set; }
    }
}