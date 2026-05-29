using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Votify.API.Repositories;

namespace Votify.API.Filters
{
    public class OrganizerOnlyFilter : IAsyncActionFilter
    {
        private readonly IEventoUsuarioRepository _eventoUsuarioRepo;
        private readonly Supabase.Client _supabase;
        private readonly IUsuarioRepository _usuarioRepository;

        public OrganizerOnlyFilter(IEventoUsuarioRepository eventoUsuarioRepo, Supabase.Client supabase, IUsuarioRepository usuarioRepository)
        {
            _eventoUsuarioRepo = eventoUsuarioRepo;
            _supabase = supabase;
            _usuarioRepository = usuarioRepository;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            string? token = context.HttpContext.Request.Headers["Authorization"].ToString()?.Replace("Bearer ", "");

            if (string.IsNullOrEmpty(token))
            {
                Console.WriteLine("[OrganizerOnlyFilter] No se encontro token en la cabecera Authorization");
                context.Result = new UnauthorizedResult();
                return;
            }

            try
            {
                var user = await _supabase.Auth.GetUser(token);

                if (user == null || string.IsNullOrEmpty(user.Email))
                {
                    Console.WriteLine("[OrganizerOnlyFilter] Token invalido o usuario no encontrado en Supabase Auth");
                    context.Result = new UnauthorizedResult();
                    return;
                }

                // idEvento se extrae de la ruta primero; si no, se busca en el body del request.
                int? idEvento = null;

                if (context.RouteData.Values.TryGetValue("idEvento", out var routeId))
                {
                    if (int.TryParse(routeId?.ToString(), out var parsedId))
                    {
                        idEvento = parsedId;
                    }
                }
                else if (context.ActionArguments.Values.FirstOrDefault() is object body)
                {
                    var property = body.GetType().GetProperty("IdEvento");
                    if (property != null)
                    {
                        var value = property.GetValue(body);
                        if (value is int parsedId)
                        {
                            idEvento = parsedId;
                        }
                    }
                }

                if (!idEvento.HasValue)
                {
                    Console.WriteLine("[OrganizerOnlyFilter] No se pudo extraer IdEvento de la peticion");
                    context.Result = new BadRequestObjectResult("IdEvento no encontrado en la peticion");
                    return;
                }

                var dbUserResponse = await _usuarioRepository.GetByEmailAsync(user.Email);
                if (dbUserResponse == null)
                {
                    Console.WriteLine($"[OrganizerOnlyFilter] Usuario {user.Email} no encontrado en la tabla 'usuario'");
                    context.Result = new UnauthorizedResult();
                    return;
                }

                var relacion = await _eventoUsuarioRepo.GetAsync(idEvento.Value, dbUserResponse.Id);

                if (relacion == null || relacion.Rol != "Organizador")
                {
                    Console.WriteLine($"[OrganizerOnlyFilter] Usuario {user.Email} (ID: {dbUserResponse.Id}) no es Organizador del evento {idEvento.Value}. Rol actual: {relacion?.Rol ?? "Ninguno"}");
                    context.Result = new ObjectResult(new { message = "No tienes permisos de organizador para este evento." }) { StatusCode = 403 };
                    return;
                }

                await next();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[OrganizerOnlyFilter] Error crítico: {ex.Message}");
                context.Result = new StatusCodeResult(500);
            }
        }
    }
}