using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VisaBack.Models.Entities;

[Table("service_price_history")]
public class ServicePriceHistory
{
    [Key]
    [Column("price_history_id")]
    public int Id { get; set; }

    [Required]
    [Column("service_id")]
    public int ServiceId { get; set; }

    [Column("old_price", TypeName = "decimal(10, 2)")]
    public decimal? OldPrice { get; set; }

    [Required]
    [Column("new_price", TypeName = "decimal(10, 2)")]
    public decimal NewPrice { get; set; }

    [Column("changed_at")]
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey("ServiceId")]
    public virtual Service Service { get; set; } = null!;
}
