using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.RegularExpressions;
using VisaBack.Data;
using VisaBack.Models.DTOs;
using VisaBack.Models.Entities;

namespace VisaBack.Services
{
    public class DocumentGenerationService
    {
        private readonly VisaDbContext _context;
        private readonly ILogger<DocumentGenerationService> _logger;
        private readonly IWebHostEnvironment _environment;
        private readonly DocxProcessor _docxProcessor;
        private readonly TemplateFieldGenerator _fieldGenerator;

        public DocumentGenerationService(
            VisaDbContext context, 
            ILogger<DocumentGenerationService> logger,
            IWebHostEnvironment environment,
            DocxProcessor docxProcessor,
            TemplateFieldGenerator fieldGenerator)
        {
            _context = context;
            _logger = logger;
            _environment = environment;
            _docxProcessor = docxProcessor;
            _fieldGenerator = fieldGenerator;
            
            // Create required directories at startup
            string reportsFolder = Path.Combine(_environment.ContentRootPath, "Reports");
            string generatedFolder = Path.Combine(reportsFolder, "Generated");
            
            Directory.CreateDirectory(reportsFolder);
            Directory.CreateDirectory(generatedFolder);
            
            _logger.LogInformation("Reports directories created at: {Path}", generatedFolder);
        }

        public async Task<ReportResultDto> GenerateReportAsync(GenerateReportDto generateDto)
        {
            try
            {
                // Find the template
                var template = await _context.ReportTemplates
                    .FirstOrDefaultAsync(t => t.Id == generateDto.TemplateId);
                
                if (template == null)
                {
                    throw new KeyNotFoundException($"Template with ID {generateDto.TemplateId} not found");
                }

                // Prepare field values from the form inputs
                Dictionary<string, string> fieldValues = new();

                // Add values from the form
                foreach (var field in generateDto.AdditionalFields)
                {
                    fieldValues[field.Key] = field.Value;
                }
                
                // If a client ID is specified, add client data
                if (generateDto.ClientId.HasValue)
                {
                    var client = await _context.Clients
                        .FirstOrDefaultAsync(c => c.Id == generateDto.ClientId.Value);
                    
                    if (client != null)
                    {
                        // Use the template field generator to add standardized client fields
                        var clientFields = _fieldGenerator.GenerateClientFields(client);
                        foreach (var field in clientFields)
                        {
                            fieldValues[field.Key] = field.Value;
                        }
                    }
                }
                
                // If an order ID is specified, add order data
                if (generateDto.OrderId.HasValue)
                {
                    var order = await _context.Orders
                        .Include(o => o.Service)
                        .FirstOrDefaultAsync(o => o.Id == generateDto.OrderId.Value);
                    
                    if (order != null)
                    {
                        // Use the template field generator for order fields
                        // If we have both client and order, pass the client to get combined fields
                        var client = generateDto.ClientId.HasValue ? 
                            await _context.Clients.FirstOrDefaultAsync(c => c.Id == generateDto.ClientId.Value) : null;
                            
                        var orderFields = _fieldGenerator.GenerateOrderFields(order, client);
                        foreach (var field in orderFields)
                        {
                            fieldValues[field.Key] = field.Value;
                        }
                    }
                }

                // Generate a unique report ID
                string reportId = Guid.NewGuid().ToString();
                
                // Process the template using DocxProcessor and include the reportId in the filename
                string reportPath = await ProcessTemplateAsync(template.FilePath, fieldValues, reportId);
                
                _logger.LogInformation("Generated report at path: {ReportPath} with ID: {ReportId}", reportPath, reportId);
                
                // Create the result
                var result = new ReportResultDto
                {
                    ReportId = reportId,
                    FileName = Path.GetFileName(reportPath),
                    DownloadUrl = $"/api/reports/download/{reportId}",
                    GeneratedAt = DateTime.UtcNow
                };
                
                _logger.LogInformation("Report result created with filename: {FileName}, download URL: {DownloadUrl}", 
                    result.FileName, result.DownloadUrl);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating report");
                throw;
            }
        }

        private async Task LoadClientData(int clientId, Dictionary<string, string> fieldValues)
        {
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.Id == clientId);

            if (client != null)
            {
                fieldValues["ClientName"] = client.FullName;
                fieldValues["ClientEmail"] = client.Email ?? string.Empty;
                fieldValues["ClientPhone"] = client.Phone ?? string.Empty;
                fieldValues["ClientPassport"] = client.PassportData ?? string.Empty;
                // Add more client fields as needed
            }
        }

        private async Task LoadOrderData(int orderId, Dictionary<string, string> fieldValues)
        {
            var order = await _context.Orders
                .Include(o => o.Service)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order != null)
            {
                fieldValues["OrderId"] = order.FormattedId;
                fieldValues["OrderDate"] = order.OrderDate.ToString("dd.MM.yyyy");
                fieldValues["OrderStatus"] = order.Status;
                fieldValues["OrderCost"] = order.Cost.ToString("N2");
                fieldValues["ServiceType"] = order.Service?.VisaType ?? string.Empty;
                // Add more order fields as needed
            }
        }

        private async Task<string> ProcessTemplateAsync(string templatePath, Dictionary<string, string> fieldValues, string reportId)
        {
            try
            {
                // Resolve template path to the actual file location
                if (!Path.IsPathRooted(templatePath))
                {
                    templatePath = Path.Combine(_environment.ContentRootPath, templatePath);
                }

                // Try to find the file in alternative locations if it doesn't exist
                if (!File.Exists(templatePath))
                {
                    string[] possiblePaths = {
                        templatePath,
                        Path.Combine(_environment.ContentRootPath, "Templates", Path.GetFileName(templatePath)),
                        Path.Combine(_environment.ContentRootPath, "sample_template.docx"),
                        Path.Combine(_environment.ContentRootPath, "sample_template_with_placeholders.txt")
                    };
                    
                    // Find the first existing file
                    foreach (var path in possiblePaths)
                    {
                        if (File.Exists(path))
                        {
                            templatePath = path;
                            break;
                        }
                    }
                }

                // Create output directory
                string reportsFolder = Path.Combine(_environment.ContentRootPath, "Reports");
                Directory.CreateDirectory(reportsFolder);
                
                // Check if the template file exists
                if (!File.Exists(templatePath))
                {
                    _logger.LogWarning("Template file not found: {TemplatePath}", templatePath);
                    
                    // Create a fallback sample template if file doesn't exist
                    string sampleFileName = $"sample_template_{DateTime.Now:yyyyMMdd_HHmmss}.txt";
                    string samplePath = Path.Combine(reportsFolder, sampleFileName);
                    
                    string sampleContent = @"
Sample Document Template
-----------------------

Client Information:
- Name: ![ClientName]
- Phone: ![ClientPhone]
- Email: ![ClientEmail]
- Passport: ![ClientPassport]
- Date of Birth: ![ClientBirthDate]

Order Information:
- Order Number: ![OrderNumber]
- Service: ![OrderService]
- Status: ![OrderStatus]
- Created: ![OrderDate]
- Price: ![OrderPrice]

Additional Information:
- Visa Type: ![VisaType]
- Entry Date: ![EntryDate]
- Duration: ![Duration]
- Purpose: ![Purpose]
";
                    await File.WriteAllTextAsync(samplePath, sampleContent);
                    templatePath = samplePath;
                }
                
                // Determine the file extension
                string fileExtension = Path.GetExtension(templatePath).ToLowerInvariant();
                string outputPath;
                
                // Make sure the reportId is included in the filename
                if (fileExtension == ".docx")
                {
                    // Use DocxProcessor for DOCX files with reportId included in the filename
                    string customFileName = $"report_{reportId}_{DateTime.Now:yyyyMMdd_HHmmss}.docx";
                    outputPath = await _docxProcessor.FillTemplate(templatePath, fieldValues, reportsFolder, customFileName);
                    _logger.LogInformation("Generated DOCX file with name: {FileName}", customFileName);
                }
                else
                {
                    // For text files, create a simple text file with replacements
                    string outputFileName = $"report_{reportId}_{DateTime.Now:yyyyMMdd_HHmmss}.txt";
                    outputPath = Path.Combine(reportsFolder, outputFileName);
                    _logger.LogInformation("Generated TXT file with name: {FileName}", outputFileName);
                    
                    // Read the template content
                    string content = await File.ReadAllTextAsync(templatePath);
                    
                    // Replace placeholders
                    foreach (var field in fieldValues)
                    {
                        string placeholder = $"![{field.Key}]";
                        content = content.Replace(placeholder, field.Value);
                    }
                    
                    // Write to output file
                    await File.WriteAllTextAsync(outputPath, content);
                }
                
                // Add a small delay to ensure file is properly written
                await Task.Delay(100);
                
                return outputPath;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing template: {TemplatePath}", templatePath);
                throw;
            }
        }
    }
}
