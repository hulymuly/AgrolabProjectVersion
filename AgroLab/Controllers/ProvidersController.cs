using AgroLab.DTOs.Providers;
using AgroLab.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroLab.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProvidersController : ControllerBase
    {
        private readonly AgroLabDbContext _context;

        public ProvidersController(AgroLabDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Provider>>> GetProviders()
        {
            var providers = await _context.Providers.ToListAsync();
            return Ok(providers);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Provider>> GetProvider(int id)
        {
            var provider = await _context.Providers.FindAsync(id);
            if (provider == null)
                return NotFound(new { message = "Поставщик не найден." });

            return Ok(provider);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProvider([FromBody] ProviderCreateDto dto)
        {
            var provider = new Provider
            {
                Name = dto.Name,
                Adress = dto.Adress,
                ContactInfo = dto.ContactInfo
            };

            _context.Providers.Add(provider);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Поставщик успешно добавлен." });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProvider(int id, [FromBody] ProviderUpdateDto dto)
        {
            var provider = await _context.Providers.FindAsync(id);
            if (provider == null)
                return NotFound(new { message = "Поставщик не найден." });

            provider.Name = dto.Name;
            provider.Adress = dto.Adress;
            provider.ContactInfo = dto.ContactInfo;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Поставщик успешно обновлён." });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProvider(int id)
        {
            var provider = await _context.Providers.FindAsync(id);
            if (provider == null)
                return NotFound(new { message = "Поставщик не найден." });

            _context.Providers.Remove(provider);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Поставщик успешно удалён." });
        }
    }
}
