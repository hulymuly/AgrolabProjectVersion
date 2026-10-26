using AgroLab.DTOs.ChemicalExpenses;
using AgroLab.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroLab.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChemicalExpensesController : ControllerBase
    {
        private readonly AgroLabDbContext _context;

        public ChemicalExpensesController(AgroLabDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ChemicalExpense>>> GetChemicalExpenses()
        {
            var expenses = await _context.ChemicalExpenses.ToListAsync();
            return Ok(expenses);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ChemicalExpense>> GetChemicalExpense(int id)
        {
            var expense = await _context.ChemicalExpenses.FindAsync(id);
            if (expense == null)
                return NotFound(new { message = "Запись расхода не найдена." });

            return Ok(expense);
        }

        [HttpPost]
        public async Task<IActionResult> CreateChemicalExpense([FromBody] ChemicalExpenseCreateDto dto)
        {
            var expense = new ChemicalExpense
            {
                ReagentId = dto.ReagentId,
                ExpenseDate = dto.ExpenseDate,
                QuantityUsed = dto.QuantityUsed,
                GostMethod = dto.GostMethod,
                Solution = dto.Solution,
                SolutionQuantity = dto.SolutionQuantity,
                Storage = dto.Storage,
                ExpirationDate = dto.ExpirationDate
            };

            _context.ChemicalExpenses.Add(expense);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Запись расхода успешно добавлена." });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateChemicalExpense(int id, [FromBody] ChemicalExpenseUpdateDto dto)
        {
            var expense = await _context.ChemicalExpenses.FindAsync(id);
            if (expense == null)
                return NotFound(new { message = "Запись расхода не найдена." });

            expense.ReagentId = dto.ReagentId;
            expense.ExpenseDate = dto.ExpenseDate;
            expense.QuantityUsed = dto.QuantityUsed;
            expense.GostMethod = dto.GostMethod;
            expense.Solution = dto.Solution;
            expense.SolutionQuantity = dto.SolutionQuantity;
            expense.Storage = dto.Storage;
            expense.ExpirationDate = dto.ExpirationDate;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Запись расхода успешно обновлена." });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteChemicalExpense(int id)
        {
            var expense = await _context.ChemicalExpenses.FindAsync(id);
            if (expense == null)
                return NotFound(new { message = "Запись расхода не найдена." });

            _context.ChemicalExpenses.Remove(expense);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Запись расхода успешно удалена." });
        }
    }
}
