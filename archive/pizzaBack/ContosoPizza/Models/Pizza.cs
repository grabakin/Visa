namespace ContosoPizza.Models;
using System.ComponentModel.DataAnnotations;

public class Pizza
{
    public int Id { get; set; }

    [MaxLength(100)]
    [Required]
    public string? Name { get; set; }

    public Sauce? Sauce { get; set; }
    
    public ICollection<Topping>? Toppings { get; set; }
}