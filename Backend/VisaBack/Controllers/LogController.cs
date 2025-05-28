using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisaBack.Data;
using VisaBack.Models.Entities;

namespace VisaBack.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LogController(VisaDbContext context) : ControllerBase
    {
        private readonly VisaDbContext _context = context;

        [HttpGet]
        public async Task<ActionResult<List<Log>>> GetLogs()
        {
            return Ok(await _context.Logs
                .Include(l => l.User)
                .ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Log>> GetLogById(int id)
        {
            var log = await _context.Logs
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.Id == id);
                
            if (log is null)
                return NotFound();
                
            return Ok(log);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<Log>>> GetLogsByUser(int userId)
        {
            var logs = await _context.Logs
                .Where(l => l.UserId == userId)
                .ToListAsync();
                
            return Ok(logs);
        }

        [HttpGet("event/{eventType}")]
        public async Task<ActionResult<List<Log>>> GetLogsByEventType(string eventType)
        {
            var logs = await _context.Logs
                .Where(l => l.EventType == eventType)
                .Include(l => l.User)
                .ToListAsync();
                
            return Ok(logs);
        }

        [HttpGet("table/{tableName}")]
        public async Task<ActionResult<List<Log>>> GetLogsByTable(string tableName)
        {
            var logs = await _context.Logs
                .Where(l => l.TableName == tableName)
                .Include(l => l.User)
                .ToListAsync();
                
            return Ok(logs);
        }

        [HttpPost]
        public async Task<ActionResult<Log>> AddNewLog(Log newLog)
        {
            if (newLog is null)
                return BadRequest();
                
            _context.Logs.Add(newLog);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetLogById), new { id = newLog.Id }, newLog);
        }

        // Note: Typically logs should not be updated or deleted
        // But including these endpoints for completeness

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLog(int id, Log updatedLog)
        {
            var log = await _context.Logs.FindAsync(id);
            if (log is null)
                return NotFound();
            
            log.UserId = updatedLog.UserId;
            log.EventType = updatedLog.EventType;
            log.TableName = updatedLog.TableName;
            log.RecordId = updatedLog.RecordId;
            log.ChangedData = updatedLog.ChangedData;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLog(int id)
        {
            var log = await _context.Logs.FindAsync(id);
            if (log is null)
                return NotFound();

            _context.Logs.Remove(log);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
