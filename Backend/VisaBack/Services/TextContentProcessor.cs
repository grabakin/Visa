using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace VisaBack.Services
{
    /// <summary>
    /// Handles plain text file processing for placeholder replacement
    /// </summary>
    public class TextContentProcessor
    {
        public async Task ProcessFileAsync(string filePath, Dictionary<string, string> placeholderValues)
        {
            if (placeholderValues == null || string.IsNullOrEmpty(filePath))
                return;
                
            try
            {
                // Read file content with encoding that supports Cyrillic
                string content;
                using (var reader = new StreamReader(filePath, Encoding.UTF8))
                {
                    content = await reader.ReadToEndAsync();
                }
                
                bool modified = false;
                
                // Method 1: Direct replacement
                foreach (var placeholder in placeholderValues)
                {
                    if (string.IsNullOrEmpty(placeholder.Key))
                        continue;
                        
                    string pattern = $"![{placeholder.Key}]";
                    if (content.Contains(pattern))
                    {
                        content = content.Replace(pattern, placeholder.Value ?? string.Empty);
                        modified = true;
                    }
                }
                
                // Method 2: Use regex for more flexible matching
                foreach (var placeholder in placeholderValues)
                {
                    if (string.IsNullOrEmpty(placeholder.Key))
                        continue;
                    
                    // More flexible pattern matching using regex
                    var regex = new Regex($@"!\[\s*{Regex.Escape(placeholder.Key)}\s*\]");
                    if (regex.IsMatch(content))
                    {
                        content = regex.Replace(content, placeholder.Value ?? string.Empty);
                        modified = true;
                    }
                }
                
                // Write updated content back to file with proper encoding
                if (modified)
                {
                    using (var writer = new StreamWriter(filePath, false, Encoding.UTF8))
                    {
                        await writer.WriteAsync(content);
                    }
                }
            }
            catch (Exception ex)
            {
                // Since this class doesn't have a logger, we'll just rethrow
                // The calling class (DocxFiller) will log the exception
                throw;
            }
        }
    }
}
