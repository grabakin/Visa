using VisaBack.Models.Entities;
using Microsoft.EntityFrameworkCore;
namespace VisaBack.Data
{
    public class VisaDbContext(DbContextOptions<VisaDbContext> options) : DbContext(options)
    {
        public DbSet<Client> Clients => Set<Client>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Service> Services => Set<Service>();
        public DbSet<ServicePriceHistory> ServicePriceHistory => Set<ServicePriceHistory>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<Document> Documents => Set<Document>();
        public DbSet<Log> Logs => Set<Log>();
        public DbSet<Worker> Workers => Set<Worker>();
        public DbSet<ReportTemplate> ReportTemplates => Set<ReportTemplate>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Simpler approach: use hardcoded values instead of dynamic paths
            // This makes seeding more reliable for development

            // Seed report templates

            var fixedDate = new DateTime(2025, 5, 1); // Use a fixed date to avoid migration issues
            modelBuilder.Entity<ReportTemplate>().HasData(
                new ReportTemplate
                {
                    Id = 1,
                    Name = "Визовая анкета",
                    Description = "Стандартная анкета для оформления визы",
                    FilePath = "sample_template.docx", // Simple filename, will look for this in the app's root
                    TemplateType = "visa_application",
                    CreatedAt = fixedDate,
                    UpdatedAt = fixedDate
                },
                new ReportTemplate
                {
                    Id = 2,
                    Name = "Разрешение на работу",
                    Description = "Документ для оформления разрешения на работу",
                    FilePath = "sample_template.docx", // Use the same template file for simplicity
                    TemplateType = "work_permit",
                    CreatedAt = fixedDate,
                    UpdatedAt = fixedDate
                },
                new ReportTemplate
                {
                    Id = 3,
                    Name = "История поездок",
                    Description = "Отчет об истории поездок клиента",
                    FilePath = "sample_template.docx", // Use the same template file for simplicity
                    TemplateType = "travel_history",
                    CreatedAt = fixedDate,
                    UpdatedAt = fixedDate
                }
            );

            // Client seeding with fixed dates
            var seedDate = new DateTime(2025, 4, 1);


            // More detailed client seed data
            modelBuilder.Entity<Client>().HasData(
                new Client
                {
                    Id = 1,
                    FormattedId = "CL001",
                    FullName = "Иванов Иван Иванович",
                    Phone = "+7 (916) 123-45-67",
                    Email = "ivanov@mail.ru",
                    PassportData = "4500 123456",
                    Description = "Постоянный клиент",
                    CreatedAt = seedDate,
                    UpdatedAt = seedDate
                },
                new Client
                {
                    Id = 2,
                    FormattedId = "CL002",
                    FullName = "Петрова Анна Сергеевна",
                    Phone = "+7 (926) 987-65-43",
                    Email = "petrova@gmail.com",
                    PassportData = "4511 654321",
                    Description = "Новый клиент",
                    CreatedAt = seedDate,
                    UpdatedAt = seedDate
                },
                new Client
                {
                    Id = 3,
                    FormattedId = "CL003",
                    FullName = "Сидоров Алексей Петрович",
                    Phone = "+7 (903) 555-55-55",
                    Email = "sidorov@yandex.ru",
                    PassportData = "4522 112233",
                    CreatedAt = seedDate,
                    UpdatedAt = seedDate
                });

            // Seed service data

            modelBuilder.Entity<Service>().HasData(
                new Service
                {
                    Id = 1,
                    FormattedId = "SV001",
                    Country = "Франция",
                    VisaType = "Туристическая",
                    StandardDuration = 14,
                    Price = 12000M,
                    Status = "Активна",
                    CreatedAt = seedDate,
                    UpdatedAt = seedDate
                },
                new Service
                {
                    Id = 2,
                    FormattedId = "SV002",
                    Country = "США",
                    VisaType = "Бизнес",
                    StandardDuration = 30,
                    Price = 35000M,
                    Status = "Активна",
                    CreatedAt = seedDate,
                    UpdatedAt = seedDate
                },
                new Service
                {
                    Id = 3,
                    FormattedId = "SV003",
                    Country = "Италия",
                    VisaType = "Шенген",
                    StandardDuration = 90,
                    Price = 15000M,
                    Status = "Активна",
                    CreatedAt = seedDate,
                    UpdatedAt = seedDate
                },
                new Service
                {
                    Id = 4,
                    FormattedId = "SV004",
                    Country = "Япония",
                    VisaType = "Рабочая",
                    StandardDuration = 180,
                    Price = 25000M,
                    Status = "Активна",
                    CreatedAt = seedDate,
                    UpdatedAt = seedDate
                });

            // Seed worker data

            modelBuilder.Entity<Worker>().HasData(
                new Worker
                {
                    Id = 1,
                    FormattedId = "WK001",
                    FullName = "Смирнов Дмитрий Александрович",
                    Position = "Старший менеджер",
                    Phone = "+7 (916) 111-22-33",
                    Email = "smirnov@visa.ru",
                    Status = "Активен",
                    CreatedAt = seedDate,
                    UpdatedAt = seedDate
                },
                new Worker
                {
                    Id = 2,
                    FormattedId = "WK002",
                    FullName = "Кузнецова Елена Викторовна",
                    Position = "Менеджер",
                    Phone = "+7 (926) 444-55-66",
                    Email = "kuznetsova@visa.ru",
                    Status = "Активен",
                    CreatedAt = seedDate,
                    UpdatedAt = seedDate
                });

            // Seed order data

            modelBuilder.Entity<Order>().HasData(
                new Order
                {
                    Id = 1,
                    FormattedId = "OR001",
                    ClientId = 1,
                    WorkerId = 1,
                    ServiceId = 1,
                    OrderDate = new DateTime(2025, 5, 15),
                    Status = "В обработке",
                    Cost = 12000M,
                    Deadline = new DateTime(2025, 5, 30),
                    Description = "Оформление туристической визы во Францию",
                    CreatedAt = seedDate,
                    UpdatedAt = seedDate
                },
                new Order
                {
                    Id = 2,
                    FormattedId = "OR002",
                    ClientId = 2,
                    WorkerId = 2,
                    ServiceId = 3,
                    OrderDate = new DateTime(2025, 5, 10),
                    Status = "Выполнен",
                    Cost = 15000M,
                    Deadline = new DateTime(2025, 5, 25),
                    Description = "Оформление шенгенской визы в Италию",
                    CreatedAt = seedDate,
                    UpdatedAt = seedDate
                },
                new Order
                {
                    Id = 3,
                    FormattedId = "OR003",
                    ClientId = 3,
                    WorkerId = 1,
                    ServiceId = 2,
                    OrderDate = new DateTime(2025, 5, 20),
                    Status = "Новый",
                    Cost = 35000M,
                    Deadline = new DateTime(2025, 6, 10),
                    Description = "Оформление бизнес визы в США",
                    CreatedAt = seedDate,
                    UpdatedAt = seedDate
                });
        }
    }
}
