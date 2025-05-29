using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using VisaBack.Data;
using VisaBack.Models.DTOs;
using VisaBack.Models.Entities;
using VisaBack.Services;

namespace VisaBack.Controllers
{
    [Route("api/reports")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly VisaDbContext _context;
        private readonly ILogger<ReportController> _logger;
        private readonly IWebHostEnvironment _environment;
        private readonly DocumentGenerationService _documentGenerationService;
        private readonly DocxProcessor _docxProcessor;
        private readonly TemplateFieldGenerator _templateFieldGenerator;

        public ReportController(
            VisaDbContext context,
            DocumentGenerationService documentGenerationService,
            ILogger<ReportController> logger,
            IWebHostEnvironment environment,
            DocxProcessor docxProcessor,
            TemplateFieldGenerator templateFieldGenerator)
        {
            _context = context;
            _documentGenerationService = documentGenerationService;
            _logger = logger;
            _environment = environment;
            _docxProcessor = docxProcessor;
            _templateFieldGenerator = templateFieldGenerator;
        }

        [HttpGet]
        public async Task<ActionResult<List<ReportTemplateDto>>> GetTemplates()
        {
            try
            {
                var templates = await _context.ReportTemplates
                    .Select(t => new ReportTemplateDto
                    {
                        Id = t.Id,
                        Name = t.Name,
                        Description = t.Description,
                        TemplateType = t.TemplateType,
                        ThumbnailUrl = !string.IsNullOrEmpty(t.ThumbnailPath) 
                            ? $"/api/reports/thumbnail/{t.Id}" 
                            : null,
                        CreatedAt = t.CreatedAt
                    })
                    .ToListAsync();

                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting report templates");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ReportTemplateDto>> GetTemplate(int id)
        {
            try
            {
                var template = await _context.ReportTemplates
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (template == null)
                {
                    return NotFound();
                }

                var templateDto = new ReportTemplateDto
                {
                    Id = template.Id,
                    Name = template.Name,
                    Description = template.Description,
                    TemplateType = template.TemplateType,
                    ThumbnailUrl = !string.IsNullOrEmpty(template.ThumbnailPath)
                        ? $"/api/reports/thumbnail/{template.Id}"
                        : null,
                    CreatedAt = template.CreatedAt
                };

                return Ok(templateDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting report template {TemplateId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("generate")]
        public async Task<ActionResult<ReportResultDto>> GenerateReport([FromBody] GenerateReportDto generateDto)
        {
            try
            {
                if (generateDto == null)
                {
                    return BadRequest("Report generation data is required");
                }

                var result = await _documentGenerationService.GenerateReportAsync(generateDto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating report");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("download/{reportId}")]
        public async Task<IActionResult> DownloadReport(string reportId)
        {
            try
            {
                _logger.LogInformation("Attempting to download report with ID: {ReportId}", reportId);
                
                // Log the current directory structure
                _logger.LogInformation("Content root path: {ContentRootPath}", _environment.ContentRootPath);
                
                // First check in the Reports directory (without Generated subfolder)
                string reportsFolder = Path.Combine(_environment.ContentRootPath, "Reports");
                _logger.LogInformation("Looking for files in: {ReportsFolder}", reportsFolder);
                
                // Create the directory if it doesn't exist
                if (!Directory.Exists(reportsFolder))
                {
                    _logger.LogWarning("Reports directory does not exist, creating it now");
                    Directory.CreateDirectory(reportsFolder);
                }
                
                // Check if there are any files in the directory
                var allFiles = Directory.GetFiles(reportsFolder);
                _logger.LogInformation("Total files in Reports directory: {Count}", allFiles.Length);
                foreach (var file in allFiles)
                {
                    _logger.LogInformation("Found file: {FileName}", Path.GetFileName(file));
                }
                
                // Also check the root directory and other potential directories
                _logger.LogInformation("Checking for files in content root directory");
                foreach (var file in Directory.GetFiles(_environment.ContentRootPath))
                {
                    _logger.LogInformation("Root file: {FileName}", Path.GetFileName(file));
                }
                
                // Look for files with various patterns and extensions
                List<string> possibleFiles = new List<string>();
                
                // Check for exact report ID in filename
                _logger.LogInformation("Searching for files containing report ID: {ReportId}", reportId);
                
                // Check for .docx files
                var docxFiles = Directory.GetFiles(reportsFolder, $"*{reportId}*.docx");
                _logger.LogInformation("Found {Count} .docx files with report ID", docxFiles.Length);
                possibleFiles.AddRange(docxFiles);
                
                // Check for .txt files
                var txtFiles = Directory.GetFiles(reportsFolder, $"*{reportId}*.txt");
                _logger.LogInformation("Found {Count} .txt files with report ID", txtFiles.Length);
                possibleFiles.AddRange(txtFiles);
                
                // Check for files with any extension
                var anyFiles = Directory.GetFiles(reportsFolder, $"*{reportId}*");
                _logger.LogInformation("Found {Count} files with any extension containing report ID", anyFiles.Length);
                
                // Check the ReportResultDto format to see the actual filename pattern
                _logger.LogInformation("Checking ReportResultDto format for file naming pattern");
                
                // Fallback to the most recent file if no matches
                if (possibleFiles.Count == 0 && allFiles.Length > 0)
                {
                    _logger.LogWarning("No files match the report ID. Falling back to the most recent file");
                    possibleFiles.Add(allFiles.OrderByDescending(f => new FileInfo(f).CreationTime).First());
                }
                
                if (possibleFiles.Count == 0)
                {
                    _logger.LogWarning("No files found for report ID: {ReportId}", reportId);
                    return NotFound($"Report file not found for ID: {reportId}");
                }

                var filePath = possibleFiles[0];
                var fileName = Path.GetFileName(filePath);
                _logger.LogInformation("Selected file for download: {FileName}", fileName);
                
                var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
                _logger.LogInformation("File size: {Size} bytes", fileBytes.Length);
                
                // Determine content type based on file extension
                string contentType = Path.GetExtension(filePath).ToLowerInvariant() switch
                {
                    ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    ".doc" => "application/msword",
                    ".txt" => "text/plain",
                    _ => "application/octet-stream"
                };
                _logger.LogInformation("Content type: {ContentType}", contentType);

                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading report {ReportId}", reportId);
                return StatusCode(500, $"Error downloading report: {ex.Message}");
            }
        }

        [HttpGet("thumbnail/{id}")]
        public async Task<IActionResult> GetThumbnail(int id)
        {
            try
            {
                var template = await _context.ReportTemplates
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (template == null || string.IsNullOrEmpty(template.ThumbnailPath))
                {
                    return NotFound();
                }

                var thumbnailPath = template.ThumbnailPath;
                if (!Path.IsPathRooted(thumbnailPath))
                {
                    thumbnailPath = Path.Combine(_environment.ContentRootPath, thumbnailPath);
                }
                
                if (!System.IO.File.Exists(thumbnailPath))
                {
                    return NotFound("Thumbnail file not found");
                }

                var fileBytes = await System.IO.File.ReadAllBytesAsync(thumbnailPath);
                return File(fileBytes, "image/jpeg", Path.GetFileName(thumbnailPath));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting thumbnail for template {TemplateId}", id);
                return StatusCode(500, "Internal server error");
            }
        }
        
        [HttpPost("templates/upload")]
        public async Task<IActionResult> UploadTemplate([FromForm] IFormFile file, [FromForm] string name, [FromForm] string description, [FromForm] string templateType)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file was uploaded");
                }

                // Check if it's a docx file
                string fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (fileExtension != ".docx" && fileExtension != ".doc")
                {
                    return BadRequest("Only Word documents (.docx or .doc) are supported");
                }

                // Save the template file
                string templatesDir = Path.Combine(_environment.ContentRootPath, "Templates");
                Directory.CreateDirectory(templatesDir); // Ensure directory exists
                
                string uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
                string filePath = Path.Combine(templatesDir, uniqueFileName);
                
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Create a new template entity
                var template = new ReportTemplate
                {
                    Name = name,
                    Description = description,
                    TemplateType = templateType,
                    FilePath = Path.Combine("Templates", uniqueFileName),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.ReportTemplates.Add(template);
                await _context.SaveChangesAsync();

                // Create the response DTO
                var templateDto = new ReportTemplateDto
                {
                    Id = template.Id,
                    Name = template.Name,
                    Description = template.Description,
                    TemplateType = template.TemplateType,
                    CreatedAt = template.CreatedAt
                };

                return Ok(templateDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading template");
                return StatusCode(500, "Internal server error");
            }
        }
        
        [HttpGet("client-fields/{clientId}")]
        public async Task<ActionResult<Dictionary<string, string>>> GetClientFields(int clientId, int? orderId = null)
        {
            try
            {
                var client = await _context.Clients.FindAsync(clientId);
                if (client == null)
                {
                    return NotFound($"Client with ID {clientId} not found");
                }

                // Generate standard client fields
                var clientFields = _templateFieldGenerator.GenerateClientFields(client);

                // If order ID is provided, add order fields too
                if (orderId.HasValue)
                {
                    var order = await _context.Orders
                        .Include(o => o.Service)
                        .FirstOrDefaultAsync(o => o.Id == orderId.Value);
                        
                    if (order != null)
                    {
                        var orderFields = _templateFieldGenerator.GenerateOrderFields(order, client);
                        // Merge order fields into client fields
                        foreach (var field in orderFields)
                        {
                            // Don't override existing fields if they already exist
                            if (!clientFields.ContainsKey(field.Key))
                            {
                                clientFields[field.Key] = field.Value;
                            }
                        }
                    }
                }

                return Ok(clientFields);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting client fields for client {ClientId}", clientId);
                return StatusCode(500, "Internal server error");
            }
        }
        
        [HttpGet("placeholders/{id}")]
        public async Task<ActionResult<List<string>>> GetTemplatePlaceholders(int id)
        {
            try
            {
                var template = await _context.ReportTemplates
                    .FirstOrDefaultAsync(t => t.Id == id);
                
                if (template == null)
                {
                    return NotFound("Template not found");
                }

                var templatePath = template.FilePath;
                if (!Path.IsPathRooted(templatePath))
                {
                    templatePath = Path.Combine(_environment.ContentRootPath, templatePath);
                }

                if (!System.IO.File.Exists(templatePath))
                {
                    // Try to find the file in other locations
                    string[] possiblePaths = {
                        templatePath,
                        Path.Combine(_environment.ContentRootPath, templatePath),
                        Path.Combine(_environment.ContentRootPath, "Templates", Path.GetFileName(templatePath)),
                        "sample_template_with_placeholders.txt",
                        Path.Combine(_environment.ContentRootPath, "sample_template_with_placeholders.txt")
                    };
                    
                    templatePath = possiblePaths.FirstOrDefault(System.IO.File.Exists) ?? templatePath;
                    
                    if (!System.IO.File.Exists(templatePath))
                    {
                        return NotFound("Template file not found");
                    }
                }

                // Use DocxProcessor to extract placeholders from the template
                var placeholders = await _docxProcessor.ExtractPlaceholders(templatePath);
                return Ok(placeholders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting template placeholders");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
