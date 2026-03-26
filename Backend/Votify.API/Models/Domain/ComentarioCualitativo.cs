using System;
using Supabase.Postgrest.Attributes;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Votify.API.Models.Domain
{
    public class ComentarioCualitativo
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }


        public void GuardarComentario(int idCriterio, int idEvaluacion, string comentario)
        {
            // Aquí iría la lógica para guardar el comentario en la base de datos
            // utilizando el SDK de Supabase o cualquier otro método de acceso a datos.
            // Por ejemplo:
            // var nuevoComentario = new ComentarioCualitativo { IdCriterio = idCriterio, IdEvaluacion = idEvaluacion, Comentario = comentario };
            // await supabaseClient.From<ComentarioCualitativo>().Insert(nuevoComentario);
        }

        public string ObtenerComentario(int idCriterio, int idEvaluacion)
        {
            // Aquí iría la lógica para obtener el comentario de la base de datos
            // utilizando el SDK de Supabase o cualquier otro método de acceso a datos.
            // Por ejemplo:
            // var comentario = await supabaseClient.From<ComentarioCualitativo>()
            //     .Where(c => c.IdCriterio == idCriterio && c.IdEvaluacion == idEvaluacion)
            //     .SingleOrDefault();
            // return comentario?.Comentario ?? string.Empty;
            return string.Empty; // Placeholder
        }

    }
}
