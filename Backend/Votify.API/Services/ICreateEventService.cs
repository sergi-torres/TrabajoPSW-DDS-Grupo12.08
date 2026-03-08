using Votify.API.Models.DTOs;
using System.Threading.Tasks;

namespace Votify.API.Services
{
    public interface ICreateEventService
    {
        Task<Event> CreateEventAsync(CreateEventDto eventDto);
    }
}