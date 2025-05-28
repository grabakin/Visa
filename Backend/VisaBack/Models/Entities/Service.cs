using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VisaBack.Models.Entities;

[Table("services")]
public class Service
{
    [Key]
    [Column("service_id")]
    public int Id { get; set; }

    [Column("formatted_id")]
    public string FormattedId { get; set; } = string.Empty;

    [Required]
    [Column("country")]
    public string Country { get; set; } = null!;

    [Required]
    [Column("visa_type")]
    public string VisaType { get; set; } = null!;

    [Column("standard_duration")]
    public int? StandardDuration { get; set; }

    [Column("price", TypeName = "decimal(10, 2)")]
    public decimal? Price { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("status")]
    public string? Status { get; set; }

    // Navigation properties
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    public virtual ICollection<ServicePriceHistory> PriceHistory { get; set; } = new List<ServicePriceHistory>();
}
