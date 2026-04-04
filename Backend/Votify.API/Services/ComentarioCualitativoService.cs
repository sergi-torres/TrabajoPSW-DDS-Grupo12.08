using Microsoft.AspNetCore.Mvc;

using Votify.API.Models.Domain;


namespace Votify.API.Services;

public class ComentarioCualitativoService(Supabase.Client supabase)
{
    public int Id { get; set; }
    public int IdCriterio { get; set; }
    public required string Comentario { get; set; }


    private readonly Supabase.Client _supabase = supabase;

    [HttpPost]

    // 1. Obtener el conteo de votos
    public async Task<int> GetTotalVotos(int idProyecto)
    {
        // Usamos Get() con CountType.Exact para obtener solo la metadata del conteo
        var response = await _supabase
            .From<Voto>()
            .Where(x => x.IdProyecto == idProyecto)
            .Count(Constants.CountType.Exact)
            .Get();

        return response.Count; // Accedemos a la propiedad Count del objeto de respuesta
    }

    // 2. Obtener todos los comentarios de una vez
    public async Task<List<string>> GetComentariosProyecto(int idProyecto)
    {
        var response = await _supabase
            .From<Voto>()
            .Where(x => x.IdProyecto == idProyecto)
            // Pasamos el nombre de la columna como un simple string
            .Select("comentario")
            .Get();

        // Aquí response.Models ya contiene los objetos Voto con la propiedad Comentario llena
        return response.Models
                       .Select(v => v.Comentario)
                       .Where(c => !string.IsNullOrEmpty(c))
                       .ToList();
    }



    public string GuardarComentario(int id, int idCriterio, string comentario, string votoId)
    {
        this.Id = id;
        this.IdCriterio = idCriterio;
        this.Comentario = comentario;

        return ObtenerComentario();

    }

    public string ObtenerComentario()
    {
        return "Id: " + this.Id + ", IdCriterio: " + this.IdCriterio + ", Texto: " + this.Comentario;
    }

}

