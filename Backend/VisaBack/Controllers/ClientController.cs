using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisaBack.Data;
using VisaBack.Models.Entities;
using VisaBack.Models.DTOs;
using VisaBack.Services;
using System;

namespace VisaBack.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientController : ControllerBase
    {
        private readonly VisaDbContext _context;
        private readonly IdGeneratorService _idGenerator;

        public ClientController(VisaDbContext context, IdGeneratorService idGenerator)
        {
            _context = context;
            _idGenerator = idGenerator;
        }

        [HttpGet]
        public async Task<ActionResult<List<Client>>> GetClients()
        {
            return Ok(await _context.Clients.ToListAsync());
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<Client>> GetClientById(int id)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client is null)
                return NotFound();
            return Ok(client);
        }
        [HttpPost]
        public async Task<ActionResult<Client>> AddNewClient([FromBody] ClientDto clientDto)
        {
            if (clientDto is null)
                return BadRequest("Client data is required");
            
            // Create a new Client entity from the DTO
            var client = new Client
            {
                FullName = clientDto.FullName,
                Phone = clientDto.Phone,
                Email = clientDto.Email,
                PassportData = clientDto.PassportData,
                BirthDate = clientDto.BirthDate,
                Description = clientDto.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            // Generate formatted ID
            client.FormattedId = await _idGenerator.GenerateClientId();
            
            _context.Clients.Add(client);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetClientById), new { id = client.Id }, client);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateClient(int id, [FromBody] ClientDto clientDto)
        {
            if (clientDto == null)
                return BadRequest("Client data is required");
                
            var client = await _context.Clients.FindAsync(id);
            if (client is null)
                return NotFound();
                
            // Update client properties
            client.FullName = clientDto.FullName;
            client.Phone = clientDto.Phone;
            client.Email = clientDto.Email;
            client.PassportData = clientDto.PassportData;
            client.BirthDate = clientDto.BirthDate;
            client.Description = clientDto.Description;
            client.UpdatedAt = DateTime.UtcNow; // Update the timestamp

            await _context.SaveChangesAsync();

            return NoContent();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClient(int id)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client is null)
                return NotFound();

            _context.Clients.Remove(client);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
