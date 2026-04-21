namespace Votify.API.Services
{
    public interface IEmailService
    {
        Task<bool> SendInvitationEmailAsync(string email, int idEvento, string token, string? customMessage = null);
    }
}