using Votify.API.Factories;
using Votify.API.Models.Domain;
using Votify.API.Models.DTOs;
//!using Votify.API.Repositories;

namespace Votify.API.Services
{
    public class VotoService : IVotoService
    {
        // 1. Definimos la lista con sintaxis C#
        private static readonly List<ProyectosResponseDto> ListaProyectos = new List<ProyectosResponseDto>
        {
            new ProyectosResponseDto { Id = 1, Nombre = "InnovaTech", Descripcion = "Plataforma de innovación tecnológica", Estado = "disponible" },
            new ProyectosResponseDto { Id = 2, Nombre = "Energía Solar+", Descripcion = "Solución de energía sostenible", Estado = "disponible" },
            new ProyectosResponseDto { Id = 3, Nombre = "AppMóvil Pro", Descripcion = "Desarrollo de apps", Estado = "disponible" },
            new ProyectosResponseDto { Id = 4, Nombre = "IA Salud", Descripcion = "Inteligencia artificial en salud", Estado = "disponible" }
        };

        // 2. Inicializamos los datos usando la lista correcta
        private static DashboardResponseDto _datos = new DashboardResponseDto
        {
            VotosGlobalesMaximos = 6,
            VotosGlobalesRealizados = 0,
            ProyectosActivos = ListaProyectos.Count, // .Count en lugar de .Length
            TiempoRestante = "05:00",
            Categorias = new List<CategoriaResumenDto>
            {
                new CategoriaResumenDto { Id = 1, Titulo = "Innovación Tecnológica", VotosRestantes = 3, Proyectos = ListaProyectos },
                new CategoriaResumenDto { Id = 2, Titulo = "Impacto Social", VotosRestantes = 3, Proyectos = ListaProyectos }
            }
        };

        public DashboardResponseDto ObtenerDashboard() => _datos;

        public async Task<DashboardResponseDto> ProcesarVotoAsync(VotoRequestDto request)
        {
            // Simulamos asincronía ya que la interfaz pide Task
            await Task.Delay(10); 

            var categoria = _datos.Categorias.FirstOrDefault(c => c.Id == request.CategoriaId);

            if (categoria != null && categoria.VotosRestantes > 0)
            {
                categoria.VotosRestantes--;
                _datos.VotosGlobalesRealizados++;

                if (categoria.VotosRestantes == 0) categoria.Estado = "completado";

                Console.WriteLine($"[VOTO REGISTRADO] Cat: {categoria.Titulo} | Total: {_datos.VotosGlobalesRealizados}");
            }

            return _datos;
        }
    }
}