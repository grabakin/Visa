using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace VisaBack.Services
{
    /// <summary>
    /// Extracts placeholders from document files
    /// </summary>
    public class PlaceholderExtractor
    {
        private readonly ILogger<PlaceholderExtractor> _logger;
        private const string PlaceholderPattern = @"!\[(.*?)\]";

        public PlaceholderExtractor(ILogger<PlaceholderExtractor> logger)
        {
            _logger = logger;
        }


        /// <summary>
        /// Extracts placeholders from a document file (format: ![PlaceholderName])
        /// </summary>
        public async Task<List<string>> ExtractPlaceholdersAsync(string filePath)
        {
            var placeholders = new HashSet<string>();


            try
            {
                if (!File.Exists(filePath))
                {
                    _logger.LogError("File not found: {FilePath}", filePath);
                    return new List<string>();
                }

                string extension = Path.GetExtension(filePath).ToLowerInvariant();


                if (extension == ".docx")
                {
                    await ExtractFromDocxAsync(filePath, placeholders);
                }
                else
                {
                    // For text files
                    await ExtractFromTextFileAsync(filePath, placeholders);
                }


                _logger.LogInformation("Extracted {0} unique placeholders from {1}", placeholders.Count, filePath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting placeholders from file: {FilePath}", filePath);
            }


            return placeholders.ToList();
        }


        private async Task ExtractFromDocxAsync(string filePath, HashSet<string> placeholders)
        {
            using (var archive = ZipFile.OpenRead(filePath))
            {
                foreach (var entry in archive.Entries.Where(e => e.FullName.EndsWith(".xml", StringComparison.OrdinalIgnoreCase)))
                {
                    using (var stream = entry.Open())
                    using (var reader = new StreamReader(stream))
                    {
                        string xmlContent = await reader.ReadToEndAsync();
                        ExtractPlaceholdersFromText(xmlContent, placeholders);
                    }
                }
            }

            // If we couldn't find any placeholders, try the approach that strips XML tags

            if (placeholders.Count == 0)
            {
                await ExtractFromDocxWithXmlStrippingAsync(filePath, placeholders);
            }
        }


        private async Task ExtractFromDocxWithXmlStrippingAsync(string filePath, HashSet<string> placeholders)
        {
            string tempFile = Path.GetTempFileName();
            try
            {
                File.Copy(filePath, tempFile, true);
                using (var archive = ZipFile.OpenRead(tempFile))
                {
                    foreach (var entry in archive.Entries.Where(e => e.FullName.EndsWith(".xml", StringComparison.OrdinalIgnoreCase)))
                    {
                        using (var stream = entry.Open())
                        using (var reader = new StreamReader(stream))
                        {
                            string xmlContent = await reader.ReadToEndAsync();
                            // Remove all XML tags to get plain text
                            string plainText = Regex.Replace(xmlContent, "<[^>]*>", "");
                            ExtractPlaceholdersFromText(plainText, placeholders);
                        }
                    }
                }
            }
            finally
            {
                if (File.Exists(tempFile))
                {
                    File.Delete(tempFile);
                }
            }
        }


        private async Task ExtractFromTextFileAsync(string filePath, HashSet<string> placeholders)
        {
            string content = await File.ReadAllTextAsync(filePath);
            ExtractPlaceholdersFromText(content, placeholders);
        }


        private void ExtractPlaceholdersFromText(string text, HashSet<string> placeholders)
        {
            var regex = new Regex(PlaceholderPattern, RegexOptions.Compiled);
            var matches = regex.Matches(text);


            foreach (Match match in matches)
            {
                if (match.Groups.Count > 1)
                {
                    string placeholder = match.Groups[1].Value.Trim();
                    // Filter out any placeholders that contain XML tags
                    if (!placeholder.Contains("<") && !placeholder.Contains(">"))
                    {
                        placeholders.Add(placeholder);
                    }
                }
            }
        }
    }
}
