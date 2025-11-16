using AgroLab.DTOs.Equipment;
using AgroLab.Entities;
using AgroLab.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroLab.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EquipmentController : ControllerBase
    {
        private readonly AgroLabDbContext _context;

        public EquipmentController(AgroLabDbContext context)
        {
            _context = context;
        }

        // GET: api/equipment
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EquipmentResponseDto>>> GetEquipment()
        {
            var equipment = await _context.Equipment.ToListAsync();

            var dtoList = equipment.Select(e => new EquipmentResponseDto
            {
                Id = e.Id,
                Name = e.Name,
                Category = e.Category,
                Model = e.LineName,
                FactoryNumber = e.FactoryName,
                InventoryNumber = e.InventoryNumber,
                DateOfCommissioning = e.CommissioningDate,
                CertificateNumber = e.CertificateName,
                InspectionDate = e.InspectionDate,
                ValidUntilDate = e.NextInspectionDate,
                Length = e.Diameter,
                Depth = e.Depth,
                Height = e.Height,
                Width = e.Width,
                DateOfDecommissioning = e.GoodsEntryDate
            }).ToList();

            return Ok(dtoList);
        }

        // POST: api/equipment
        [HttpPost]
        [LogAction("Добавление оборудования")]
        public async Task<IActionResult> CreateEquipment([FromBody] EquipmentCreateDto dto)
        {
            var equipment = new Equipment
            {
                Name = dto.Name,
                Category = dto.Category,
                LineName = dto.Model,
                FactoryName = dto.FactoryNumber,
                InventoryNumber = dto.InventoryNumber,
                CommissioningDate = dto.DateOfCommissioning,
                CertificateName = dto.CertificateNumber,
                InspectionDate = dto.InspectionDate,
                NextInspectionDate = dto.ValidUntilDate,
                Diameter = dto.Length,
                Depth = dto.Depth,
                Height = dto.Height,
                Width = dto.Width,
                GoodsEntryDate = dto.DateOfDecommissioning
            };

            _context.Equipment.Add(equipment);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = equipment.Id,
                message = "Оборудование успешно добавлено."
            });
        }

        // PUT: api/equipment/{id}
        [HttpPut("{id}")]
        [LogAction("Обновление данных оборудования")]
        public async Task<IActionResult> UpdateEquipment(int id, [FromBody] EquipmentUpdateDto dto)
        {
            var equipment = await _context.Equipment.FindAsync(id);
            if (equipment == null)
                return NotFound(new { message = "Оборудование не найдено." });

            equipment.Name = dto.Name;
            equipment.Category = dto.Category;
            equipment.LineName = dto.Model;
            equipment.FactoryName = dto.FactoryNumber;
            equipment.InventoryNumber = dto.InventoryNumber;
            equipment.CommissioningDate = dto.DateOfCommissioning;
            equipment.CertificateName = dto.CertificateNumber;
            equipment.InspectionDate = dto.InspectionDate;
            equipment.NextInspectionDate = dto.ValidUntilDate;
            equipment.Diameter = dto.Length;
            equipment.Depth = dto.Depth;
            equipment.Height = dto.Height;
            equipment.Width = dto.Width;
            equipment.GoodsEntryDate = dto.DateOfDecommissioning;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = equipment.Id,
                message = "Оборудование успешно обновлено."
            });
        }

        // DELETE: api/equipment/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        [LogAction("Удаление оборудования")]
        public async Task<IActionResult> DeleteEquipment(int id)
        {
            var equipment = await _context.Equipment.FindAsync(id);
            if (equipment == null)
                return NotFound(new { message = "Оборудование не найдено." });

            _context.Equipment.Remove(equipment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Оборудование успешно удалено." });
        }
    }
}
