using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VisaBack.Models.Entities;

[Table("documents")]
public class Document
{
    [Key]
    [Column("document_id")]
    public int Id { get; set; }

    [Column("formatted_id")]
    public string FormattedId { get; set; } = string.Empty;

    [Column("client_id")]
    public int? ClientId { get; set; }

    [Column("order_id")]
    public int? OrderId { get; set; }

    [Column("doc_type")]
    public string? DocType { get; set; }

    [Column("doc_file")]
    public byte[]? DocFile { get; set; }
    
    [Column("file_name")]
    public string? FileName { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    [ForeignKey("ClientId")]
    public virtual Client? Client { get; set; }
    
    [ForeignKey("OrderId")]
    public virtual Order? Order { get; set; }
}
