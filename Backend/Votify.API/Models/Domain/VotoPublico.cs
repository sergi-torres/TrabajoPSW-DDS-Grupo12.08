using Postgrest.Attributes;
using Votify.API.Models.Domain;

[Table("voto")] //indicaremos que se guarde en esta tabla 
public class VotoPublico : Voto
{
    public  string ObtenerTipoVotante() => "PUBLICO";

    public float CalcularPuntuacionFinal(float peso)
    {
        return Valor * peso; 
    }
}