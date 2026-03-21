using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Votify.API.Models.Domain
{
    public class InnovationFairEvent : Event
    {
        public InnovationFairEvent() : base()
        {
            TipoEvento = "Feria de Innovación";
        }

        public InnovationFairEvent(int id, string nombre, string descripcion, DateTime fechaInicio,
                                   DateTime fechaFin, string estado, int idOrganizador,
                                   List<Categoria> categorias, List<Baremo> baremos, int codEvento)
            : base(id, nombre, descripcion, fechaInicio, fechaFin, estado, idOrganizador, categorias, baremos, codEvento)
        {
            TipoEvento = "Feria de Innovación";
        }
    }
}