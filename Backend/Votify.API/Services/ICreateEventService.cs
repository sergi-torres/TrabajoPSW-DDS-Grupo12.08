using Votify.API.Models.DTOs;
using Votify.API.Models.Domain;
using System.Threading.Tasks;
namespace Votify.API.Services
{
    public interface ICreateEventService
    {
        Task<Event> CreateEventAsync(CreateEventDto eventDto);

        Task<Categoria> CreateAsync(Categoria categoria);
    }
}