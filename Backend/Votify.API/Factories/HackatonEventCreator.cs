using Votify.API.Models.Domain;

namespace Votify.API.Factories
{
    public class HackatonEventCreator : EventCreator
    {
        public override Event CreateEvent(
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
            return new HackatonEvent(
                id,
                nombre,
                descripcion,
                fechaini,
                fechafin,
                estado,
                idorganizador,
                categorias,
                baremos,
                codEvento);
        }
    }
}