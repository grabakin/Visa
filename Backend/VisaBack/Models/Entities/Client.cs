using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VisaBack.Models.Entities
{
    [Table("clients")]
    public class Client
    {
        [Key]
        [Column("client_id")]
        public int Id { get; set; }

        [Column("formatted_id")]
        public string FormattedId { get; set; } = string.Empty;

        [Required]
        [Column("full_name")]
        public string FullName { get; set; } = null!;

        [Column("phone")]
        public string? Phone { get; set; }

        [Column("email")]
        public string? Email { get; set; }

        [Column("passport_data")]
        public string? PassportData { get; set; }

        [Column("birth_date")]
        public DateTime? BirthDate { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
        public virtual ICollection<Document> Documents { get; set; } = new List<Document>();
    }
}
