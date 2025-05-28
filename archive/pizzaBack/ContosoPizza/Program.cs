using ContosoPizza.Services;
using ContosoPizza.Data;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSqlite<PizzaContext>("Data Source=ContosoPizza.db");

// Add the PromotionsContext

builder.Services.AddScoped<PizzaService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()    // разрешить запросы с любого источника
              .AllowAnyMethod()    // разрешить любые методы (GET, POST, PUT, DELETE и т.д.)
              .AllowAnyHeader();   // разрешить любые заголовки
    });
});

var app = builder.Build();

//Непонятная хрень
app.UseCors("AllowAll");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();

app.MapControllers();

app.CreateDbIfNotExists();

app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "..", "..", "dist")
    )
});

// 2. Point StaticFiles to dist
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "..", "..", "dist")
    ),
    RequestPath = "" // serve at root
});

app.Run();
