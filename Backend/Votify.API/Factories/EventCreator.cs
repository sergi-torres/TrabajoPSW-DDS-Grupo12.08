using Votify.API.Models.Domain;

namespace Votify.API.Factories
{
    public abstract class EventCreator
    {
        public abstract Event CreateEvent(
         int id,
         string nombre,
         string descripcion,
         DateTime fechaini,
         DateTime fechafin,
         string estado,
         int idorganizador,
         List<Categoria> categorias,
         List<Baremo> baremos);
    }
}