using Microsoft.AspNetCore.Mvc;
using AgroLab.DTOs.Notifications;
using AgroLab.Entities;
using Microsoft.EntityFrameworkCore;

namespace AgroLab.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly AgroLabDbContext _context;

        public NotificationsController(AgroLabDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotificationDto>>> GetNotifications()
        {
            var notifications = new List<NotificationDto>();
            var today = DateTime.Today;

            // 1. Реактивы - окончание срока годности
            var reagentsExpiringSoon = await _context.ChemicalParishes
                .Where(r => r.ExpirationDate != null &&
                            r.ExpirationDate.Value.ToDateTime(new TimeOnly(0, 0)) >= today &&
                            r.ExpirationDate.Value.ToDateTime(new TimeOnly(0, 0)) <= today.AddDays(30))
                .ToListAsync();

            foreach (var reagent in reagentsExpiringSoon)
            {
                notifications.Add(new NotificationDto
                {
                    Type = "ReagentExpiration",
                    Message = $"Реактив '{reagent.ReceivedFrom}' истекает {reagent.ExpirationDate?.ToDateTime(new TimeOnly(0, 0)).ToString("dd.MM.yyyy")}.",
                    RelatedDate = reagent.ExpirationDate?.ToDateTime(new TimeOnly(0, 0))
                });
            }

            // 2. Реактивы - малый остаток
            var allReagents = await _context.ChemicalParishes.ToListAsync();
            var allExpenses = await _context.ChemicalExpenses
                .GroupBy(e => e.ReagentId)
                .Select(g => new { ReagentId = g.Key, TotalUsed = g.Sum(e => e.QuantityUsed) })
                .ToListAsync();

            foreach (var reagent in allReagents)
            {
                var used = allExpenses.FirstOrDefault(e => e.ReagentId == reagent.ReagentId)?.TotalUsed ?? 0m;
                var remaining = reagent.QuantityReceived - used;

                if (reagent.QuantityReceived > 0)
                {
                    var percentageLeft = (remaining / reagent.QuantityReceived) * 100;

                    if (percentageLeft <= 10)
                    {
                        notifications.Add(new NotificationDto
                        {
                            Type = "LowStock",
                            Message = $"Остаток реактива '{reagent.ReceivedFrom}' ниже 10% (осталось {remaining} из {reagent.QuantityReceived}).",
                            RelatedDate = null
                        });
                    }
                }
            }

            // 3. Оборудование - необходимость поверки
            var equipmentNeedingInspection = await _context.Equipment
                .Where(e => e.NextInspectionDate != null &&
                            e.NextInspectionDate.Value.ToDateTime(new TimeOnly(0, 0)) >= today &&
                            e.NextInspectionDate.Value.ToDateTime(new TimeOnly(0, 0)) <= today.AddDays(30))
                .ToListAsync();

            foreach (var equipment in equipmentNeedingInspection)
            {
                notifications.Add(new NotificationDto
                {
                    Type = "EquipmentInspection",
                    Message = $"Оборудование '{equipment.Name}' требует поверки {equipment.NextInspectionDate?.ToDateTime(new TimeOnly(0, 0)).ToString("dd.MM.yyyy")}.",
                    RelatedDate = equipment.NextInspectionDate?.ToDateTime(new TimeOnly(0, 0))
                });
            }

            // 4. Образцы - окончание срока хранения
            notifications.AddRange(await GetSampleStorageNotifications());

            return Ok(notifications);
        }

        private async Task<List<NotificationDto>> GetSampleStorageNotifications()
        {
            var today = DateTime.Today;
            var notifications = new List<NotificationDto>();

            // plants
            var plants = await _context.Plants.ToListAsync();
            foreach (var plant in plants)
            {
                if (plant.SampleReceiptDate != null)
                {
                    var expirationDate = plant.SampleReceiptDate.Value.ToDateTime(new TimeOnly(0, 0)).AddMonths(6);
                    var daysLeft = (expirationDate - today).TotalDays;
                    if (daysLeft >= 7 && daysLeft <= 14)
                    {
                        notifications.Add(new NotificationDto
                        {
                            Type = "SampleExpiration",
                            Message = $"Срок хранения растения '{plant.SampleCode}' истекает {expirationDate:dd.MM.yyyy}.",
                            RelatedDate = expirationDate
                        });
                    }
                }
            }

            // potatoes
            var potatoes = await _context.Potatoes.ToListAsync();
            foreach (var potato in potatoes)
            {
                if (potato.SampleReceiptDate != null && !string.IsNullOrEmpty(potato.SampleStoragePeriod))
                {
                    var expirationDate = CalculateExpirationDate(potato.SampleReceiptDate.Value, potato.SampleStoragePeriod);
                    if (expirationDate != null)
                    {
                        var daysLeft = (expirationDate.Value - today).TotalDays;
                        if (daysLeft >= 7 && daysLeft <= 14)
                        {
                            notifications.Add(new NotificationDto
                            {
                                Type = "SampleExpiration",
                                Message = $"Срок хранения картофеля '{potato.SampleCode}' истекает {expirationDate.Value:dd.MM.yyyy}.",
                                RelatedDate = expirationDate
                            });
                        }
                    }
                }
            }

            // seeds
            var seeds = await _context.Seeds.ToListAsync();
            foreach (var seed in seeds)
            {
                if (seed.UploadDate != null && !string.IsNullOrEmpty(seed.AcceptanceFile))
                {
                    var expirationDate = seed.UploadDate.Value.AddMonths(6); // просто AddMonths к DateTime
                    var daysLeft = (expirationDate - today).TotalDays;
                    if (daysLeft >= 7 && daysLeft <= 14)
                    {
                        notifications.Add(new NotificationDto
                        {
                            Type = "SampleExpiration",
                            Message = $"Срок хранения семени истекает {expirationDate:dd.MM.yyyy}.",
                            RelatedDate = expirationDate
                        });
                    }
                }
            }

            // soil
            var soils = await _context.Soils.ToListAsync();
            foreach (var soil in soils)
            {
                if (soil.SampleReceiptDate != null && !string.IsNullOrEmpty(soil.SampleSelection))
                {
                    var expirationDate = soil.SampleReceiptDate.Value.ToDateTime(new TimeOnly(0, 0)).AddMonths(6);
                    var daysLeft = (expirationDate - today).TotalDays;
                    if (daysLeft >= 7 && daysLeft <= 14)
                    {
                        notifications.Add(new NotificationDto
                        {
                            Type = "SampleExpiration",
                            Message = $"Срок хранения пробы почвы истекает {expirationDate:dd.MM.yyyy}.",
                            RelatedDate = expirationDate
                        });
                    }
                }
            }

            return notifications;
        }

        private DateTime? CalculateExpirationDate(DateOnly receiptDate, string storagePeriod)
        {
            var receipt = receiptDate.ToDateTime(new TimeOnly(0, 0));

            if (storagePeriod.Contains("дней"))
            {
                var number = GetFirstNumberFromText(storagePeriod);
                return number.HasValue ? receipt.AddDays(number.Value) : null;
            }
            else if (storagePeriod.Contains("месяц"))
            {
                var number = GetFirstNumberFromText(storagePeriod);
                return number.HasValue ? receipt.AddMonths(number.Value) : null;
            }
            else
            {
                return null;
            }
        }

        private int? GetFirstNumberFromText(string text)
        {
            var digits = new string(text.Where(char.IsDigit).ToArray());
            if (int.TryParse(digits, out var number))
                return number;
            return null;
        }
    }
}
