using Postgrest.Attributes;

namespace Votify.API.Models.Domain
{
    // El Público es el votante anónimo.
    // Todo su rastro en la base de datos se hace dejando su ID como NULL
    // y guardando su 'ipdispositivo' en la tabla 'votacion' para que en el futuro
    // pueda ser identificado y no pueda hacer más votaciones.
    public class Publico : Usuario
    {
        public Publico()
        {
            // Forzamos el rol por seguridad
            Rol = "Publico";
            // Forzamos valores anónimos
            Email = "anon@votify.local";
            NombreCompleto = "Votante Anónimo";
        }
        
        public string IpDispositivo { get; set; } = string.Empty;
    }
}
