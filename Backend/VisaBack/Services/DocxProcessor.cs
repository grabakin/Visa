using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VisaBack.Services
{
    /// <summary>
    /// Main facade for document processing operations
    /// </summary>
    public class DocxProcessor
    {
        private readonly ILogger<DocxProcessor> _logger;
        private readonly PlaceholderExtractor _placeholderExtractor;
        private readonly DocxFiller _docxFiller;

        public DocxProcessor(ILogger<DocxProcessor> logger, ILoggerFactory loggerFactory)
        {
            _logger = logger;
            _placeholderExtractor = new PlaceholderExtractor(loggerFactory.CreateLogger<PlaceholderExtractor>());
            _docxFiller = new DocxFiller(loggerFactory.CreateLogger<DocxFiller>());
        }

        /// <summary>
        /// Extracts placeholders from a document file (format: ![PlaceholderName])
        /// </summary>
        public async Task<List<string>> ExtractPlaceholders(string filePath)
        {
            return await _placeholderExtractor.ExtractPlaceholdersAsync(filePath);
        }

        /// <summary>
        /// Fills a template with data and returns the path to the generated file
        /// </summary>
        /// <param name="templatePath">Path to the template file</param>
        /// <param name="placeholderValues">Dictionary of placeholder values to replace</param>
        /// <param name="outputDirectory">Directory where the output file will be saved</param>
        /// <param name="customFileName">Optional custom filename for the output file</param>
        /// <returns>Path to the generated file</returns>
        public async Task<string> FillTemplate(string templatePath, Dictionary<string, string> placeholderValues, 
            string outputDirectory, string customFileName = "")
        {
            return await _docxFiller.FillTemplateAsync(templatePath, placeholderValues, outputDirectory, customFileName);
        }
    }
}
