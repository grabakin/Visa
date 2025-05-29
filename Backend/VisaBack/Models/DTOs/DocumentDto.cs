using System.ComponentModel.DataAnnotations;

namespace VisaBack.Models.DTOs
{
    public class DocumentDto
    {
        public int Id { get; set; }
        public string FormattedId { get; set; } = string.Empty;
        public int? ClientId { get; set; }
        public int? OrderId { get; set; }
        public string? DocType { get; set; }
        public byte[]? DocFile { get; set; }
        public string? FileName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties for display
        public string? ClientName { get; set; }
        public string? OrderNumber { get; set; }
    }

    public class DocumentUploadDto
    {
        public int? ClientId { get; set; }
        public int? OrderId { get; set; }
        public string? DocType { get; set; }
        public byte[]? DocFile { get; set; }
        public string? FileName { get; set; }
    }
}
