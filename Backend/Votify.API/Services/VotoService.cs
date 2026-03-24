using Votify.API.Factories;
using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
//!using Votify.API.Repositories;

namespace Votify.API.Services
{
    public class VotoService : IVotoService
    {
        /*
        private readonly IVotoRepository _votoRepository;
        
        //!Aun no quiero sacar los pesos de la tabla peso_categoria_rol
        //private readonly IPesoRepository _pesoRepository; // Para buscar el peso del rol
        public VotoService(IVotoRepository votoRepository) //! , IPesoRepository pesoRepository)
        {
            _votoRepository = votoRepository;
            //!_pesoRepository = pesoRepository;
        }
        */

        // Datos en memoria: Persisten mientras el backend esté corriendo
        private static DashboardResponseDto _datos = new DashboardResponseDto
        {
            Usuario = "Brad",
            VotosGlobalesMaximos = 6,
            VotosGlobalesRealizados = 0,
            ProyectosActivos = 4,
            TiempoRestante = "45:00",
            Categorias = new List<CategoriaResumenDto>
            {
                new CategoriaResumenDto { Id = 1, Titulo = "Innovación Tecnológica", VotosRestantes = 3 },
                new CategoriaResumenDto { Id = 2, Titulo = "Impacto Social", VotosRestantes = 3 }
            }
        };

        public DashboardResponseDto ObtenerDashboard() => _datos;

        public async Task<DashboardResponseDto> ProcesarVotoAsync(VotoRequestDto request)
        {
            var categoria = _datos.Categorias.FirstOrDefault(c => c.Id == request.CategoriaId);

            if (categoria != null && categoria.VotosRestantes > 0)
            {
                // LÓGICA DE NEGOCIO
                categoria.VotosRestantes--;
                _datos.VotosGlobalesRealizados++;

                if (categoria.VotosRestantes == 0) categoria.Estado = "completado";

                // LO QUE PEDISTE: Ver el progreso en la consola del Backend
                Console.WriteLine($"[VOTO REGISTRADO] Cat: {categoria.Titulo} | Total Votos: {_datos.VotosGlobalesRealizados}");
            }

            return _datos;
        }

        /*
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
        */
    }
}