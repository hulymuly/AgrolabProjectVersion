using AgroLab.DTOs.Potatoes;
using AgroLab.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroLab.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PotatoesController : ControllerBase
    {
        private readonly AgroLabDbContext _context;

        public PotatoesController(AgroLabDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetPotatoes(
            int? cultureId,
            int? reproductionId,
            string? customer,
            DateOnly? dateFrom,
            DateOnly? dateTo,
            string? sortBy,
            bool desc = false)
        {
            var query = _context.Potatoes
                .Include(p => p.Customer)
                .AsQueryable();

            if (cultureId.HasValue)
                query = query.Where(p => p.CultureId == cultureId.Value);

            if (reproductionId.HasValue)
                query = query.Where(p => p.ReproductionId == reproductionId.Value);

            if (!string.IsNullOrWhiteSpace(customer))
                query = query.Where(p => p.Customer != null && p.Customer.Name.Contains(customer, StringComparison.OrdinalIgnoreCase));

            if (dateFrom.HasValue)
                query = query.Where(p => p.UploadDate >= dateFrom.Value.ToDateTime(new TimeOnly(0, 0)));

            if (dateTo.HasValue)
                query = query.Where(p => p.UploadDate <= dateTo.Value.ToDateTime(new TimeOnly(23, 59)));

            var potatoes = await query.ToListAsync();
            var cultures = await _context.Cultures.ToDictionaryAsync(c => c.Id, c => c.Name);
            var reproductions = await _context.Reproductions.ToDictionaryAsync(r => r.Id, r => r.Name);

            var result = potatoes.Select(p => new
            {
                p.Id,
                CultureName = p.CultureId.HasValue && cultures.TryGetValue(p.CultureId.Value, out var cName) ? cName : "–",
                ReproductionName = p.ReproductionId.HasValue && reproductions.TryGetValue(p.ReproductionId.Value, out var rName) ? rName : "–",
                Customer = p.Customer?.Name ?? "–",
                p.UploadDate,
                p.SampleCode,
                p.TestObjectName,
                p.AcceptanceFile,
                p.Contract1c
            });

            result = (sortBy, desc) switch
            {
                ("uploadDate", true) => result.OrderByDescending(p => p.UploadDate),
                ("uploadDate", false) => result.OrderBy(p => p.UploadDate),
                ("customer", true) => result.OrderByDescending(p => p.Customer),
                ("customer", false) => result.OrderBy(p => p.Customer),
                ("culture", true) => result.OrderByDescending(p => p.CultureName),
                ("culture", false) => result.OrderBy(p => p.CultureName),
                ("reproduction", true) => result.OrderByDescending(p => p.ReproductionName),
                ("reproduction", false) => result.OrderBy(p => p.ReproductionName),
                _ => result.OrderByDescending(p => p.UploadDate)
            };

            return Ok(result.ToList());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Potato>> GetPotato(int id)
        {
            var potato = await _context.Potatoes.FindAsync(id);
            if (potato == null)
                return NotFound(new { message = "Образец картофеля не найден." });

            return Ok(potato);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePotato([FromBody] PotatoCreateDto dto)
        {
            var potato = new Potato
            {
                CultureId = dto.CultureId,
                ReproductionId = dto.ReproductionId,
                UploadDate = dto.UploadDate,
                AcceptanceFile = dto.AcceptanceFile,
                CustomerId = dto.CustomerId,
                Inn = dto.Inn,
                Kpp = dto.Kpp,
                TestBasis = dto.TestBasis,
                Contract1c = dto.Contract1c,
                SampleReceiptDate = dto.SampleReceiptDate,
                TestDuration = dto.TestDuration,
                TestObjectName = dto.TestObjectName,
                SampleCode = dto.SampleCode,
                SampleSelection = dto.SampleSelection,
                SamplingAct = dto.SamplingAct,
                SamplingNd = dto.SamplingNd,
                HarvestYear = dto.HarvestYear,
                SeedCategory = dto.SeedCategory,
                ResearchDirection = dto.ResearchDirection,
                SamplingPlan = dto.SamplingPlan,
                AdditionalInfo = dto.AdditionalInfo,
                TuberCount = dto.TuberCount,
                BatchNumber = dto.BatchNumber,
                BatchWeight = dto.BatchWeight,
                StorageLocation = dto.StorageLocation,
                ResultsDistribution = dto.ResultsDistribution,
                SampleStoragePeriod = dto.SampleStoragePeriod,
                DateContract = dto.DateContract
            };

            _context.Potatoes.Add(potato);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Образец картофеля успешно создан." });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePotato(int id, [FromBody] PotatoUpdateDto dto)
        {
            var potato = await _context.Potatoes.FindAsync(id);
            if (potato == null)
                return NotFound(new { message = "Образец картофеля не найден." });

            potato.CultureId = dto.CultureId;
            potato.ReproductionId = dto.ReproductionId;
            potato.UploadDate = dto.UploadDate;
            potato.AcceptanceFile = dto.AcceptanceFile;
            potato.CustomerId = dto.CustomerId;
            potato.Inn = dto.Inn;
            potato.Kpp = dto.Kpp;
            potato.TestBasis = dto.TestBasis;
            potato.Contract1c = dto.Contract1c;
            potato.SampleReceiptDate = dto.SampleReceiptDate;
            potato.TestDuration = dto.TestDuration;
            potato.TestObjectName = dto.TestObjectName;
            potato.SampleCode = dto.SampleCode;
            potato.SampleSelection = dto.SampleSelection;
            potato.SamplingAct = dto.SamplingAct;
            potato.SamplingNd = dto.SamplingNd;
            potato.HarvestYear = dto.HarvestYear;
            potato.SeedCategory = dto.SeedCategory;
            potato.ResearchDirection = dto.ResearchDirection;
            potato.SamplingPlan = dto.SamplingPlan;
            potato.AdditionalInfo = dto.AdditionalInfo;
            potato.TuberCount = dto.TuberCount;
            potato.BatchNumber = dto.BatchNumber;
            potato.BatchWeight = dto.BatchWeight;
            potato.StorageLocation = dto.StorageLocation;
            potato.ResultsDistribution = dto.ResultsDistribution;
            potato.SampleStoragePeriod = dto.SampleStoragePeriod;
            potato.DateContract = dto.DateContract;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Образец картофеля успешно обновлён." });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePotato(int id)
        {
            var potato = await _context.Potatoes.FindAsync(id);
            if (potato == null)
                return NotFound(new { message = "Образец картофеля не найден." });

            _context.Potatoes.Remove(potato);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Образец картофеля успешно удалён." });
        }
    }
}