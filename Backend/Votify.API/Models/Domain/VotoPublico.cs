using Supabase.Postgrest.Attributes;
using Votify.API.Models.Domain;

[Table("voto")]
public class VotoPublico : Voto
{
    public string ObtenerTipoVotante() => "PUBLICO";

    public override float CalcularPuntuacionFinal(float peso)
    {
        return (Valor ?? 0f) * peso;
    }
}
