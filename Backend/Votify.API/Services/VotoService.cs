using Votify.API.Factories;
using Votify.API.Models.Domain;
using Votify.API.Repositories;

namespace Votify.API.Services
{
    public class VotoService : IVotoService
    {
        private readonly IVotoRepository _votoRepository;
        
        //!Aun no quiero sacar los pesos de la tabla peso_categoria_rol
        //private readonly IPesoRepository _pesoRepository; // Para buscar el peso del rol

        public VotoService(IVotoRepository votoRepository) //! , IPesoRepository pesoRepository)
        {
            _votoRepository = votoRepository;
            //!_pesoRepository = pesoRepository;
        }

        public async Task<Voto> ProcesarNuevoVoto(int usuarioId, int proyectoId, int categoriaId, int criterioId, float valorBase, string rol, string? comentario, string? urlAudio)
        {
            // 1. DECIDIR LA FACTORY SEGÚN EL ROL
            IVotoFactory factory;
            if (rol.ToUpper() == "JURADO")
            {
                factory = new VotoJuradoFactory();
            }
            else
            {
                factory = new VotoPublicoFactory();
            }

            // 2. OBTENER EL PESO (Lógica de Negocio)
            // Buscamos en la tabla de baremos cuánto vale el voto de este rol en esta categoría
            //!float pesoAsignado = await _pesoRepository.ObtenerPesoPorRolYCategoria(rol, categoriaId);

            // 3. CREAR EL OBJETO USANDO LA FACTORY (Factory Method)
            // Aquí la factory nos devuelve un VotoJurado o VotoPublico "disfrazado" de Voto
            Voto miVoto = factory.CrearVoto(proyectoId, valorBase, categoriaId, criterioId, comentario, urlAudio);

            // 4. USAR EL POLIMORFISMO
            // No importa qué tipo de voto sea, el objeto sabe calcularse a sí mismo
            miVoto.Valor = miVoto.CalcularPuntuacionFinal(1.0f); //! Aquí podríamos pasar el peso real en lugar de 1.0f
            miVoto.IdEvaluador = usuarioId;

            // 5. GUARDAR EN SUPABASE
            return await _votoRepository.InsertarVoto(miVoto); //TODO
        }
    }
}