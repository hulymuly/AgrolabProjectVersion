using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;
using AgroLab.Entities;

namespace AgroLab.Filters
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class LogActionAttribute : Attribute, IAsyncActionFilter
    {
        private readonly string _action;

        public LogActionAttribute(string action)
        {
            _action = action;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            // Выполняем действие (метод контроллера)
            var resultContext = await next();

            var dbContext = context.HttpContext.RequestServices.GetService(typeof(AgroLabDbContext)) as AgroLabDbContext;
            if (dbContext == null)
                return;

            int? userId = null;
            var user = context.HttpContext.User;

            if (user.Identity?.IsAuthenticated == true)
            {
                var claim = user.FindFirst(ClaimTypes.NameIdentifier);
                if (claim != null && int.TryParse(claim.Value, out int id))
                    userId = id;
            }

            var log = new Log
            {
                UserId = userId,
                Action = _action,
                Timestamp = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified) 
            };

            dbContext.Logs.Add(log);
            await dbContext.SaveChangesAsync();
        }
    }
}
