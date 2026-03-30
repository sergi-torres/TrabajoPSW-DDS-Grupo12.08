using Supabase.Postgrest.Attributes;

namespace Votify.API.Models.Domain
{
    public class Jurado : Usuario
    {
        public Jurado()
        {
            Rol = "Jurado";
        }
    }
}
