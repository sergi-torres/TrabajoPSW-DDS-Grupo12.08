using Votify.API.Models.Domain;
public interface IVotoRepository
{
    Task<Voto> AgregarVotoAsync(Voto voto);
    // Otros métodos relacionados con la persistencia de votos, como obtener votos por proyecto, etc.
}