namespace VisaBack.Models.Entities;

public class OrderNote
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public Order Order { get; set; }
    public string Content { get; set; }
    public int CreatedByUserId { get; set; }
    public User CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}