using DotNetEnv;

// Cargar las variables del .env situado en la raíz del repositorio
Env.Load(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", ".env"));
Env.TraversePath().Load();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<Votify.API.Services.ICreateEventService, Votify.API.Services.CreateEventService>();

// Add services to the container.
builder.Services.AddControllers();

// Agregar Soporte de Supabase C# Client usando .env
var supabaseUrl = Environment.GetEnvironmentVariable("SUPABASE_URL");
var supabaseKey = Environment.GetEnvironmentVariable("SUPABASE_KEY");

if (string.IsNullOrEmpty(supabaseUrl) || string.IsNullOrEmpty(supabaseKey))
{
    throw new Exception("SUPABASE_URL o SUPABASE_KEY no están definidos en el archivo .env");
}

builder.Services.AddScoped<Supabase.Client>(_ =>
    new Supabase.Client(supabaseUrl, supabaseKey, new Supabase.SupabaseOptions { AutoConnectRealtime = true })
);

builder.Services.AddScoped<Votify.API.Services.IAuthService, Votify.API.Services.AuthService>();

// Configurar CORS para permitir que el frontend de Vite (localhost:5173) acceda a la API
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

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Aplicar CORS justo antes de la autorización
app.UseCors("AllowFrontend");

app.UseAuthorization();

// Endpoint de prueba para comprobar conexión con Supabase
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