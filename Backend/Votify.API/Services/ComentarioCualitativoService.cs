using Microsoft.AspNetCore.Mvc;
using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

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
    // 1. Hacemos la consulta normal (sin el .Count(...) problemático)
    var response = await _supabase
        .From<Voto>()
        .Where(x => x.IdProyecto == idProyecto)
        .Get();

    // 2. 'Models' es una List<Voto> estándar de C#. 
    // Siempre tiene la propiedad .Count y no necesita usings raros.
    return response.Models.Count;
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
                       .Select(v => v.comentario)
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

