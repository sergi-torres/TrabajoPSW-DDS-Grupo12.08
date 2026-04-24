// Services/ICategoriaService.cs
using Votify.API.Models.Domain;

namespace Votify.API.Services
{
	public interface ICategoriaService
	{
		Task<Categoria> CreateAsync(Categoria categoria);
	}
}