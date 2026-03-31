using System;
using Supabase.Postgrest.Attributes;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Votify.API.Models.Domain
{
    /*public class ComentarioCualitativo
    {
        public int Id { get; set; }
        public int IdCriterio { get; set; }
        public string Comentario { get; set; }

        public void GuardarComentario(int idCriterio, string comentario)
        {
            var nuevoComentario = new ComentarioCualitativo { IdCriterio = idCriterio, Comentario = comentario };
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
    */
}
