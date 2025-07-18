using System.Reflection;
using GeziBlog.API.Data;
using Microsoft.EntityFrameworkCore;
using GeziBlog.API.Data;
using Microsoft.EntityFrameworkCore;


// ----------------------
// 1. Services
// ----------------------

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add controllers
builder.Services.AddControllers();

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();



builder.Services.AddSwaggerGen(c =>
{
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    c.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
});


// Add CORS for frontend access
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // React frontend adresi
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// ----------------------
// 2. Middleware
// ----------------------

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use static files for image access (e.g., wwwroot/uploads)
app.UseStaticFiles();

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
