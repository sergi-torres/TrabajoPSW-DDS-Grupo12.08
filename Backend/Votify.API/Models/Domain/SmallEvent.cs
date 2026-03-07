using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Votify.API.Models.Domain
{
    
    public class SmallEvent : Event
    {
        public SmallEvent()
        {
            TipoEvento = "Evento Pequeño";
        }
    }
}