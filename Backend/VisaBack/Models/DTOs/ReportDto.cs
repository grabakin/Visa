using System.ComponentModel.DataAnnotations;

namespace VisaBack.Models.DTOs
{
    // DTO for returning report template data
    public class ReportTemplateDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TemplateType { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // DTO for generating a report
    public class GenerateReportDto
    {
        [Required]
        public int TemplateId { get; set; }
        
        public int? ClientId { get; set; }
        
        public int? OrderId { get; set; }
        
        // Dictionary of additional fields required by the template
        // Key is the field name, Value is the field value
        public Dictionary<string, string> AdditionalFields { get; set; } = new Dictionary<string, string>();
    }

    // DTO for report generation result
    public class ReportResultDto
    {
        public string ReportId { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string DownloadUrl { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }
}
