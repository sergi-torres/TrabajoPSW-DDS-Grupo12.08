using Supabase.Postgrest.Attributes;
using Votify.API.Models.Domain;

[Table("voto")]
public class VotoJurado : Voto
{
    public string ObtenerTipoVotante() => "JURADO";

    public override float CalcularPuntuacionFinal(float peso)
    {
        return (Valor ?? 0f) * peso;
    }
}
