using System;
using System.ComponentModel.DataAnnotations;

namespace VisaBack.Models.DTOs
{
    public class ClientDto
    {
        [Required]
        public string FullName { get; set; } = string.Empty;
        
        public string? Phone { get; set; }
        
        public string? Email { get; set; }
        
        // Maintain backward compatibility for existing code
        public string? PassportData { get; set; }
        
        // Identity document fields
        public string? IdentityDocType { get; set; }
        public string? IdentityDocSeries { get; set; }
        public string? IdentityDocNumber { get; set; }
        public string? IdentityDocIssuedByAuthority { get; set; }
        public DateTime? IdentityDocIssueDate { get; set; }
        public string? IdentityDocAuthorityCode { get; set; }
        
        // Personal information
        public DateTime? BirthDate { get; set; }
        public string? PlaceOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Citizenship { get; set; }
        public string? ResidentialAddress { get; set; }
        
        // Additional personal information
        public string? MaritalStatus { get; set; }
        public string? ChildrenInfo { get; set; }
        public string? EducationLevel { get; set; }
        public string? EmploymentInfo { get; set; }
        public string? IncomeDetails { get; set; }
        
        public string? Description { get; set; }
    }
}
