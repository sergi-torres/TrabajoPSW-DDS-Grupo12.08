using Supabase.Postgrest.Attributes;

namespace Votify.API.Models.Domain
{
    public class Participante : Usuario
    {
        public Participante()
        {
            Rol = "Participante";
        }
    }
}
