using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using VisaBack.Data;
using VisaBack.Models.Entities;

namespace VisaBack.Services
{
    public class IdGeneratorService
    {
        private readonly VisaDbContext _context;

        // Define entity type prefixes
        private const string CLIENT_PREFIX = "CL";
        private const string ORDER_PREFIX = "OR";
        private const string SERVICE_PREFIX = "SRV";
        private const string DOCUMENT_PREFIX = "DOC";
        private const string USER_PREFIX = "USR";
        private const string WORKER_PREFIX = "WRK";

        // Initial counter value
        private const int INITIAL_COUNTER = 1001;

        public IdGeneratorService(VisaDbContext context)
        {
            _context = context;
        }

        // Client ID generation
        public async Task<string> GenerateClientId()
        {
            // Get the highest client ID
            var lastClient = await _context.Clients
                .OrderByDescending(c => c.Id)
                .FirstOrDefaultAsync();

            return GenerateFormattedIdFromEntity(CLIENT_PREFIX, lastClient?.FormattedId, INITIAL_COUNTER);
        }

        // Order ID generation
        public async Task<string> GenerateOrderId()
        {
            var lastOrder = await _context.Orders
                .OrderByDescending(o => o.Id)
                .FirstOrDefaultAsync();

            return GenerateFormattedIdFromEntity(ORDER_PREFIX, lastOrder?.FormattedId, INITIAL_COUNTER);
        }

        // Service ID generation
        public async Task<string> GenerateServiceId()
        {
            var lastService = await _context.Services
                .OrderByDescending(s => s.Id)
                .FirstOrDefaultAsync();

            return GenerateFormattedIdFromEntity(SERVICE_PREFIX, lastService?.FormattedId, INITIAL_COUNTER);
        }

        // Document ID generation
        public async Task<string> GenerateDocumentId()
        {
            var lastDocument = await _context.Documents
                .OrderByDescending(d => d.Id)
                .FirstOrDefaultAsync();

            return GenerateFormattedIdFromEntity(DOCUMENT_PREFIX, lastDocument?.FormattedId, INITIAL_COUNTER);
        }

        // User ID generation
        public async Task<string> GenerateUserId()
        {
            var lastUser = await _context.Users
                .OrderByDescending(u => u.Id)
                .FirstOrDefaultAsync();

            return GenerateFormattedIdFromEntity(USER_PREFIX, lastUser?.FormattedId, INITIAL_COUNTER);
        }

        // Worker ID generation
        public async Task<string> GenerateWorkerId()
        {
            var lastWorker = await _context.Workers
                .OrderByDescending(w => w.Id)
                .FirstOrDefaultAsync();

            return GenerateFormattedIdFromEntity(WORKER_PREFIX, lastWorker?.FormattedId, INITIAL_COUNTER);
        }

        // Helper method for generating formatted IDs
        private string GenerateFormattedIdFromEntity(string prefix, string lastFormattedId, int initialCounter)
        {
            int counter = initialCounter;

            if (!string.IsNullOrEmpty(lastFormattedId) && lastFormattedId.StartsWith(prefix))
            {
                // Try to extract the numeric part
                if (int.TryParse(lastFormattedId.Substring(prefix.Length + 1), out int lastCounter))
                {
                    counter = lastCounter + 1; // Use the number from the last FormattedId + 1
                }
            }

            // Format: PREFIX-XXXX (e.g., CL-1001)
            return $"{prefix}-{counter}";
        }
    }
}