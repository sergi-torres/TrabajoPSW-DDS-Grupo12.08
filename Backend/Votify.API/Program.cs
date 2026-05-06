using DotNetEnv;

// Cargar las variables del .env situado en la raíz del repositorio
Env.Load(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", ".env"));
Env.TraversePath().Load();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<Votify.API.Services.ICreateEventService, Votify.API.Services.CreateEventService>();

builder.Services.AddControllers();

var supabaseUrl = Environment.GetEnvironmentVariable("SUPABASE_URL");
var supabaseKey = Environment.GetEnvironmentVariable("SUPABASE_KEY");

if (string.IsNullOrEmpty(supabaseUrl) || string.IsNullOrEmpty(supabaseKey))
{
    throw new Exception("SUPABASE_URL o SUPABASE_KEY no están definidos en el archivo .env");
}

var geminiApiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
if (string.IsNullOrEmpty(geminiApiKey))
{
    Console.WriteLine("Warning: GEMINI_API_KEY no está definida en el archivo .env. La síntesis IA no funcionará.");
}

builder.Services.AddScoped<Supabase.Client>(_ =>
    new Supabase.Client(supabaseUrl, supabaseKey, new Supabase.SupabaseOptions { AutoConnectRealtime = true })
);

// Registro con Decorator para VotoService
builder.Services.AddScoped<Votify.API.Services.VotoService>();
builder.Services.AddScoped<Votify.API.Services.IVotoService>(provider => 
{
    var baseService = provider.GetRequiredService<Votify.API.Services.VotoService>();
    var supabase = provider.GetRequiredService<Supabase.Client>();
    return new Votify.API.Services.Decorators.VotoServiceValidationDecorator(baseService, supabase);
});

builder.Services.AddScoped<Votify.API.Services.IAuthService, Votify.API.Services.AuthService>();
builder.Services.AddScoped<Votify.API.Repositories.ICategoriaRepository, Votify.API.Repositories.CategoriaRepository>();
builder.Services.AddScoped<Votify.API.Repositories.IProyectoRepository, Votify.API.Repositories.ProyectoRepository>();
builder.Services.AddScoped<Votify.API.Repositories.IVotoRepository, Votify.API.Repositories.VotoRepository>();
builder.Services.AddScoped<Votify.API.Repositories.IUsuarioRepository, Votify.API.Repositories.UsuarioRepository>();
builder.Services.AddScoped<Votify.API.Repositories.IEventoUsuarioRepository, Votify.API.Repositories.EventoUsuarioRepository>();
builder.Services.AddScoped<Votify.API.Repositories.IInvitacionPendienteRepository, Votify.API.Repositories.InvitacionPendienteRepository>();
builder.Services.AddScoped<Votify.API.Models.Domain.Factories.VotoPublicoFactory>();
builder.Services.AddScoped<Votify.API.Models.Domain.Factories.VotoJuradoFactory>();
builder.Services.AddScoped<Votify.API.Services.IAuthService, Votify.API.Services.AuthService>();
builder.Services.AddScoped<Votify.API.Services.IEventoService, Votify.API.Services.EventoService>();
builder.Services.AddScoped<Votify.API.Services.IComentarioCualitativoService, Votify.API.Services.ComentarioCualitativoService>();
// El servicio IVotoService ya está registrado arriba con el Decorator
builder.Services.AddScoped<Votify.API.Services.IComentarioCualitativoService, Votify.API.Services.ComentarioCualitativoService>();
builder.Services.AddScoped<Votify.API.Services.IOrgDashboardService, Votify.API.Services.OrgDashboardService>();
builder.Services.AddScoped<Votify.API.Services.ICategoriaService, Votify.API.Services.CategoriaService>();
builder.Services.AddScoped<Votify.API.Services.IJuradoService, Votify.API.Services.JuradoService>();
builder.Services.AddScoped<Votify.API.Services.IEmailService, Votify.API.Services.ResendEmailService>();
builder.Services.AddScoped<Votify.API.Filters.OrganizerOnlyFilter>();

// Síntesis de comentarios por IA
builder.Services.AddHttpClient<Votify.API.Adapters.Gemini.IGeminiClient, Votify.API.Adapters.Gemini.GeminiClient>();
builder.Services.AddScoped<Votify.API.Repositories.ISintesisRepository, Votify.API.Repositories.SintesisRepository>();
builder.Services.AddScoped<Votify.API.Services.Strategies.Sintesis.SintesisJuradoStrategy>();
builder.Services.AddScoped<Votify.API.Services.Strategies.Sintesis.SintesisPublicoStrategy>();
builder.Services.AddScoped<Votify.API.Services.Strategies.Sintesis.SintesisStrategyFactory>();
builder.Services.AddScoped<Votify.API.Services.ISintesisComentariosService, Votify.API.Services.SintesisComentariosService>();

var resendApiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY");
if (!string.IsNullOrEmpty(resendApiKey))
{
    builder.Services.AddOptions();
    builder.Services.AddHttpClient<Resend.ResendClient>();
    builder.Services.Configure<Resend.ResendClientOptions>(options => options.ApiToken = resendApiKey);
    builder.Services.AddTransient<Resend.IResend, Resend.ResendClient>();
}
else
{
    // Fallback or warning
    Console.WriteLine("Warning: RESEND_API_KEY not found. Email service may not work.");
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5177")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapGet("/api/test-connection", async (Supabase.Client supabase) =>
{
    try
    {
        await supabase.InitializeAsync();
        return Results.Ok(new { message = "Conexión con Supabase OK" });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error: {ex.Message}");
    }
});


app.MapControllers();

app.Run();