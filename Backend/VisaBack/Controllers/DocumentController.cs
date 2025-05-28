using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisaBack.Data;
using VisaBack.Models.Entities;
using VisaBack.Services;

namespace VisaBack.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentController : ControllerBase
    {
        private readonly VisaDbContext _context;
        private readonly IdGeneratorService _idGenerator;

        public DocumentController(VisaDbContext context, IdGeneratorService idGenerator)
        {
            _context = context;
            _idGenerator = idGenerator;
        }

        [HttpGet]
        public async Task<ActionResult<List<Document>>> GetDocuments()
        {
            return Ok(await _context.Documents
                .Include(d => d.Client)
                .Include(d => d.Order)
                .ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Document>> GetDocumentById(int id)
        {
            var document = await _context.Documents
                .Include(d => d.Client)
                .Include(d => d.Order)
                .FirstOrDefaultAsync(d => d.Id == id);
                
            if (document is null)
                return NotFound();
                
            return Ok(document);
        }

        [HttpGet("client/{clientId}")]
        public async Task<ActionResult<List<Document>>> GetDocumentsByClient(int clientId)
        {
            var documents = await _context.Documents
                .Where(d => d.ClientId == clientId)
                .ToListAsync();
                
            return Ok(documents);
        }

        [HttpGet("order/{orderId}")]
        public async Task<ActionResult<List<Document>>> GetDocumentsByOrder(int orderId)
        {
            var documents = await _context.Documents
                .Where(d => d.OrderId == orderId)
                .ToListAsync();
                
            return Ok(documents);
        }

        [HttpPost]
        public async Task<ActionResult<Document>> AddNewDocument(Document newDocument)
        {
            if (newDocument is null)
                return BadRequest();
                
            // Generate formatted ID
            newDocument.FormattedId = await _idGenerator.GenerateDocumentId();
                
            _context.Documents.Add(newDocument);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDocumentById), new { id = newDocument.Id }, newDocument);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDocument(int id, Document updatedDocument)
        {
            var document = await _context.Documents.FindAsync(id);
            if (document is null)
                return NotFound();
            
            document.ClientId = updatedDocument.ClientId;
            document.OrderId = updatedDocument.OrderId;
            document.DocType = updatedDocument.DocType;
            document.DocFile = updatedDocument.DocFile;
            document.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var document = await _context.Documents.FindAsync(id);
            if (document is null)
                return NotFound();

            _context.Documents.Remove(document);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
