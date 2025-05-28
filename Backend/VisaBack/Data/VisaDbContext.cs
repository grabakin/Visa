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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Client seeding with fixed dates
            var seedDate = new DateTime(2025, 4, 1);


            modelBuilder.Entity<Client>().HasData(
                new Client
                {
                    Id = 1,
                    FullName = "Арбуз",
                    Phone = "89166424370",
                    CreatedAt = seedDate,
                    UpdatedAt = seedDate
                },
                new Client
                {
                    Id = 2,
                    FullName = "Банан",
                    Phone = "89156321",
                    CreatedAt = seedDate,
                    UpdatedAt = seedDate
                });
        }
    }
}
