using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Votify.API.Models.Domain
{
  
    public class InnovationFairEvent : Event
    {
        public InnovationFairEvent()
        {
            TipoEvento = "Feria de Innovación";
        }
    }
}