using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;
using VisaBack.Data;
using VisaBack.Models.DTOs;
using VisaBack.Models.Entities;
using VisaBack.Services;

namespace VisaBack.Controllers
{
    [Route("api/orders")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly VisaDbContext _context;
        private readonly IdGeneratorService _idGenerator;
        private readonly ILogger<OrderController> _logger;

        public OrderController(VisaDbContext context, IdGeneratorService idGenerator, ILogger<OrderController> logger)
        {
            _context = context;
            _idGenerator = idGenerator;
            _logger = logger;
        }

        // Helper method to map Order entity to OrderDto
        private OrderDto MapToDto(Order order)
        {
            // Ensure we have client, worker and service names, even if navigation properties are null
            string clientName = "Не указан";
            string workerName = "Не указан";
            string serviceName = "Не указан";
            
            // Ensure we have a valid status (using the status value, not label)
            string statusValue = order.Status;


            try
            {
                // Try to load related entities with explicit SQL to avoid ORM mapping issues
                if (order.ClientId > 0)
                {
                    // Get client name directly from database
                    var client = _context.Clients
                        .Where(c => c.Id == order.ClientId)
                        .FirstOrDefault();


                    if (client != null)
                    {
                        clientName = client.FullName;
                    }
                }


                if (order.WorkerId > 0)
                {
                    // Get worker name directly
                    var worker = _context.Workers
                        .Where(w => w.Id == order.WorkerId)
                        .FirstOrDefault();


                    if (worker != null)
                    {
                        workerName = worker.FullName;
                        _logger.LogInformation($"Found worker: {worker.Id} - {worker.FullName}");
                    }
                    else
                    {
                        _logger.LogWarning($"Worker not found for ID: {order.WorkerId}");
                    }
                }


                if (order.ServiceId > 0)
                {
                    // Get service type directly
                    var service = _context.Services
                        .Where(s => s.Id == order.ServiceId)
                        .FirstOrDefault();


                    if (service != null)
                    {
                        serviceName = service.VisaType;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading related entities for order {OrderId}", order.Id);
            }


            return new OrderDto
            {
                Id = order.Id,
                FormattedId = order.FormattedId,
                ClientId = order.ClientId,
                WorkerId = order.WorkerId,
                ServiceId = order.ServiceId,
                OrderDate = order.OrderDate,
                Status = order.Status,
                Cost = order.Cost,
                Deadline = order.Deadline,
                Description = order.Description,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                ClientName = clientName,
                WorkerName = workerName,
                ServiceName = serviceName
            };
        }

        [HttpGet]
        public async Task<ActionResult<List<OrderDto>>> GetOrders()
        {
            try
            {
                var orders = await _context.Orders
                    .Include(o => o.Client)
                    .Include(o => o.Service)
                    .Include(o => o.Worker)
                    .ToListAsync();


                var dtos = orders.Select(MapToDto).ToList();

                // Log the DTOs to verify data is populated correctly

                foreach (var dto in dtos)
                {
                    _logger.LogInformation(
                        "Order DTO: ID={Id}, Client={ClientName}, Worker={WorkerName}, Service={ServiceName}",

                        dto.Id,

                        dto.ClientName,

                        dto.WorkerName,

                        dto.ServiceName);
                }


                return Ok(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving orders");
                return StatusCode(500, "An error occurred while retrieving orders");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDto>> GetOrderById(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Client)
                .Include(o => o.Service)
                .Include(o => o.Worker)
                .FirstOrDefaultAsync(o => o.Id == id);


            if (order is null)
                return NotFound();


            return Ok(MapToDto(order));
        }

        [HttpGet("client/{clientId}")]
        public async Task<ActionResult<List<OrderDto>>> GetOrdersByClient(int clientId)
        {
            var orders = await _context.Orders
                .Where(o => o.ClientId == clientId)
                .Include(o => o.Service)
                .Include(o => o.Client)
                .Include(o => o.Worker)
                .ToListAsync();


            return Ok(orders.Select(MapToDto));
        }

        [HttpPost]
        public async Task<ActionResult<OrderDto>> AddNewOrder([FromBody] CreateOrderDto createDto)
        {
            if (createDto == null)
                return BadRequest("Order data is required");


            try
            {
                _logger.LogInformation("Received order data: {OrderData}", System.Text.Json.JsonSerializer.Serialize(createDto));

                // Validate required relationships exist

                var client = await _context.Clients.FindAsync(createDto.ClientId);
                var service = await _context.Services.FindAsync(createDto.ServiceId);
                var worker = await _context.Workers.FindAsync(createDto.WorkerId);


                if (client == null)
                    return BadRequest("Client not found");
                if (service == null)
                    return BadRequest("Service not found");
                if (worker == null)
                    return BadRequest("Worker not found");

                // Create new order entity

                var newOrder = new Order
                {
                    ClientId = createDto.ClientId,
                    ServiceId = createDto.ServiceId,
                    WorkerId = createDto.WorkerId,
                    OrderDate = createDto.OrderDate,
                    Status = createDto.Status,
                    Cost = createDto.Cost,
                    Deadline = createDto.Deadline,
                    Description = createDto.Description,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Generate formatted ID

                newOrder.FormattedId = await _idGenerator.GenerateOrderId();


                _context.Orders.Add(newOrder);
                await _context.SaveChangesAsync();

                // Get the complete order with navigation properties

                var savedOrder = await _context.Orders
                    .Include(o => o.Client)
                    .Include(o => o.Service)
                    .Include(o => o.Worker)
                    .FirstOrDefaultAsync(o => o.Id == newOrder.Id);

                return CreatedAtAction(nameof(GetOrderById), new { id = newOrder.Id }, MapToDto(savedOrder!));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while adding order");
                return StatusCode(500, $"An error occurred while processing your request: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<OrderDto>> UpdateOrder(int id, UpdateOrderDto updateDto)
        {
            if (updateDto == null)
                return BadRequest("Update data is required");


            var order = await _context.Orders
                .Include(o => o.Client)
                .Include(o => o.Service)
                .Include(o => o.Worker)
                .FirstOrDefaultAsync(o => o.Id == id);


            if (order == null)
                return NotFound();

            // Validate relationships if changed

            if (order.ClientId != updateDto.ClientId)
            {
                var client = await _context.Clients.FindAsync(updateDto.ClientId);
                if (client == null)
                    return BadRequest("Client not found");
            }


            if (order.ServiceId != updateDto.ServiceId)
            {
                var service = await _context.Services.FindAsync(updateDto.ServiceId);
                if (service == null)
                    return BadRequest("Service not found");
            }


            if (order.WorkerId != updateDto.WorkerId)
            {
                var worker = await _context.Workers.FindAsync(updateDto.WorkerId);
                if (worker == null)
                    return BadRequest("Worker not found");
            }

            // Update the order

            order.ClientId = updateDto.ClientId;
            order.ServiceId = updateDto.ServiceId;
            order.WorkerId = updateDto.WorkerId;
            order.OrderDate = updateDto.OrderDate;
            order.Status = updateDto.Status;
            order.Cost = updateDto.Cost;
            order.Deadline = updateDto.Deadline;
            order.Description = updateDto.Description;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Reload to get updated relationships

            await _context.Entry(order).Reference(o => o.Client).LoadAsync();
            await _context.Entry(order).Reference(o => o.Service).LoadAsync();
            await _context.Entry(order).Reference(o => o.Worker).LoadAsync();

            // Return updated data

            var orderDto = new OrderDto
            {
                Id = order.Id,
                FormattedId = order.FormattedId,
                ClientId = order.ClientId,
                WorkerId = order.WorkerId,
                ServiceId = order.ServiceId,
                OrderDate = order.OrderDate,
                Status = order.Status,
                Cost = order.Cost,
                Deadline = order.Deadline,
                Description = order.Description,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                ClientName = order.Client?.FullName,
                WorkerName = order.Worker?.FullName,
                ServiceName = order.Service?.VisaType
            };

            return Ok(orderDto);
        }

        // Define status mappings to match frontend constants
        private static readonly Dictionary<string, string> StatusValueToLabel = new()
        {
            { "new", "Новый" },
            { "in-progress", "В работе" },
            { "waiting", "Ожидание" },
            { "completed", "Завершен" },
            { "cancelled", "Отменен" }
        };

        [HttpPatch("{id}/status")]
        public async Task<ActionResult<OrderDto>> UpdateOrderStatus(int id, [FromBody] JsonElement statusData)
        {
            try
            {
                // Extract status from the request
                if (!statusData.TryGetProperty("status", out JsonElement statusElement))
                    return BadRequest("Status field is required");

                string statusValue = statusElement.GetString() ?? "";
                if (string.IsNullOrEmpty(statusValue))
                    return BadRequest("Status cannot be empty");

                // Get the display label from the status value
                string displayLabel = statusValue;
                if (StatusValueToLabel.TryGetValue(statusValue, out string? label))
                {
                    displayLabel = label;
                }

                _logger.LogInformation($"Updating order {id} status to: {statusValue} (Display: {displayLabel})");

                // Find the order
                var order = await _context.Orders
                    .Include(o => o.Client)
                    .Include(o => o.Service)
                    .Include(o => o.Worker)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order == null)
                    return NotFound($"Order with ID {id} not found");

                // Store the status value in the database
                order.Status = statusValue; // Store the value, not the label
                order.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Return the updated order
                return Ok(MapToDto(order));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating status for order {id}");
                return StatusCode(500, "Internal server error occurred while updating order status");
            }
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
