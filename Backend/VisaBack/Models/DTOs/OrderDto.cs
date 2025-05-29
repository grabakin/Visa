using System.ComponentModel.DataAnnotations;

namespace VisaBack.Models.DTOs
{
    // DTO for retrieving order data
    public class OrderDto
    {
        public int Id { get; set; }
        public string FormattedId { get; set; } = string.Empty;
        
        public int ClientId { get; set; }
        public int WorkerId { get; set; }
        public int ServiceId { get; set; }
        
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal Cost { get; set; }
        public DateTime? Deadline { get; set; }
        public string? Description { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // Navigation properties for display with non-nullable defaults
        private string _clientName = "Не указан"; // "Not specified" in Russian
        private string _workerName = "Не указан";
        private string _serviceName = "Не указан";
        
        public string ClientName 
        { 
            get => _clientName; 
            set => _clientName = !string.IsNullOrEmpty(value) ? value : "Не указан"; 
        }
        
        public string WorkerName 
        { 
            get => _workerName; 
            set => _workerName = !string.IsNullOrEmpty(value) ? value : "Не указан"; 
        }
        
        public string ServiceName 
        { 
            get => _serviceName; 
            set => _serviceName = !string.IsNullOrEmpty(value) ? value : "Не указан"; 
        }
    }
    
    // DTO for creating a new order
    public class CreateOrderDto
    {
        [Required]
        public int ClientId { get; set; }
        
        [Required]
        public int WorkerId { get; set; }
        
        [Required]
        public int ServiceId { get; set; }
        
        [Required]
        public DateTime OrderDate { get; set; }
        
        [Required]
        public string Status { get; set; } = "new";
        
        [Required]
        public decimal Cost { get; set; }
        
        public DateTime? Deadline { get; set; }
        public string? Description { get; set; }
    }
    
    // DTO for updating an existing order
    public class UpdateOrderDto
    {
        public int ClientId { get; set; }
        public int WorkerId { get; set; }
        public int ServiceId { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal Cost { get; set; }
        public DateTime? Deadline { get; set; }
        public string? Description { get; set; }
    }
    
    // DTO for updating just the order status
    public class UpdateOrderStatusDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
}
