using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;

using Moq;

using Xunit;

namespace Votify.Tests.Filters
{
	// Interfaz local para tests
	public interface ITestEventoUsuarioRepository
	{
		Task<object?> GetAsync(int eventoId, int usuarioId);
	}

	// Filtro simplificado para pruebas
	public class OrganizerOnlyFilterSimplificado : IAsyncActionFilter
	{
		private readonly ITestEventoUsuarioRepository? _eventoUsuarioRepo;

		public OrganizerOnlyFilterSimplificado(ITestEventoUsuarioRepository? eventoUsuarioRepo = null)
		{
			_eventoUsuarioRepo = eventoUsuarioRepo;
		}

		public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
		{
			// 1. Validar token
			string? token = context.HttpContext.Request.Headers["Authorization"].ToString()?.Replace("Bearer ", "");

			if (string.IsNullOrEmpty(token))
			{
				context.Result = new UnauthorizedResult();
				return;
			}

			// 2. Extraer IdEvento
			int? idEvento = null;

			if (context.RouteData.Values.TryGetValue("idEvento", out var routeId))
			{
				if (int.TryParse(routeId?.ToString(), out var parsedId))
				{
					idEvento = parsedId;
				}
			}

			if (!idEvento.HasValue)
			{
				context.Result = new BadRequestObjectResult("IdEvento no encontrado en la peticion");
				return;
			}

			// 3. Simular verificación de organizador
			if (_eventoUsuarioRepo != null)
			{
				var relacion = await _eventoUsuarioRepo.GetAsync(idEvento.Value, 1);
				if (relacion == null)
				{
					context.Result = new ObjectResult(new { message = "No tienes permisos de organizador" })
					{
						StatusCode = 403
					};
					return;
				}
			}

			await next();
		}
	}

	public class FilterTests
	{
		private ActionExecutingContext CreateContext(string? token = "valid-token", int? idEvento = 1)
		{
			var httpContext = new DefaultHttpContext();
			if (!string.IsNullOrEmpty(token))
			{
				httpContext.Request.Headers["Authorization"] = $"Bearer {token}";
			}

			var routeData = new RouteData();
			if (idEvento.HasValue)
			{
				routeData.Values["idEvento"] = idEvento.Value;
			}

			var actionContext = new ActionContext
			{
				HttpContext = httpContext,
				RouteData = routeData,
				ActionDescriptor = new ActionDescriptor()
			};

			return new ActionExecutingContext(
				actionContext,
				new List<IFilterMetadata>(),
				new Dictionary<string, object?>(),
				new object());
		}

		[Fact]
		public async Task OnActionExecutionAsync_CuandoNoHayToken_Retorna401()
		{
			// Arrange
			var filter = new OrganizerOnlyFilterSimplificado();
			var context = CreateContext(token: null);

			// Act
			await filter.OnActionExecutionAsync(context, () => Task.FromResult(new ActionExecutedContext(context, new List<IFilterMetadata>(), new object())));

			// Assert
			Assert.IsType<UnauthorizedResult>(context.Result);
		}

		[Fact]
		public async Task OnActionExecutionAsync_CuandoTokenVacio_Retorna401()
		{
			// Arrange
			var filter = new OrganizerOnlyFilterSimplificado();
			var context = CreateContext(token: "");

			// Act
			await filter.OnActionExecutionAsync(context, () => Task.FromResult(new ActionExecutedContext(context, new List<IFilterMetadata>(), new object())));

			// Assert
			Assert.IsType<UnauthorizedResult>(context.Result);
		}

		[Fact]
		public async Task OnActionExecutionAsync_CuandoTokenValidoYIdEventoExiste_Continua()
		{
			// Arrange
			var filter = new OrganizerOnlyFilterSimplificado();
			var context = CreateContext(token: "valid-token", idEvento: 1);
			bool nextInvoked = false;

			// Act
			await filter.OnActionExecutionAsync(context, () => {
				nextInvoked = true;
				return Task.FromResult(new ActionExecutedContext(context, new List<IFilterMetadata>(), new object()));
			});

			// Assert
			Assert.True(nextInvoked);
			Assert.Null(context.Result);
		}

		[Fact]
		public async Task OnActionExecutionAsync_CuandoNoHayIdEvento_Retorna400()
		{
			// Arrange
			var filter = new OrganizerOnlyFilterSimplificado();
			var context = CreateContext(token: "valid-token", idEvento: null);

			// Act
			await filter.OnActionExecutionAsync(context, () => Task.FromResult(new ActionExecutedContext(context, new List<IFilterMetadata>(), new object())));

			// Assert
			Assert.IsType<BadRequestObjectResult>(context.Result);
		}

		[Fact]
		public async Task OnActionExecutionAsync_CuandoUsuarioNoEsOrganizador_Retorna403()
		{
			// Arrange
			var mockRepo = new Mock<ITestEventoUsuarioRepository>();
			mockRepo.Setup(x => x.GetAsync(1, 1))
				.ReturnsAsync((object?)null);

			var filter = new OrganizerOnlyFilterSimplificado(mockRepo.Object);
			var context = CreateContext(token: "valid-token", idEvento: 1);

			// Act
			await filter.OnActionExecutionAsync(context, () => Task.FromResult(new ActionExecutedContext(context, new List<IFilterMetadata>(), new object())));

			// Assert
			var result = Assert.IsType<ObjectResult>(context.Result);
			Assert.Equal(403, result.StatusCode);
		}
	}
}