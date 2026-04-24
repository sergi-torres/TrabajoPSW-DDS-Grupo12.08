using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Votify.API.Repositories;
using Votify.API.Models.Domain;

namespace Votify.API.Filters
{
    public class OrganizerOnlyFilter : IAsyncActionFilter
    {
        private readonly IEventoUsuarioRepository _eventoUsuarioRepo;
        private readonly Supabase.Client _supabase;

        public OrganizerOnlyFilter(IEventoUsuarioRepository eventoUsuarioRepo, Supabase.Client supabase)
        {
            _eventoUsuarioRepo = eventoUsuarioRepo;
            _supabase = supabase;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            // 1. Obtener el token de la cabecera Authorization
            string? token = context.HttpContext.Request.Headers["Authorization"].ToString()?.Replace("Bearer ", "");

            if (string.IsNullOrEmpty(token))
            {
                Console.WriteLine("[OrganizerOnlyFilter] No se encontro token en la cabecera Authorization");
                context.Result = new UnauthorizedResult();
                return;
            }

            try 
            {
                // 2. Obtener el usuario autenticado desde Supabase Auth usando el token
                var user = await _supabase.Auth.GetUser(token);
                
                if (user == null || string.IsNullOrEmpty(user.Email))
                {
                    Console.WriteLine("[OrganizerOnlyFilter] Token invalido o usuario no encontrado en Supabase Auth");
                    context.Result = new UnauthorizedResult();
                    return;
                }

                // 2. Obtener el idEvento desde la ruta o el cuerpo de la peticiÃ³n
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

                // 3. Verificar si el usuario es organizador del evento
                var dbUserResponse = await _supabase.From<Usuario>().Where(u => u.Email == user.Email).Single();
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