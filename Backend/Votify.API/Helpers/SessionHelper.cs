namespace Votify.API.Helpers
{
    public static class SessionHelper
    {
        /// <summary>
        /// Genera una clave única para identificar la sesión de votación.
        /// Jurado => "U:{idUsuario}"
        /// Público => "P:{sessionId}"
        /// </summary>
        public static string ObtenerClaveSesion(int? idUsuario, string? sessionId)
        {
            if (idUsuario.HasValue)
            {
                return $"U:{idUsuario.Value}";
            }

            var safeSessionId = string.IsNullOrWhiteSpace(sessionId) ? "anon-default" : sessionId.Trim();
            return $"P:{safeSessionId}";
        }
    }
}
