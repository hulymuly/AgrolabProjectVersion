using AgroLab.DTOs.Cultures;
using AgroLab.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AgroLab.Filters;

namespace AgroLab.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CulturesController : ControllerBase
    {
        private readonly AgroLabDbContext _context;

        public CulturesController(AgroLabDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CultureDto>>> GetCultures()
        {
            var standardReproductions = new[] { "original", "elite", "first", "second" };

            var cultures = await _context.Cultures
                .Include(c => c.SeedNorms).ThenInclude(n => n.Reproduction)
                .Include(c => c.PotatoNorms).ThenInclude(n => n.Reproduction)
                .Include(c => c.Plants)
                .Include(c => c.Seeds)
                .Include(c => c.Potatoes)
                .ToListAsync();

            var result = cultures.Select(c => new CultureDto
            {
                Id = c.Id,
                Name = c.Name,
                Type =
                    c.SeedNorms.Any() || c.Seeds.Any() ? "seeds" :
                    c.PotatoNorms.Any() || c.Potatoes.Any() ? "potatoes" :
                    c.Plants.Any() ? "plants" :
                    "unknown",

                SeedNorms = standardReproductions.ToDictionary(
                    reproductionName => reproductionName,
                    reproductionName =>
                    {
                        var norms = c.SeedNorms
                            .Where(n => n.Reproduction?.Name == reproductionName)
                            .ToDictionary(n => n.Analysis, n => n.AcceptValue ?? "");
                        return norms;
                    }),

                PotatoNorms = standardReproductions.ToDictionary(
                    reproductionName => reproductionName,
                    reproductionName =>
                    {
                        var norms = c.PotatoNorms
                            .Where(n => n.Reproduction?.Name == reproductionName)
                            .ToDictionary(n => n.Analysis, n => n.AcceptValue ?? "");
                        return norms;
                    })
            }).ToList();

            return Ok(result);
        }

        [HttpPost]
        [LogAction("Добавление культуры")]
        public async Task<IActionResult> CreateCulture([FromBody] CultureCreateDto dto)
        {
            if (await _context.Cultures.AnyAsync(c => c.Name.ToLower() == dto.Name.ToLower()))
                return BadRequest(new { success = false, message = "Такая культура уже существует." });

            var culture = new Culture
            {
                Name = dto.Name,
                SeedNorms = new List<SeedNorm>(),
                PotatoNorms = new List<PotatoNorm>()
            };

            if (dto.SeedNorms != null)
            {
                foreach (var reproductionEntry in dto.SeedNorms)
                {
                    var reproduction = await GetOrCreateReproduction(reproductionEntry.Key);
                    foreach (var analysisEntry in reproductionEntry.Value)
                    {
                        culture.SeedNorms.Add(new SeedNorm
                        {
                            Reproduction = reproduction,
                            Analysis = analysisEntry.Key,
                            AcceptValue = analysisEntry.Value
                        });
                    }
                }
            }

            if (dto.PotatoNorms != null)
            {
                foreach (var reproductionEntry in dto.PotatoNorms)
                {
                    var reproduction = await GetOrCreateReproduction(reproductionEntry.Key);
                    foreach (var analysisEntry in reproductionEntry.Value)
                    {
                        culture.PotatoNorms.Add(new PotatoNorm
                        {
                            Reproduction = reproduction,
                            Analysis = analysisEntry.Key,
                            AcceptValue = analysisEntry.Value
                        });
                    }
                }
            }

            _context.Cultures.Add(culture);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Культура успешно добавлена.",
                id = culture.Id
            });
        }

        [HttpPut("{id}")]
        [LogAction("Обновление культуры")]
        public async Task<IActionResult> UpdateCulture(int id, [FromBody] CultureUpdateDto dto)
        {
            var culture = await _context.Cultures
                .Include(c => c.SeedNorms)
                .Include(c => c.PotatoNorms)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (culture == null)
                return NotFound(new { success = false, message = "Культура не найдена." });

            culture.Name = dto.Name;

            _context.SeedNorms.RemoveRange(culture.SeedNorms);
            _context.PotatoNorms.RemoveRange(culture.PotatoNorms);

            if (dto.SeedNorms != null)
            {
                foreach (var reproductionEntry in dto.SeedNorms)
                {
                    var reproduction = await GetOrCreateReproduction(reproductionEntry.Key);
                    foreach (var analysisEntry in reproductionEntry.Value)
                    {
                        culture.SeedNorms.Add(new SeedNorm
                        {
                            CultureId = culture.Id,
                            Reproduction = reproduction,
                            Analysis = analysisEntry.Key,
                            AcceptValue = analysisEntry.Value
                        });
                    }
                }
            }

            if (dto.PotatoNorms != null)
            {
                foreach (var reproductionEntry in dto.PotatoNorms)
                {
                    var reproduction = await GetOrCreateReproduction(reproductionEntry.Key);
                    foreach (var analysisEntry in reproductionEntry.Value)
                    {
                        culture.PotatoNorms.Add(new PotatoNorm
                        {
                            CultureId = culture.Id,
                            Reproduction = reproduction,
                            Analysis = analysisEntry.Key,
                            AcceptValue = analysisEntry.Value
                        });
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Культура успешно обновлена." });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        [LogAction("Удаление культуры")]
        public async Task<IActionResult> DeleteCulture(int id)
        {
            var culture = await _context.Cultures.FindAsync(id);
            if (culture == null)
                return NotFound(new { success = false, message = "Культура не найдена." });

            _context.Cultures.Remove(culture);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Культура успешно удалена." });
        }

        private async Task<Reproduction> GetOrCreateReproduction(string name)
        {
            var reproduction = await _context.Reproductions.FirstOrDefaultAsync(r => r.Name == name);
            if (reproduction == null)
            {
                reproduction = new Reproduction { Name = name };
                _context.Reproductions.Add(reproduction);
                await _context.SaveChangesAsync();
            }
            return reproduction;
        }
    }
}
