using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Votify.API.Models.Domain
{
   
    public class HackatonEvent : Event
    {
        public HackatonEvent()
        {
            TipoEvento = "Hackaton";
        }
    }
}