using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

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

        // Identity document fields
        [Column("identity_doc_type")]
        public string? IdentityDocType { get; set; }

        [Column("identity_doc_series")]
        public string? IdentityDocSeries { get; set; }

        [Column("identity_doc_number")]
        public string? IdentityDocNumber { get; set; }

        [Column("identity_doc_issued_by_authority")]
        public string? IdentityDocIssuedByAuthority { get; set; }

        [Column("identity_doc_issue_date")]
        public DateTime? IdentityDocIssueDate { get; set; }

        [Column("identity_doc_authority_code")]
        public string? IdentityDocAuthorityCode { get; set; }

        // Personal information fields
        [Column("birth_date")]
        public DateTime? BirthDate { get; set; }

        [Column("place_of_birth")]
        public string? PlaceOfBirth { get; set; }

        [Column("gender")]
        public string? Gender { get; set; }

        [Column("citizenship")]
        public string? Citizenship { get; set; }

        [Column("residential_address")]
        public string? ResidentialAddress { get; set; }

        // Additional personal information
        [Column("marital_status")]
        public string? MaritalStatus { get; set; }

        [Column("children_info")]
        public string? ChildrenInfo { get; set; }

        [Column("education_level")]
        public string? EducationLevel { get; set; }

        [Column("employment_info")]
        public string? EmploymentInfo { get; set; }

        [Column("income_details")]
        public string? IncomeDetails { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
        public virtual ICollection<Document> Documents { get; set; } = new List<Document>();
        
        // Backward compatibility property for existing code that uses PassportData
        [NotMapped]
        public string? PassportData
        {
            get
            {
                // Format the identity document fields into a single string similar to the old format
                if (string.IsNullOrEmpty(IdentityDocNumber)) return null;
                
                return $"{IdentityDocType ?? "Паспорт"} {IdentityDocSeries} {IdentityDocNumber}, выдан {IdentityDocIssuedByAuthority} {(IdentityDocIssueDate.HasValue ? IdentityDocIssueDate.Value.ToString("dd.MM.yyyy") : "")}, код подразделения {IdentityDocAuthorityCode}".Trim();
            }
            set
            {
                // If old code tries to set PassportData, we'll parse it and populate the new fields
                // This is a simple parser and may need to be adjusted based on your actual data format
                if (string.IsNullOrEmpty(value)) return;
                
                // Default to passport if not specified
                IdentityDocType = value.StartsWith("Паспорт") ? "Паспорт" : value.Split(' ').FirstOrDefault() ?? "Паспорт";
                
                // Basic parsing - this is just an example and should be improved based on your format
                var parts = value.Replace(IdentityDocType, "").Trim().Split(new[] { "," }, StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length > 0)
                {
                    var seriesNumber = parts[0].Trim().Split(' ', 2);
                    if (seriesNumber.Length >= 2)
                    {
                        IdentityDocSeries = seriesNumber[0];
                        IdentityDocNumber = seriesNumber[1];
                    }
                }
                
                if (parts.Length > 1 && parts[1].Trim().StartsWith("выдан"))
                {
                    IdentityDocIssuedByAuthority = parts[1].Replace("выдан", "").Trim();
                }
                
                // Parse date if available
                if (parts.Length > 2 && DateTime.TryParse(parts[2].Trim(), out var date))
                {
                    IdentityDocIssueDate = date;
                }
                
                // Parse authority code if available
                if (parts.Length > 3 && parts[3].Contains("код подразделения"))
                {
                    IdentityDocAuthorityCode = parts[3].Replace("код подразделения", "").Trim();
                }
            }
        }
    }
}
