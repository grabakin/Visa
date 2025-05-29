using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VisaBack.Models.Entities;

[Table("logs")]
public class Log
{
    [Key]
    [Column("log_id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    [Required]
    [Column("event_type")]
    public string EventType { get; set; } = null!;

    [Required]
    [Column("table_name")]
    public string TableName { get; set; } = null!;

    [Column("record_id")]
    public int? RecordId { get; set; }

    [Column("changed_data", TypeName = "text")]
    public string? ChangedData { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey("UserId")]
    public virtual User? User { get; set; }
}
