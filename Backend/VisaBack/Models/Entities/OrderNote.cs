using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VisaBack.Models.Entities;

[Table("order_notes")]
public class OrderNote
{
    [Key]
    [Column("id")]
    public int Id { get; set; }
    
    [Required]
    [Column("order_id")]
    public int OrderId { get; set; }
    
    [ForeignKey("OrderId")]
    public virtual Order Order { get; set; } = null!;
    
    [Required]
    [Column("content", TypeName = "text")]
    public string Content { get; set; } = null!;
    
    [Required]
    [Column("created_by_user_id")]
    public int CreatedByUserId { get; set; }
    
    [ForeignKey("CreatedByUserId")]
    public virtual User CreatedBy { get; set; } = null!;
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}