using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VisaBack.Models.Entities
{
    [Table("workers")]
    public class Worker
    {
        [Key]
        [Column("worker_id")]
        public int Id { get; set; }
        
        [Column("formatted_id")]
        public string FormattedId { get; set; } = string.Empty;
        
        [Required]
        [Column("full_name")]
        public string FullName { get; set; } = string.Empty;
        
        [Column("position")]
        public string Position { get; set; } = string.Empty;
        
        [Column("phone")]
        public string Phone { get; set; } = string.Empty;
        
        [Column("email")]
        public string Email { get; set; } = string.Empty;
        
        [Column("status")]
        public string Status { get; set; } = "active";  // active, vacation, unavailable
        
        [Column("description")]
        public string Description { get; set; } = string.Empty;
        
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}