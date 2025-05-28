using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisaBack.Data;
using VisaBack.Models.Entities;

namespace VisaBack.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServicePriceHistoryController(VisaDbContext context) : ControllerBase
    {
        private readonly VisaDbContext _context = context;

        [HttpGet]
        public async Task<ActionResult<List<ServicePriceHistory>>> GetPriceHistories()
        {
            return Ok(await _context.ServicePriceHistory
                .Include(p => p.Service)
                .ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ServicePriceHistory>> GetPriceHistoryById(int id)
        {
            var priceHistory = await _context.ServicePriceHistory
                .Include(p => p.Service)
                .FirstOrDefaultAsync(p => p.Id == id);
                
            if (priceHistory is null)
                return NotFound();
                
            return Ok(priceHistory);
        }

        [HttpGet("service/{serviceId}")]
        public async Task<ActionResult<List<ServicePriceHistory>>> GetPriceHistoriesByService(int serviceId)
        {
            var priceHistories = await _context.ServicePriceHistory
                .Where(p => p.ServiceId == serviceId)
                .OrderByDescending(p => p.ChangedAt)
                .ToListAsync();
                
            return Ok(priceHistories);
        }

        [HttpPost]
        public async Task<ActionResult<ServicePriceHistory>> AddNewPriceHistory(ServicePriceHistory newPriceHistory)
        {
            if (newPriceHistory is null)
                return BadRequest();
                
            _context.ServicePriceHistory.Add(newPriceHistory);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPriceHistoryById), new { id = newPriceHistory.Id }, newPriceHistory);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePriceHistory(int id, ServicePriceHistory updatedPriceHistory)
        {
            var priceHistory = await _context.ServicePriceHistory.FindAsync(id);
            if (priceHistory is null)
                return NotFound();
            
            priceHistory.ServiceId = updatedPriceHistory.ServiceId;
            priceHistory.OldPrice = updatedPriceHistory.OldPrice;
            priceHistory.NewPrice = updatedPriceHistory.NewPrice;
            priceHistory.ChangedAt = updatedPriceHistory.ChangedAt;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePriceHistory(int id)
        {
            var priceHistory = await _context.ServicePriceHistory.FindAsync(id);
            if (priceHistory is null)
                return NotFound();

            _context.ServicePriceHistory.Remove(priceHistory);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
