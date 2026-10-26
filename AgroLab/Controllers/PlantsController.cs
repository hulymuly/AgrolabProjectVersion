using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AgroLab.Entities;

namespace AgroLab.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PlantsController : ControllerBase
    {
        private readonly AgroLabDbContext _context;

        public PlantsController(AgroLabDbContext context)
        {
            _context = context;
        }

        // GET: api/plants
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Plant>>> GetPlants(
            int? cultureId,
            string? customer,
            DateOnly? dateFrom,
            DateOnly? dateTo,
            string? sortBy,
            bool desc = false)
        {
            var query = _context.Plants
                .Include(p => p.Culture)
                .Include(p => p.Customer)
                .AsQueryable();

            if (cultureId.HasValue)
                query = query.Where(p => p.CultureId == cultureId.Value);

            if (!string.IsNullOrWhiteSpace(customer))
                query = query.Where(p => p.Customer != null && p.Customer.Name.ToLower().Contains(customer.ToLower()));

            if (dateFrom.HasValue)
            {
                var from = dateFrom.Value.ToDateTime(new TimeOnly(0, 0));
                query = query.Where(p => p.UploadDate >= from);
            }

            if (dateTo.HasValue)
            {
                var to = dateTo.Value.ToDateTime(new TimeOnly(23, 59));
                query = query.Where(p => p.UploadDate <= to);
            }

            // Сортировка
            query = (sortBy, desc) switch
            {
                ("uploadDate", true) => query.OrderByDescending(p => p.UploadDate),
                ("uploadDate", false) => query.OrderBy(p => p.UploadDate),
                ("customer", true) => query.OrderByDescending(p => p.Customer != null ? p.Customer.Name : null),
                ("customer", false) => query.OrderBy(p => p.Customer != null ? p.Customer.Name : null),
                ("sampleCode", true) => query.OrderByDescending(p => p.SampleCode),
                ("sampleCode", false) => query.OrderBy(p => p.SampleCode),
                _ => query.OrderByDescending(p => p.UploadDate)
            };

            return await query.ToListAsync();
        }

        // GET: api/plants/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Plant>> GetPlant(int id)
        {
            var plant = await _context.Plants
                .Include(p => p.Culture)
                .Include(p => p.Customer)
                .FirstOrDefaultAsync(p => p.Id == id);

            return plant == null ? NotFound() : Ok(plant);
        }

        // POST: api/plants
        [HttpPost]
        public async Task<ActionResult<Plant>> CreatePlant(Plant plant)
        {
            _context.Plants.Add(plant);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPlant), new { id = plant.Id }, plant);
        }

        // PUT: api/plants/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePlant(int id, Plant plant)
        {
            if (id != plant.Id) return BadRequest();

            _context.Entry(plant).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/plants/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePlant(int id)
        {
            var plant = await _context.Plants.FindAsync(id);
            if (plant == null) return NotFound();

            _context.Plants.Remove(plant);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
