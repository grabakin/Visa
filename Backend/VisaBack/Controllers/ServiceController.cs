using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisaBack.Data;
using VisaBack.Models.DTOs;
using VisaBack.Models.Entities;
using VisaBack.Services;

namespace VisaBack.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceController : ControllerBase
    {
        private readonly VisaDbContext _context;
        private readonly IdGeneratorService _idGenerator;

        public ServiceController(VisaDbContext context, IdGeneratorService idGenerator)
        {
            _context = context;
            _idGenerator = idGenerator;
        }

        [HttpGet]
        public async Task<ActionResult<List<Service>>> GetServices()
        {
            return Ok(await _context.Services.ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Service>> GetServiceById(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service is null)
                return NotFound();
            return Ok(service);
        }

        [HttpPost]
        public async Task<ActionResult<Service>> AddNewService([FromBody] ServiceDto newServiceDto)
        {
            if (newServiceDto is null)
                return BadRequest();

            // Create a new service entity from the DTO

            var service = new Service
            {
                Country = newServiceDto.Country,
                VisaType = newServiceDto.VisaType,
                StandardDuration = newServiceDto.StandardDuration,
                Price = newServiceDto.Price,
                Status = newServiceDto.Status,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Generate formatted ID

            service.FormattedId = await _idGenerator.GenerateServiceId();


            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetServiceById), new { id = service.Id }, service);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateService(int id, [FromBody] ServiceDto updatedServiceDto)
        {
            var service = await _context.Services.FindAsync(id);
            if (service is null)
                return NotFound();

            // Update service properties from DTO

            service.Country = updatedServiceDto.Country;
            service.VisaType = updatedServiceDto.VisaType;
            service.StandardDuration = updatedServiceDto.StandardDuration;
            service.Price = updatedServiceDto.Price;

            // Update status if provided

            if (!string.IsNullOrEmpty(updatedServiceDto.Status))
            {
                service.Status = updatedServiceDto.Status;
            }

            // Update timestamp

            service.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteService(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service is null)
                return NotFound();

            _context.Services.Remove(service);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
