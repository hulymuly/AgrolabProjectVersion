using AgroLab.DTOs.Reagents;
using AgroLab.Entities;
using AgroLab.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroLab.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReagentsController : ControllerBase
{
    private readonly AgroLabDbContext _context;

    public ReagentsController(AgroLabDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReagentWithParishDto>>> GetReagents()
    {
        var result = await _context.Reagents
            .Include(r => r.ChemicalParishes.OrderByDescending(p => p.ReceiptDate).Take(1))
                .ThenInclude(p => p.Supplier)
            .Select(r => new ReagentWithParishDto
            {
                Id = r.Id,
                Name = r.Name,
                ReceiptDate = r.ChemicalParishes
                    .OrderByDescending(p => p.ReceiptDate)
                    .Select(p => (DateOnly?)p.ReceiptDate)
                    .FirstOrDefault(),
                BatchNumber = r.ChemicalParishes
                    .OrderByDescending(p => p.ReceiptDate)
                    .Select(p => p.BatchNumber)
                    .FirstOrDefault(),
                ExpirationDate = r.ChemicalParishes
                    .OrderByDescending(p => p.ReceiptDate)
                    .Select(p => p.ExpirationDate)
                    .FirstOrDefault(),
                QuantityReceived = r.ChemicalParishes
                    .OrderByDescending(p => p.ReceiptDate)
                    .Select(p => p.QuantityReceived)
                    .FirstOrDefault(),
                SupplierName = r.ChemicalParishes
                    .OrderByDescending(p => p.ReceiptDate)
                    .Select(p => p.Supplier != null ? p.Supplier.Name : null)
                    .FirstOrDefault()
            })
            .ToListAsync();

        return Ok(result);
    }

    [HttpPost]
    [LogAction("Добавление нового реагента")]
    public async Task<IActionResult> CreateReagent([FromBody] ReagentCreateDto dto)
    {
        var reagent = new Reagent
        {
            Name = dto.Name
        };

        _context.Reagents.Add(reagent);
        await _context.SaveChangesAsync();

        if (dto.ReceiptDate.HasValue && dto.ExpirationDate.HasValue)
        {
            int? supplierId = null;

            if (!string.IsNullOrWhiteSpace(dto.SupplierName))
            {
                var supplier = await _context.Providers
                    .FirstOrDefaultAsync(s => s.Name == dto.SupplierName);

                if (supplier == null)
                {
                    supplier = new Provider { Name = dto.SupplierName };
                    _context.Providers.Add(supplier);
                    await _context.SaveChangesAsync();
                }

                supplierId = supplier.Id;
            }

            var parish = new ChemicalParish
            {
                ReagentId = reagent.Id,
                ReceiptDate = dto.ReceiptDate.Value,
                BatchNumber = dto.BatchNumber ?? "-",
                ExpirationDate = dto.ExpirationDate.Value,
                QuantityReceived = dto.QuantityReceived ?? 0,
                SupplierId = supplierId,
                ReceivedFrom = dto.ReceivedFrom ?? "-",
                ApprovalDate = dto.ApprovalDate
            };

            _context.ChemicalParishes.Add(parish);
            await _context.SaveChangesAsync();
        }

        return Ok(new
        {
            id = reagent.Id,
            message = "Реактив успешно добавлен."
        });
    }

    [HttpPut("{id}")]
    [LogAction("Обновление реагента")]
    public async Task<IActionResult> UpdateReagent(int id, [FromBody] ReagentUpdateDto dto)
    {
        var reagent = await _context.Reagents
            .Include(r => r.ChemicalParishes.OrderByDescending(p => p.ReceiptDate))
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reagent == null)
            return NotFound(new { message = "Реактив не найден." });

        reagent.Name = dto.Name;

        var parish = reagent.ChemicalParishes.FirstOrDefault();
        if (parish != null)
        {
            parish.ReceiptDate = dto.ReceiptDate ?? parish.ReceiptDate;
            parish.BatchNumber = dto.BatchNumber ?? parish.BatchNumber;
            parish.ExpirationDate = dto.ExpirationDate ?? parish.ExpirationDate;
            parish.QuantityReceived = dto.QuantityReceived ?? parish.QuantityReceived;
            parish.ReceivedFrom = dto.ReceivedFrom ?? parish.ReceivedFrom;
            parish.ApprovalDate = dto.ApprovalDate ?? parish.ApprovalDate;

            if (!string.IsNullOrWhiteSpace(dto.SupplierName))
            {
                var supplier = await _context.Providers.FirstOrDefaultAsync(s => s.Name == dto.SupplierName);
                if (supplier == null)
                {
                    supplier = new Provider { Name = dto.SupplierName };
                    _context.Providers.Add(supplier);
                    await _context.SaveChangesAsync();
                }

                parish.SupplierId = supplier.Id;
            }
        }

        // Если указан расход — создаём новую запись расхода
        if (dto.Consumption.HasValue && dto.Consumption.Value > 0)
        {
            var expense = new ChemicalExpense
            {
                ReagentId = reagent.Id,
                ExpenseDate = DateOnly.FromDateTime(DateTime.Today),
                QuantityUsed = dto.Consumption.Value
            };

            _context.ChemicalExpenses.Add(expense);
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = reagent.Id,
            message = "Реактив успешно обновлён."
        });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    [LogAction("Удаление реагента")]
    public async Task<IActionResult> DeleteReagent(int id)
    {
        var reagent = await _context.Reagents
            .Include(r => r.ChemicalParishes)
            .Include(r => r.ChemicalExpenses)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reagent == null)
            return NotFound(new { message = "Реактив не найден." });

        _context.ChemicalParishes.RemoveRange(reagent.ChemicalParishes);
        _context.ChemicalExpenses.RemoveRange(reagent.ChemicalExpenses);
        _context.Reagents.Remove(reagent);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Реактив и связанные записи успешно удалены." });
    }
}
