using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VisaBack.Models.Entities;

[Table("orders")]
public class Order
{
    [Key]
    [Column("order_id")]
    public int Id { get; set; }

    [Column("formatted_id")]
    public string FormattedId { get; set; } = string.Empty;

    [Required]
    [Column("client_id")]
    public int ClientId { get; set; }

    public int WorkerId { get; set; }
    public Worker Worker { get; set; }
    [Required]
    [Column("service_id")]
    public int ServiceId { get; set; }

    [Required]
    [Column("order_date")]
    public DateTime OrderDate { get; set; }

    [Required]
    [Column("status")]
    public string Status { get; set; } = null!;

    [Required]
    [Column("cost", TypeName = "decimal(10, 2)")]
    public decimal Cost { get; set; }

    [Column("deadline")]
    public DateTime? Deadline { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("ClientId")]
    public virtual Client Client { get; set; } = null!;

    [ForeignKey("ServiceId")]
    public virtual Service Service { get; set; } = null!;

    public virtual ICollection<Document> Documents { get; set; } = new List<Document>();

}
