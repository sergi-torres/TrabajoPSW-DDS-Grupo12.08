using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Votify.API.Models.Domain
{
    public class SmallEvent : Event
    {
        public SmallEvent() : base()
        {
            TipoEvento = "Evento Pequeño";
        }

        public SmallEvent(int id, string nombre, string descripcion, DateTime fechaInicio,
                          DateTime fechaFin, string estado, int idOrganizador,
                          List<Categoria> categorias, List<Baremo> baremos)
            : base(id, nombre, descripcion, fechaInicio, fechaFin, estado, idOrganizador, categorias, baremos)
        {
            TipoEvento = "Evento Pequeño";
        }
    }
}