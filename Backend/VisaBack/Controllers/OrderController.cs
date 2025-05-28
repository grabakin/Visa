using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisaBack.Data;
using VisaBack.Models.Entities;
using VisaBack.Services;

namespace VisaBack.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly VisaDbContext _context;
        private readonly IdGeneratorService _idGenerator;

        public OrderController(VisaDbContext context, IdGeneratorService idGenerator)
        {
            _context = context;
            _idGenerator = idGenerator;
        }

        [HttpGet]
        public async Task<ActionResult<List<Order>>> GetOrders()
        {
            return Ok(await _context.Orders
                .Include(o => o.Client)
                .Include(o => o.Service)
                .ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrderById(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Client)
                .Include(o => o.Service)
                .FirstOrDefaultAsync(o => o.Id == id);
                
            if (order is null)
                return NotFound();
                
            return Ok(order);
        }

        [HttpGet("client/{clientId}")]
        public async Task<ActionResult<List<Order>>> GetOrdersByClient(int clientId)
        {
            var orders = await _context.Orders
                .Where(o => o.ClientId == clientId)
                .Include(o => o.Service)
                .ToListAsync();
                
            return Ok(orders);
        }

        [HttpPost]
        public async Task<ActionResult<Order>> AddNewOrder(Order newOrder)
        {
            if (newOrder is null)
                return BadRequest();
                
            // Generate formatted ID
            newOrder.FormattedId = await _idGenerator.GenerateOrderId();
                
            _context.Orders.Add(newOrder);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOrderById), new { id = newOrder.Id }, newOrder);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, Order updatedOrder)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order is null)
                return NotFound();
            
            order.ClientId = updatedOrder.ClientId;
            order.ServiceId = updatedOrder.ServiceId;
            order.OrderDate = updatedOrder.OrderDate;
            order.Status = updatedOrder.Status;
            order.Cost = updatedOrder.Cost;
            order.Deadline = updatedOrder.Deadline;
            order.Description = updatedOrder.Description;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order is null)
                return NotFound();

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
