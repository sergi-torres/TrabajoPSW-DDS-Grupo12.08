namespace Votify.API.Models.Domain
{
    public class CategoriaConPesos : Categoria
    {

        // Sin [Reference]: evita que Supabase haga JOIN automático al consultar categorías

        public List<PesoCategoriaRol> PesosPorRol { get; set; } = new List<PesoCategoriaRol>();

        // Propiedades no mapeadas (se asignan valores en Service)
        public int VotosRestantes { get; set; } = 3;
        public string Estado { get; set; } = "pendiente"; // "pendiente" o "completado"
    }
} 
