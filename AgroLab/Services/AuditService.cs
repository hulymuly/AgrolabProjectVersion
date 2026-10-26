using AgroLab.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace AgroLab.Services
{
    public interface IAuditService
    {
        Task LogAsync(string tableName, int recordId, string action, object? oldData, object? newData);
        Task LogInsert(string tableName, int recordId, object? newData);
        Task LogUpdate(string tableName, int recordId, object? oldData, object? newData);
        Task LogDelete(string tableName, int recordId, object? oldData);
    }


    public class AuditService : IAuditService
    {
        private readonly AgroLabDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditService(AgroLabDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task LogAsync(string tableName, int recordId, string action, object? oldData, object? newData)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            int? userId = null;

            if (httpContext?.User?.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var parsedId))
                    userId = parsedId;
            }

            var log = new AuditLog
            {
                TableName = tableName,
                RecordId = recordId,
                Action = action,
                OldData = oldData != null ? JsonSerializer.Serialize(oldData) : null,
                NewData = newData != null ? JsonSerializer.Serialize(newData) : null,
                UserId = userId,
                Timestamp = DateTime.UtcNow
            };

            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        public Task LogInsert(string tableName, int recordId, object? newData)
            => LogAsync(tableName, recordId, "Insert", null, newData);

        public Task LogUpdate(string tableName, int recordId, object? oldData, object? newData)
            => LogAsync(tableName, recordId, "Update", oldData, newData);

        public Task LogDelete(string tableName, int recordId, object? oldData)
            => LogAsync(tableName, recordId, "Delete", oldData, null);
    }

}
