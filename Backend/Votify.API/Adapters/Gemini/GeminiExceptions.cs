namespace Votify.API.Adapters.Gemini
{
    public class SintesisGeminiException : Exception
    {
        public SintesisGeminiErrorKind Kind { get; }

        public SintesisGeminiException(SintesisGeminiErrorKind kind, string message, Exception? inner = null)
            : base(message, inner)
        {
            Kind = kind;
        }
    }

    public enum SintesisGeminiErrorKind
    {
        Timeout,
        RateLimit,
        SafetyBlocked,
        AuthFailure,
        MalformedJson,
        Network,
        Unknown
    }
}
