using AgroLab.DTOs.ChemicalParish;
using AgroLab.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroLab.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChemicalParishController : ControllerBase
    {
        private readonly AgroLabDbContext _context;

        public ChemicalParishController(AgroLabDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ChemicalParish>>> GetChemicalParishes()
        {
            var parishes = await _context.ChemicalParishes.ToListAsync();
            return Ok(parishes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ChemicalParish>> GetChemicalParish(int id)
        {
            var parish = await _context.ChemicalParishes.FindAsync(id);
            if (parish == null)
                return NotFound(new { message = "Запись прихода не найдена." });

            return Ok(parish);
        }

        [HttpPost]
        public async Task<IActionResult> CreateChemicalParish([FromBody] ChemicalParishCreateDto dto)
        {
            var parish = new ChemicalParish
            {
                ReagentId = dto.ReagentId,
                ReceiptDate = dto.ReceiptDate,
                QuantityReceived = dto.QuantityReceived,
                ReceivedFrom = dto.ReceivedFrom,
                ApprovalDate = dto.ApprovalDate,
                ExpirationDate = dto.ExpirationDate,
                SupplierId = dto.SupplierId,
                BatchNumber = dto.BatchNumber
            };

            _context.ChemicalParishes.Add(parish);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Запись прихода успешно добавлена." });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateChemicalParish(int id, [FromBody] ChemicalParishUpdateDto dto)
        {
            var parish = await _context.ChemicalParishes.FindAsync(id);
            if (parish == null)
                return NotFound(new { message = "Запись прихода не найдена." });

            parish.ReagentId = dto.ReagentId;
            parish.ReceiptDate = dto.ReceiptDate;
            parish.QuantityReceived = dto.QuantityReceived;
            parish.ReceivedFrom = dto.ReceivedFrom;
            parish.ApprovalDate = dto.ApprovalDate;
            parish.ExpirationDate = dto.ExpirationDate;
            parish.SupplierId = dto.SupplierId;
            parish.BatchNumber = dto.BatchNumber;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Запись прихода успешно обновлена." });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteChemicalParish(int id)
        {
            var parish = await _context.ChemicalParishes.FindAsync(id);
            if (parish == null)
                return NotFound(new { message = "Запись прихода не найдена." });

            _context.ChemicalParishes.Remove(parish);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Запись прихода успешно удалена." });
        }
    }
}
