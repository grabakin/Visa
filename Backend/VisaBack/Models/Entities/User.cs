using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VisaBack.Models.Entities;

[Table("users")]
public class User
{
    [Key]
    [Column("user_id")]
    public int Id { get; set; }

    [Column("formatted_id")]
    public string FormattedId { get; set; } = string.Empty;

    [Required]
    [Column("username")]
    public string Username { get; set; } = null!;

    [Required]
    [Column("password_hash")]
    public string PasswordHash { get; set; } = null!;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<Log> Logs { get; set; } = new List<Log>();
}
