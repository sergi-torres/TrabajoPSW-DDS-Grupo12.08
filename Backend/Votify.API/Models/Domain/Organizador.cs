using Postgrest.Attributes;

namespace Votify.API.Models.Domain
{
    public class Organizador : Usuario
    {
        public Organizador()
        {
            Rol = "Organizador";
        }
    }
}
