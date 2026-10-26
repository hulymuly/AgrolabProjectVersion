using AgroLab.DTOs.Seeds;
using AgroLab.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroLab.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SeedsController : ControllerBase
    {
        private readonly AgroLabDbContext _context;

        public SeedsController(AgroLabDbContext context)
        {
            _context = context;
        }

        // GET: api/seeds
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Seed>>> GetSeeds(
            int? cultureId,
            int? reproductionId,
            DateOnly? dateFrom,
            DateOnly? dateTo,
            string? sortBy,
            bool desc = false)
        {
            var query = _context.Seeds
                .Include(s => s.Culture)
                .Include(s => s.Reproduction)
                .AsQueryable();

            if (cultureId.HasValue)
                query = query.Where(s => s.CultureId == cultureId.Value);

            if (reproductionId.HasValue)
                query = query.Where(s => s.ReproductionId == reproductionId.Value);

            if (dateFrom.HasValue)
                query = query.Where(s => s.UploadDate >= dateFrom.Value.ToDateTime(new TimeOnly(0, 0)));

            if (dateTo.HasValue)
                query = query.Where(s => s.UploadDate <= dateTo.Value.ToDateTime(new TimeOnly(23, 59)));

            // Сортировка
            query = (sortBy, desc) switch
            {
                ("uploadDate", true) => query.OrderByDescending(s => s.UploadDate),
                ("uploadDate", false) => query.OrderBy(s => s.UploadDate),
                ("culture", true) => query.OrderByDescending(s => s.Culture!.Name),
                ("culture", false) => query.OrderBy(s => s.Culture!.Name),
                ("reproduction", true) => query.OrderByDescending(s => s.Reproduction!.Name),
                ("reproduction", false) => query.OrderBy(s => s.Reproduction!.Name),
                _ => query.OrderByDescending(s => s.UploadDate)
            };

            return await query.ToListAsync();
        }

        // GET: api/seeds/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Seed>> GetSeed(int id)
        {
            var seed = await _context.Seeds
                .Include(s => s.Culture)
                .Include(s => s.Reproduction)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (seed == null)
                return NotFound(new { message = "Образец семян не найден." });

            return Ok(seed);
        }

        // POST: api/seeds
        [HttpPost]
        public async Task<IActionResult> CreateSeed([FromBody] SeedCreateDto dto)
        {
            var seed = new Seed
            {
                CultureId = dto.CultureId,
                ReproductionId = dto.ReproductionId,
                UploadDate = dto.UploadDate,
                AcceptanceFile = dto.AcceptanceFile
            };

            _context.Seeds.Add(seed);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Образец семян успешно создан." });
        }

        // PUT: api/seeds/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSeed(int id, [FromBody] SeedUpdateDto dto)
        {
            var seed = await _context.Seeds.FindAsync(id);
            if (seed == null)
                return NotFound(new { message = "Образец семян не найден." });

            seed.CultureId = dto.CultureId;
            seed.ReproductionId = dto.ReproductionId;
            seed.UploadDate = dto.UploadDate;
            seed.AcceptanceFile = dto.AcceptanceFile;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Образец семян успешно обновлён." });
        }

        // DELETE: api/seeds/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSeed(int id)
        {
            var seed = await _context.Seeds.FindAsync(id);
            if (seed == null)
                return NotFound(new { message = "Образец семян не найден." });

            _context.Seeds.Remove(seed);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Образец семян успешно удалён." });
        }
    }
}
