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
        
        public string? PassportData { get; set; }
        
        public DateTime? BirthDate { get; set; }
        
        public string? Description { get; set; }
    }
}
