using Votify.API.Models.Domain;

namespace Votify.API.Models.Domain.Factories
{
    public abstract class EventCreator
    {
        public Event PrepareEvent(
         int id,
         string nombre,
         string descripcion,
         DateTime fechaini,
         DateTime fechafin,
         string estado,
         int idorganizador,
         List<Categoria> categorias,
         List<Baremo> baremos,
         int codEvento)
        {
            return CreateEvent(id, nombre, descripcion, fechaini, fechafin, estado, idorganizador, categorias, baremos, codEvento);
        }

        protected abstract Event CreateEvent(
         int id,
         string nombre,
         string descripcion,
         DateTime fechaini,
         DateTime fechafin,
         string estado,
         int idorganizador,
         List<Categoria> categorias,
         List<Baremo> baremos,
         int codEvento);
    }
}