using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VisaBack.Models.Entities
{
    [Table("report_templates")]
    public class ReportTemplate
    {
        [Key]
        [Column("template_id")]
        public int Id { get; set; }

        [Required]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Column("description", TypeName = "text")]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Column("file_path")]
        public string FilePath { get; set; } = string.Empty;

        [Column("thumbnail_path")]
        public string? ThumbnailPath { get; set; }

        [Required]
        [Column("template_type")]
        public string TemplateType { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
