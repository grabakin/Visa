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
                // Basic info
                FullName = clientDto.FullName,
                Phone = clientDto.Phone,
                Email = clientDto.Email,
                BirthDate = clientDto.BirthDate,
                Description = clientDto.Description,
                
                // Identity document fields
                IdentityDocType = clientDto.IdentityDocType,
                IdentityDocSeries = clientDto.IdentityDocSeries,
                IdentityDocNumber = clientDto.IdentityDocNumber,
                IdentityDocIssuedByAuthority = clientDto.IdentityDocIssuedByAuthority,
                IdentityDocIssueDate = clientDto.IdentityDocIssueDate,
                IdentityDocAuthorityCode = clientDto.IdentityDocAuthorityCode,
                
                // Personal information
                PlaceOfBirth = clientDto.PlaceOfBirth,
                Gender = clientDto.Gender,
                Citizenship = clientDto.Citizenship,
                ResidentialAddress = clientDto.ResidentialAddress,
                
                // Additional information
                MaritalStatus = clientDto.MaritalStatus,
                ChildrenInfo = clientDto.ChildrenInfo,
                EducationLevel = clientDto.EducationLevel,
                EmploymentInfo = clientDto.EmploymentInfo,
                IncomeDetails = clientDto.IncomeDetails,
                
                // For backward compatibility
                PassportData = clientDto.PassportData,
                
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
            // Basic info
            client.FullName = clientDto.FullName;
            client.Phone = clientDto.Phone;
            client.Email = clientDto.Email;
            client.BirthDate = clientDto.BirthDate;
            client.Description = clientDto.Description;
            
            // Identity document fields
            client.IdentityDocType = clientDto.IdentityDocType;
            client.IdentityDocSeries = clientDto.IdentityDocSeries;
            client.IdentityDocNumber = clientDto.IdentityDocNumber;
            client.IdentityDocIssuedByAuthority = clientDto.IdentityDocIssuedByAuthority;
            client.IdentityDocIssueDate = clientDto.IdentityDocIssueDate;
            client.IdentityDocAuthorityCode = clientDto.IdentityDocAuthorityCode;
            
            // Personal information
            client.PlaceOfBirth = clientDto.PlaceOfBirth;
            client.Gender = clientDto.Gender;
            client.Citizenship = clientDto.Citizenship;
            client.ResidentialAddress = clientDto.ResidentialAddress;
            
            // Additional information
            client.MaritalStatus = clientDto.MaritalStatus;
            client.ChildrenInfo = clientDto.ChildrenInfo;
            client.EducationLevel = clientDto.EducationLevel;
            client.EmploymentInfo = clientDto.EmploymentInfo;
            client.IncomeDetails = clientDto.IncomeDetails;
            
            // For backward compatibility
            client.PassportData = clientDto.PassportData;
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
