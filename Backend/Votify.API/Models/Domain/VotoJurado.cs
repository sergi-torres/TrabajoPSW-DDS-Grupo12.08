using Postgrest.Attributes;
using Votify.API.Models.Domain;

[Table("voto")]
public class VotoJurado : Voto
{// si el metodo ya estaba en voto poner override;
    public  string ObtenerTipoVotante() => "JURADO";

    public  float CalcularPuntuacionFinal(float peso) 
    {
        return Valor * peso;
    }




}
    