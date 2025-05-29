using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace VisaBack.Services
{
    /// <summary>
    /// Fills document templates by replacing placeholders with values
    /// </summary>
    public class DocxFiller
    {
        private readonly ILogger<DocxFiller> _logger;
        private readonly DocxContentProcessor _docxProcessor;
        private readonly TextContentProcessor _textProcessor;

        public DocxFiller(ILogger<DocxFiller> logger)
        {
            _logger = logger;
            _docxProcessor = new DocxContentProcessor(logger);
            _textProcessor = new TextContentProcessor();
        }

        /// <summary>
        /// Fills a template with data and returns the path to the generated file
        /// </summary>
        public async Task<string> FillTemplateAsync(
            string templatePath,
            Dictionary<string, string> placeholderValues,
            string outputDirectory,
            string customFileName = "")
        {
            try
            {
                // Debug output for diagnosing issues
                _logger.LogInformation($"Starting template fill for {templatePath}");
                _logger.LogInformation($"Placeholder count: {placeholderValues?.Count ?? 0}");
                
                if (placeholderValues != null)
                {
                    foreach (var placeholder in placeholderValues)
                    {
                        _logger.LogInformation($"Placeholder: '{placeholder.Key}' = '{placeholder.Value}'");
                    }
                }
                
                // Create output directory if it doesn't exist
                if (!Directory.Exists(outputDirectory))
                {
                    _logger.LogInformation($"Creating output directory: {outputDirectory}");
                    Directory.CreateDirectory(outputDirectory);
                }

                // Generate output filename
                string extension = Path.GetExtension(templatePath).ToLowerInvariant();
                string outputFileName = !string.IsNullOrEmpty(customFileName)
                    ? customFileName
                    : $"filled_{Path.GetFileNameWithoutExtension(templatePath)}_{DateTime.Now:yyyyMMdd_HHmmss}{extension}";
                    
                string outputPath = Path.Combine(outputDirectory, outputFileName);
                _logger.LogInformation($"Output file will be saved as: {outputPath}");

                // Copy the template to the output path first
                _logger.LogInformation("Copying template to output destination");
                File.Copy(templatePath, outputPath, true);

                // Ensure we have valid placeholder values before processing
                placeholderValues = placeholderValues ?? new Dictionary<string, string>();
                
                // Process the file based on its type
                if (extension == ".docx")
                {
                    _logger.LogInformation("Processing as DOCX document");
                    await _docxProcessor.ProcessFileAsync(outputPath, placeholderValues);
                }
                else
                {
                    _logger.LogInformation("Processing as text document");
                    await _textProcessor.ProcessFileAsync(outputPath, placeholderValues);
                }

                _logger.LogInformation("Template processing completed successfully");
                return outputPath;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error filling template: {TemplatePath}", templatePath);
                throw;
            }
        }
    }
}
