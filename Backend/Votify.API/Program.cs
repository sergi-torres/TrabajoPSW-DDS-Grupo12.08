using DotNetEnv;

// Cargar las variables del .env situado en la raíz del repositorio
Env.Load(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", ".env"));
Env.TraversePath().Load();

var builder = WebApplication.CreateBuilder(args);

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

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

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