namespace Votify.API.Models.Domain
{
    // Votante anónimo: su IdEvaluador queda NULL en la tabla voto;
    // la unicidad se controla por identificador_hash en registro_votos_publicos.
    public class Publico : Usuario
    {
        public Publico()
        {
            Email = "anon@votify.local";
            NombreCompleto = "Votante Anónimo";
        }

        public string IpDispositivo { get; set; } = string.Empty;
    }
}
