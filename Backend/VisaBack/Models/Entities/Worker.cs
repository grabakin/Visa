// Update Worker.cs to include additional fields
using System.Collections.Generic;
using VisaBack.Models.Entities;

public class Worker
{
    public int Id { get; set; }
    public string FormattedId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Status { get; set; } = "active";  // active, vacation, unavailable
    public string Desctiption { get; set; } = string.Empty;
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}