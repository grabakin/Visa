using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using VisaBack.Models.Entities;

namespace VisaBack.Services
{
    /// <summary>
    /// Generates standardized placeholder field values for client documents
    /// </summary>
    public class TemplateFieldGenerator
    {
        private readonly ILogger<TemplateFieldGenerator> _logger;

        public TemplateFieldGenerator(ILogger<TemplateFieldGenerator> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Generates a dictionary of standard client field values for placeholders
        /// </summary>
        /// <param name="client">The client data</param>
        /// <returns>Dictionary of field names and values</returns>
        public Dictionary<string, string> GenerateClientFields(Client client)
        {
            if (client == null)
            {
                _logger.LogWarning("Attempted to generate fields for null client");
                return new Dictionary<string, string>();
            }

            var fields = new Dictionary<string, string>
            {
                // Standard client fields
                { "FullName", client.FullName },
                { "ShortName", FormatShortName(client.FullName) },
                { "Passport", client.PassportData ?? "Нет данных" },
                { "BirthDate", client.BirthDate.HasValue ? client.BirthDate.Value.ToString("dd.MM.yyyy") : "Нет данных" },
                { "Email", client.Email ?? "Нет данных" },
                { "Phone", client.Phone ?? "Нет данных" },
                
                // Legacy field names for backward compatibility
                { "ClientName", client.FullName },
                { "Name", client.FullName },
            };

            _logger.LogInformation("Generated {0} template fields for client {1}", 
                fields.Count, client.FullName);
            
            return fields;
        }

        /// <summary>
        /// Generate fields for a client order
        /// </summary>
        public Dictionary<string, string> GenerateOrderFields(Order order, Client? client = null)
        {
            if (order == null)
            {
                _logger.LogWarning("Attempted to generate fields for null order");
                return new Dictionary<string, string>();
            }

            var fields = new Dictionary<string, string>
            {
                { "OrderId", order.Id.ToString() },
                { "OrderNumber", order.FormattedId ?? order.Id.ToString() },
                { "OrderDate", order.OrderDate.ToString("dd.MM.yyyy") },
                { "Status", order.Status ?? "Нет данных" },
                { "Service", order.Service != null ? $"{order.Service.Country} - {order.Service.VisaType}" : "Нет данных" },
                { "ServiceType", order.Service?.VisaType ?? "Нет данных" },
                { "Price", order.Cost.ToString("C") },
                { "Currency", "₽" },
            };

            // Add client fields if client is provided
            if (client != null)
            {
                var clientFields = GenerateClientFields(client);
                foreach (var field in clientFields)
                {
                    fields[field.Key] = field.Value;
                }
            }

            _logger.LogInformation("Generated {0} template fields for order {1}", 
                fields.Count, order.Id);
            
            return fields;
        }

        /// <summary>
        /// Formats a full name into short format (Last name + initials)
        /// Example: "Петрова Анна Сергеевна" -> "Петрова А.С."
        /// </summary>
        private string FormatShortName(string fullName)
        {
            if (string.IsNullOrEmpty(fullName))
                return string.Empty;

            var parts = fullName.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 1)
                return parts[0];

            string lastName = parts[0];
            string initials = string.Join(".", parts.Skip(1).Select(n => n.FirstOrDefault() + "."));

            return $"{lastName} {initials}";
        }
    }
}
