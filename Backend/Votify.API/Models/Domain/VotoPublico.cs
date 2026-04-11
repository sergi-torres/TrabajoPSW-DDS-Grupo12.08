using Supabase.Postgrest.Attributes;
using Votify.API.Models.Domain;

[Table("voto")] //indicaremos que se guarde en esta tabla 
public class VotoPublico : Voto
{
    //?esto en las dos clases no se si srvirá 
    public  string ObtenerTipoVotante() => "PUBLICO";

    public override float CalcularPuntuacionFinal(float peso)
    {
        return Valor * peso; 
    }
}