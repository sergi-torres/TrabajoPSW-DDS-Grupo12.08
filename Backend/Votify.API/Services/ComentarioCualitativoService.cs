using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Diagnostics;
using Supabase;
using Supabase.Interfaces;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading.Tasks;
using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Votify.API.Services;

public class ComentarioCualitativoService(Client supabase)
{

    public int Id { get; set; }
    public int IdCriterio { get; set; }
    public required string Comentario { get; set; }


    private readonly Client _supabase = supabase;

    [HttpPost]

    public async Task<string?> GetComentarioVoto(string votoId)
    {
        var response = await _supabase
            .From<Voto>()
            .Where(x => x.Id == votoId)
            .Get();

        string? comentario = response.Models.FirstOrDefault()?.comentario ;
        if (comentario != null) return comentario;
        return "null";
    }

    public string GuardarComentario(int id, int idCriterio, string comentario, string votoId)
    {
        this.Id = id;
        this.IdCriterio = idCriterio;
        this.Comentario = GetComentarioVoto(votoId).ToString();

        return ObtenerComentario();

    }

    public string ObtenerComentario()
    {
        return "Id: "+Id+", IdCriterio: "+IdCriterio+", Texto"+Comentario;
    }

}

