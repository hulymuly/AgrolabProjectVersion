using AgroLab.DTOs.Auth;
using AgroLab.Entities;
using AgroLab.Services;
using AgroLab.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroLab.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class AuthController : ControllerBase
    {
        private readonly AgroLabDbContext _context;
        private readonly ITokenService _tokenService;

        public AuthController(AgroLabDbContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        [LogAction("Регистрация нового пользователя")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Register(UserRegisterDto dto)
        {
            Console.WriteLine($"[REGISTER] Попытка регистрации: {dto.Username}");

            if (await _context.AuthUsers.AnyAsync(u => u.Login == dto.Username))
            {
                Console.WriteLine($"[REGISTER] Логин уже существует: {dto.Username}");
                return BadRequest(new
                {
                    success = false,
                    error = "Пользователь с таким логином уже существует."
                });
            }

            var inputRole = string.IsNullOrWhiteSpace(dto.Role) ? "User" : dto.Role;

            var role = await _context.Roles
                .FirstOrDefaultAsync(r => r.Role1.ToLower() == inputRole.ToLower());

            if (role == null)
            {
                Console.WriteLine($"[REGISTER] Роль не найдена: {inputRole}");
                return BadRequest(new
                {
                    success = false,
                    error = $"Роль '{inputRole}' не найдена."
                });
            }

            var staff = new Staff
            {
                Name = dto.Name,
                Surname = dto.Surname,
                RoleId = role.Id
            };

            _context.Staff.Add(staff);
            await _context.SaveChangesAsync();

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new AuthUser
            {
                Login = dto.Username,
                Password = passwordHash,
                UserId = staff.Id
            };

            _context.AuthUsers.Add(user);
            await _context.SaveChangesAsync();

            Console.WriteLine($"[REGISTER] Успешно. Новый ID: {user.Id}");

            return Ok(new
            {
                success = true,
                user = new
                {
                    id = user.UserId,
                    login = user.Login,
                    role = role.Role1.ToLower()
                }
            });
        }

        [HttpPost("login")]
        [LogAction("Вход пользователя")]
        public async Task<IActionResult> Login(UserLoginDto dto)
        {
            Console.WriteLine($"[LOGIN] Попытка входа: {dto.Username}");

            var user = await _context.AuthUsers
                .Include(u => u.User)
                .FirstOrDefaultAsync(u => u.Login == dto.Username);

            if (user == null || user.User == null)
            {
                Console.WriteLine("[LOGIN] Пользователь не найден или нет связи с Staff");
                return Unauthorized(new
                {
                    success = false,
                    error = "Неверный логин или пароль."
                });
            }

            var isValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.Password);
            Console.WriteLine($"[LOGIN] Совпадение пароля: {isValid}");

            if (!isValid)
            {
                return Unauthorized(new
                {
                    success = false,
                    error = "Неверный логин или пароль."
                });
            }

            var staffRole = await _context.Roles
                .FirstOrDefaultAsync(r => r.Id == user.User.RoleId);
            var roleName = (staffRole?.Role1 ?? "user").ToLower();

            var token = _tokenService.GenerateToken(user.Login, roleName);

            Console.WriteLine($"[LOGIN] Успешный вход. Токен выдан. ID: {user.Id} | Роль: {roleName}");

            return Ok(new
            {
                success = true,
                token,
                user = new
                {
                    id = user.User.Id,
                    login = user.Login,
                    role = roleName,
                    name = user.User.Name,
                    surname = user.User.Surname
                }
            });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var login = User.Identity?.Name;
            if (login == null) return Unauthorized();

            var user = await _context.AuthUsers
                .Include(u => u.User)
                .FirstOrDefaultAsync(u => u.Login == login);

            if (user == null || user.User == null) return NotFound();

            var staffRole = await _context.Roles.FirstOrDefaultAsync(r => r.Id == user.User.RoleId);
            var roleName = (staffRole?.Role1 ?? "user").ToLower();

            return Ok(new
            {
                id = user.User.Id,
                login = user.Login,
                role = roleName,
                name = user.User.Name,
                surname = user.User.Surname
            });
        }

        [HttpPost("change-password")]
        [Authorize]
        [LogAction("Смена пароля")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
        {
            var login = User.Identity?.Name;
            if (login == null) return Unauthorized();

            var user = await _context.AuthUsers.FirstOrDefaultAsync(u => u.Login == login);
            if (user == null) return NotFound();

            if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.Password))
            {
                return BadRequest("Старый пароль указан неверно.");
            }

            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return Ok("Пароль успешно изменён.");
        }
    }
}
