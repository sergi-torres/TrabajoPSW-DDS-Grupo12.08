using Postgrest.Models;

namespace Votify.API.Models.Domain
{
    // Todos los modelos que vayan a ser mapeados a Supabase DB con este SDK
    // deben heredar de la clase base BaseModel de Postgrest
    public abstract class BaseModel : Postgrest.Models.BaseModel
    {
    }
}
