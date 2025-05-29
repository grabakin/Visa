using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using VisaBack.Data;
using VisaBack.Models.DTOs;
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
        private readonly ILogger<DocumentController> _logger;

        public DocumentController(VisaDbContext context, IdGeneratorService idGenerator, ILogger<DocumentController> logger)
        {
            _context = context;
            _idGenerator = idGenerator;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<List<DocumentDto>>> GetDocuments()
        {
            var documents = await _context.Documents
                .Include(d => d.Client)
                .Include(d => d.Order)
                .ToListAsync();

            return Ok(documents.Select(MapToDto));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DocumentDto>> GetDocumentById(int id)
        {
            var document = await _context.Documents
                .Include(d => d.Client)
                .Include(d => d.Order)
                .FirstOrDefaultAsync(d => d.Id == id);
                
            if (document is null)
                return NotFound();
                
            return Ok(MapToDto(document));
        }

        [HttpGet("client/{clientId}")]
        public async Task<ActionResult<List<DocumentDto>>> GetDocumentsByClient(int clientId)
        {
            var documents = await _context.Documents
                .Include(d => d.Client)
                .Include(d => d.Order)
                .Where(d => d.ClientId == clientId)
                .ToListAsync();
                
            return Ok(documents.Select(MapToDto));
        }

        [HttpGet("order/{orderId}")]
        public async Task<ActionResult<List<DocumentDto>>> GetDocumentsByOrder(int orderId)
        {
            var documents = await _context.Documents
                .Include(d => d.Client)
                .Include(d => d.Order)
                .Where(d => d.OrderId == orderId)
                .ToListAsync();
                
            return Ok(documents.Select(MapToDto));
        }

        [HttpPost]
        public async Task<ActionResult<DocumentDto>> AddNewDocument([FromBody] DocumentUploadDto uploadDto)
        {
            if (uploadDto is null)
                return BadRequest("Document data is required");
            
            try
            {
                // Create new document
                var document = new Document
                {
                    ClientId = uploadDto.ClientId,
                    OrderId = uploadDto.OrderId,
                    DocType = uploadDto.DocType,
                    DocFile = uploadDto.DocFile,
                    FileName = uploadDto.FileName,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                // Generate formatted ID
                document.FormattedId = await _idGenerator.GenerateDocumentId();
                
                _context.Documents.Add(document);
                await _context.SaveChangesAsync();

                // Get the complete document with navigation properties
                var savedDocument = await _context.Documents
                    .Include(d => d.Client)
                    .Include(d => d.Order)
                    .FirstOrDefaultAsync(d => d.Id == document.Id);

                return CreatedAtAction(nameof(GetDocumentById), new { id = document.Id }, MapToDto(savedDocument!));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while adding document");
                return StatusCode(500, "An error occurred while processing your request");
            }
        }

        [HttpPost("upload")]
        [RequestFormLimits(MultipartBodyLengthLimit = 20971520)] // 20MB
        [RequestSizeLimit(20971520)] // 20MB
        public async Task<ActionResult<DocumentDto>> UploadDocument([FromForm] IFormFile file, [FromForm] int? clientId = null, [FromForm] int? orderId = null, [FromForm] string? docType = null)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is required");

            try
            {
                // Read file into byte array
                using var memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream);
                var fileBytes = memoryStream.ToArray();

                // Create new document
                var document = new Document
                {
                    ClientId = clientId,
                    OrderId = orderId,
                    DocType = docType ?? "Другое",
                    DocFile = fileBytes,
                    FileName = file.FileName,
                    FormattedId = await _idGenerator.GenerateDocumentId(),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Documents.Add(document);
                await _context.SaveChangesAsync();

                // Get the complete document with navigation properties
                var savedDocument = await _context.Documents
                    .Include(d => d.Client)
                    .Include(d => d.Order)
                    .FirstOrDefaultAsync(d => d.Id == document.Id);

                return CreatedAtAction(nameof(GetDocumentById), new { id = document.Id }, MapToDto(savedDocument!));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while uploading document");
                return StatusCode(500, "An error occurred while processing your request");
            }
        }

        [HttpPost("import")]
        [RequestFormLimits(MultipartBodyLengthLimit = 100 * 1024 * 1024)] // 100MB for batch uploads
        [RequestSizeLimit(100 * 1024 * 1024)] // 100MB for batch uploads
        public async Task<ActionResult<List<DocumentDto>>> ImportDocuments([FromForm] List<IFormFile> files, [FromForm] int? clientId = null, [FromForm] int? orderId = null, [FromForm] string? docType = null)
        {
            if (files == null || !files.Any())
                return BadRequest("At least one file is required");

            if (files.Count > 20)
                return BadRequest("Maximum 20 files can be uploaded at once");

            var results = new List<DocumentDto>();
            var failedUploads = new List<string>();

            foreach (var file in files)
            {
                try
                {
                    // Read file into byte array
                    using var memoryStream = new MemoryStream();
                    await file.CopyToAsync(memoryStream);
                    var fileBytes = memoryStream.ToArray();

                    // Create new document
                    var document = new Document
                    {
                        ClientId = clientId,
                        OrderId = orderId,
                        DocType = docType ?? "Другое",
                        DocFile = fileBytes,
                        FileName = file.FileName,
                        FormattedId = await _idGenerator.GenerateDocumentId(),
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Documents.Add(document);
                    await _context.SaveChangesAsync();

                    // Get the complete document with navigation properties
                    var savedDocument = await _context.Documents
                        .Include(d => d.Client)
                        .Include(d => d.Order)
                        .FirstOrDefaultAsync(d => d.Id == document.Id);

                    results.Add(MapToDto(savedDocument!));
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while importing document {FileName}", file.FileName);
                    failedUploads.Add(file.FileName);
                }
            }

            if (failedUploads.Any())
            {
                return StatusCode(207, new { 
                    Message = "Some documents failed to upload", 
                    SuccessfulUploads = results, 
                    FailedUploads = failedUploads 
                });
            }

            return Ok(results);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDocument(int id, [FromBody] DocumentUploadDto updateDto)
        {
            var document = await _context.Documents.FindAsync(id);
            if (document is null)
                return NotFound();
            
            try
            {
                // Update document properties
                document.ClientId = updateDto.ClientId;
                document.OrderId = updateDto.OrderId;
                document.DocType = updateDto.DocType;
                document.FileName = updateDto.FileName ?? document.FileName;
                
                // Only update the file if a new one is provided
                if (updateDto.DocFile != null && updateDto.DocFile.Length > 0)
                {
                    document.DocFile = updateDto.DocFile;
                }
                
                document.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating document");
                return StatusCode(500, "An error occurred while processing your request");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var document = await _context.Documents.FindAsync(id);
            if (document is null)
                return NotFound();

            try
            {
                _context.Documents.Remove(document);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting document");
                return StatusCode(500, "An error occurred while processing your request");
            }
        }

        // Helper method to map Document entity to DocumentDto
        private DocumentDto MapToDto(Document document)
        {
            return new DocumentDto
            {
                Id = document.Id,
                FormattedId = document.FormattedId,
                ClientId = document.ClientId,
                OrderId = document.OrderId,
                DocType = document.DocType,
                DocFile = document.DocFile,
                FileName = document.FileName,
                CreatedAt = document.CreatedAt,
                UpdatedAt = document.UpdatedAt,
                ClientName = document.Client?.FullName,
                OrderNumber = document.Order?.FormattedId
            };
        }
    }
}
