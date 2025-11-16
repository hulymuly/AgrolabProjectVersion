using AgroLab.DTOs.Customers;
using AgroLab.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroLab.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CustomersController : ControllerBase
    {
        private readonly AgroLabDbContext _context;

        public CustomersController(AgroLabDbContext context)
        {
            _context = context;
        }

        // GET: api/customers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CustomerResponseDto>>> GetCustomers()
        {
            var customers = await _context.Customers.ToListAsync();

            var response = customers.Select(c => new CustomerResponseDto
            {
                Id = c.Id,
                Name = c.Name,
                Inn = c.Inn,
                Kpp = c.Kpp,
                OrgAndLegalForm = c.OrgAndLegalForm,
                Address = c.Address
            });

            return Ok(response);
        }

        // POST: api/customers
        [HttpPost]
        public async Task<IActionResult> CreateCustomer([FromBody] CustomerCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray()
                );
                return BadRequest(new { message = "Ошибка валидации", errors });
            }

            if (await _context.Customers.AnyAsync(c => c.Name == dto.Name))
                return BadRequest(new { message = "Такой заказчик уже существует." });

            var customer = new Customer
            {
                Name = dto.Name,
                Inn = dto.Inn,
                Kpp = dto.Kpp,
                OrgAndLegalForm = dto.OrgAndLegalForm,
                Address = dto.Address
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = customer.Id,
                message = "Заказчик успешно добавлен."
            });
        }

        // PUT: api/customers/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCustomer(int id, [FromBody] CustomerUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray()
                );
                return BadRequest(new { message = "Ошибка валидации", errors });
            }

            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
                return NotFound(new { message = "Заказчик не найден." });

            customer.Name = dto.Name;
            customer.Inn = dto.Inn;
            customer.Kpp = dto.Kpp;
            customer.OrgAndLegalForm = dto.OrgAndLegalForm;
            customer.Address = dto.Address;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = customer.Id,
                message = "Заказчик успешно обновлён."
            });
        }

        // DELETE: api/customers/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
                return NotFound(new { message = "Заказчик не найден." });

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Заказчик успешно удалён." });
        }
    }
}
