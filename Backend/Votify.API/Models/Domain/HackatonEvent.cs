namespace Votify.API.Models.Domain
{
    public class HackatonEvent : Event
    {
        public HackatonEvent() : base()
        {
            TipoEvento = "Hackaton";
        }

        public HackatonEvent(int id, string nombre, string descripcion, DateTime fechaInicio,
                             DateTime fechaFin, string estado, int idOrganizador,
                             List<Categoria> categorias, List<Baremo> baremos, int codEvento)
            : base(id, nombre, descripcion, fechaInicio, fechaFin, estado, idOrganizador, categorias, baremos, codEvento)
        {
            TipoEvento = "Hackaton";
        }
    }
}