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

builder.Services.AddScoped<Supabase.Client>(_ =>
    new Supabase.Client(supabaseUrl, supabaseKey, new Supabase.SupabaseOptions { AutoConnectRealtime = true })
);

builder.Services.AddScoped<Votify.API.Services.IVotoService, Votify.API.Services.VotoService>();
builder.Services.AddScoped<Votify.API.Services.IAuthService, Votify.API.Services.AuthService>();
builder.Services.AddScoped<Votify.API.Repositories.ICategoriaRepository, Votify.API.Repositories.CategoriaRepository>();
builder.Services.AddScoped<Votify.API.Repositories.IProyectoRepository, Votify.API.Repositories.ProyectoRepository>();
builder.Services.AddScoped<Votify.API.Repositories.IVotoRepository, Votify.API.Repositories.VotoRepository>();
builder.Services.AddScoped<Votify.API.Repositories.IUsuarioRepository, Votify.API.Repositories.UsuarioRepository>();
builder.Services.AddScoped<Votify.API.Factories.VotoPublicoFactory>();
builder.Services.AddScoped<Votify.API.Factories.VotoJuradoFactory>();
builder.Services.AddScoped<Votify.API.Services.IAuthService, Votify.API.Services.AuthService>();
builder.Services.AddScoped<Votify.API.Services.IEventoService, Votify.API.Services.EventoService>();
builder.Services.AddScoped<Votify.API.Services.IComentarioCualitativoService, Votify.API.Services.ComentarioCualitativoService>();
builder.Services.AddScoped<Votify.API.Services.IVotoService, Votify.API.Services.VotoService>();
builder.Services.AddScoped<Votify.API.Services.IComentarioCualitativoService, Votify.API.Services.ComentarioCualitativoService>();
builder.Services.AddScoped<Votify.API.Services.IOrgDashboardService, Votify.API.Services.OrgDashboardService>();
builder.Services.AddScoped<Votify.API.Services.ICategoriaService, Votify.API.Services.CategoriaService>();

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