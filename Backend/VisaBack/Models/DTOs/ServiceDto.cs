using System;
using System.ComponentModel.DataAnnotations;

namespace VisaBack.Models.DTOs
{
    public class ServiceDto
    {
        [Required]
        public string Country { get; set; } = string.Empty;
        
        [Required]
        public string VisaType { get; set; } = string.Empty;
        
        [Required]
        public int StandardDuration { get; set; }
        
        [Required]
        public decimal Price { get; set; }
        
        public string? Status { get; set; }
    }
}
