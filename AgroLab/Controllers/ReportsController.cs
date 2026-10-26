using AgroLab.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroLab.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly AgroLabDbContext _context;

        public ReportsController(AgroLabDbContext context)
        {
            _context = context;
        }

        // GET: api/reports/popularity
        [HttpGet("popularity")]
        public async Task<IActionResult> GetPopularityReport()
        {
            var popularReagents = await _context.ChemicalExpenses
                .GroupBy(x => x.ReagentId)
                .Select(g => new
                {
                    ReagentId = g.Key,
                    TotalUsed = g.Sum(x => x.QuantityUsed)
                })
                .OrderByDescending(x => x.TotalUsed)
                .ToListAsync();

            return Ok(popularReagents);
        }

        // GET: api/reports/comparison
        [HttpGet("comparison")]
        public async Task<IActionResult> GetComparisonReport()
        {
            var comparisonData = new
            {
                SeedsCount = await _context.Seeds.CountAsync(),
                PotatoesCount = await _context.Potatoes.CountAsync(),
                SoilCount = await _context.Soils.CountAsync(),
                PlantsCount = await _context.Plants.CountAsync()
            };

            return Ok(comparisonData);
        }
        // GET: api/reports/reagents/stock
        [HttpGet("reagents/stock")]
        public async Task<IActionResult> GetReagentsStock()
        {
            var reagents = await _context.ChemicalParishes
                .Include(p => p.Reagent)
                .ToListAsync();

            var expenses = await _context.ChemicalExpenses
                .GroupBy(e => e.ReagentId)
                .Select(g => new
                {
                    ReagentId = g.Key,
                    Used = g.Sum(e => e.QuantityUsed)
                })
                .ToDictionaryAsync(g => g.ReagentId ?? 0, g => g.Used);

            var grouped = reagents
                .GroupBy(r => r.ReagentId)
                .Select(g =>
                {
                    var reagentId = g.Key ?? 0;
                    var reagentName = g.FirstOrDefault()?.Reagent?.Name ?? "–";
                    var received = g.Sum(x => x.QuantityReceived);
                    var used = expenses.ContainsKey(reagentId) ? expenses[reagentId] : 0;
                    var remaining = received - used;

                    return new
                    {
                        Reagent = reagentName,
                        Received = Math.Round(received, 2),
                        Used = Math.Round(used, 2),
                        Remaining = Math.Round(remaining, 2)
                    };
                })
                .OrderBy(r => r.Reagent)
                .ToList();

            return Ok(grouped);
        }
        // GET: api/reports/cultures/popularity
        [HttpGet("cultures/popularity")]
        public async Task<IActionResult> GetCulturePopularity()
        {
            var seeds = await _context.Seeds
                .GroupBy(s => s.CultureId)
                .Select(g => new { CultureId = g.Key, Count = g.Count() })
                .ToListAsync();

            var potatoes = await _context.Potatoes
                .GroupBy(p => p.CultureId)
                .Select(g => new { CultureId = g.Key, Count = g.Count() })
                .ToListAsync();

            var soil = await _context.Soils
                .GroupBy(s => s.CultureId)
                .Select(g => new { CultureId = g.Key, Count = g.Count() })
                .ToListAsync();

            var plants = await _context.Plants
                .GroupBy(p => p.CultureId)
                .Select(g => new { CultureId = g.Key, Count = g.Count() })
                .ToListAsync();

            var combined = seeds
                .Concat(potatoes)
                .Concat(soil)
                .Concat(plants)
                .GroupBy(x => x.CultureId)
                .Select(g => new
                {
                    CultureId = g.Key,
                    Total = g.Sum(x => x.Count)
                })
                .ToList();

            var cultures = await _context.Cultures
                .ToDictionaryAsync(c => c.Id, c => c.Name);

            var result = combined.Select(x => new
            {
                Culture = x.CultureId.HasValue && cultures.ContainsKey(x.CultureId.Value)
                    ? cultures[x.CultureId.Value]
                    : "–",
                Count = x.Total
            })
            .OrderByDescending(x => x.Count)
            .ToList();

            return Ok(result);
        }
        // GET: api/reports/expired
        [HttpGet("expired")]
        public async Task<IActionResult> GetExpiredItems()
        {
            var today = DateTime.Today;

            // Просроченные реактивы
            var expiredReagents = await _context.ChemicalParishes
                .Where(r => r.ExpirationDate != null && r.ExpirationDate < DateOnly.FromDateTime(today))
                .Include(r => r.Reagent)
                .Select(r => new
                {
                    Type = "Reagent",
                    Name = r.Reagent!.Name,
                    ExpiredOn = r.ExpirationDate.Value.ToDateTime(new TimeOnly(0, 0))
                })
                .ToListAsync();

            // Просроченная поверка оборудования
            var expiredEquipment = await _context.Equipment
                .Where(e => e.NextInspectionDate != null && e.NextInspectionDate < DateOnly.FromDateTime(today))
                .Select(e => new
                {
                    Type = "Equipment",
                    Name = e.Name,
                    ExpiredOn = e.NextInspectionDate.Value.ToDateTime(new TimeOnly(0, 0))
                })
                .ToListAsync();

            // Просроченные образцы (6 месяцев с даты приёма)
            var expiredSamples = new List<dynamic>();

            var plants = await _context.Plants.ToListAsync();
            expiredSamples.AddRange(plants
                .Where(p => p.SampleReceiptDate != null &&
                            p.SampleReceiptDate.Value.AddMonths(6).ToDateTime(new TimeOnly(0, 0)) < today)
                .Select(p => new
                {
                    Type = "Plant Sample",
                    Name = p.SampleCode ?? "–",
                    ExpiredOn = p.SampleReceiptDate.Value.AddMonths(6).ToDateTime(new TimeOnly(0, 0))
                }));

            var potatoes = await _context.Potatoes.ToListAsync();
            expiredSamples.AddRange(potatoes
                .Where(p => p.SampleReceiptDate != null &&
                            p.SampleReceiptDate.Value.AddMonths(6).ToDateTime(new TimeOnly(0, 0)) < today)
                .Select(p => new
                {
                    Type = "Potato Sample",
                    Name = p.SampleCode ?? "–",
                    ExpiredOn = p.SampleReceiptDate.Value.AddMonths(6).ToDateTime(new TimeOnly(0, 0))
                }));

            var soil = await _context.Soils.ToListAsync();
            expiredSamples.AddRange(soil
                .Where(s => s.SampleReceiptDate != null &&
                            s.SampleReceiptDate.Value.AddMonths(6).ToDateTime(new TimeOnly(0, 0)) < today)
                .Select(s => new
                {
                    Type = "Soil Sample",
                    Name = s.SamplingAct ?? "–",
                    ExpiredOn = s.SampleReceiptDate.Value.AddMonths(6).ToDateTime(new TimeOnly(0, 0))
                }));

            var allExpired = expiredReagents
                .Concat(expiredEquipment)
                .Concat(expiredSamples)
                .OrderBy(x => x.ExpiredOn)
                .ToList();

            return Ok(allExpired);
        }

    }
}
