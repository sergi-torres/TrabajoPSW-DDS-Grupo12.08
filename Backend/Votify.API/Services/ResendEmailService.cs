using Resend;

namespace Votify.API.Services
{
    public class ResendEmailService : IEmailService
    {
        private readonly IResend _resend;
        private readonly IConfiguration _configuration;

        public ResendEmailService(IResend resend, IConfiguration configuration)
        {
            _resend = resend;
            _configuration = configuration;
        }

        public async Task<bool> SendInvitationEmailAsync(string email, int idEvento, string token, string? customMessage = null)
        {
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
            var invitationUrl = $"{frontendUrl}/accept-invite?token={token}";

            var message = new EmailMessage();
            message.From = "Votify <onboarding@resend.dev>";
            message.To.Add(email);
            
            // Usamos un asunto sencillo y limpio para evitar problemas de codificación en el header
            message.Subject = "Invitacion para unirse al Jurado - Votify";
            
            // Construcción del bloque de mensaje personalizado si existe
            string customMessageHtml = "";
            if (!string.IsNullOrEmpty(customMessage))
            {
                customMessageHtml = $@"
                    <div style=""background-color: #f0f7ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 0 12px 12px 0;"">
                        <p style=""margin: 0; font-style: italic; color: #1e40af; font-size: 15px;"">
                            ""{System.Net.WebUtility.HtmlEncode(customMessage)}""
                        </p>
                    </div>";
            }

            message.HtmlBody = $@"
                <div style=""font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a; line-height: 1.6;"">
                    <div style=""text-align: center; margin-bottom: 30px;"">
                        <h1 style=""color: #3b82f6; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -1px;"">Votify</h1>
                    </div>
                    
                    <div style=""background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 24px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"">
                        <h2 style=""font-size: 24px; font-weight: 700; margin-top: 0; color: #111827;"">Hola,</h2>
                        
                        <p style=""font-size: 16px; color: #4b5563; margin-bottom: 12px;"">
                            Has sido invitado a evaluar los proyectos de un evento en <span style=""font-weight: 700; color: #3b82f6;"">Votify</span>.
                        </p>

                        {customMessageHtml}
                        
                        <p style=""font-size: 16px; color: #4b5563; margin-bottom: 32px;"">
                            Tu experiencia es fundamental para garantizar una evaluaci&oacute;n justa y anal&iacute;tica de los participantes.
                        </p>
                        
                        <div style=""text-align: center; margin-bottom: 32px;"">
                            <a href=""{invitationUrl}"" style=""background-color: #3b82f6; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);"">
                                Aceptar Invitaci&oacute;n
                            </a>
                        </div>
                        
                        <p style=""font-size: 14px; color: #6b7280; text-align: center; margin: 0;"">
                            Si el bot&oacute;n no funciona, puedes copiar y pegar este enlace en tu navegador:
                        </p>
                        <p style=""font-size: 12px; color: #3b82f6; text-align: center; word-break: break-all; margin-top: 8px;"">
                            {invitationUrl}
                        </p>
                    </div>
                    
                    <div style=""text-align: center; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;"">
                        <p style=""font-size: 12px; color: #9ca3af; margin: 0;"">
                            &copy; 2026 Votify Platform. Enviado por el organizador del evento.
                        </p>
                    </div>
                </div>
            ";

            try 
            {
                await _resend.EmailSendAsync(message);
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error enviando email con Resend: {ex.Message}");
                return false;
            }
        }
    }
}