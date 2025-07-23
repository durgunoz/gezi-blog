using GeziBlog.API.Data;
using GeziBlog.API.Models;
using GeziBlog.API.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;


namespace GeziBlog.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthorController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthorController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
        // [ApiController] attribute'ü ve DTO'daki [Required] gibi kurallar sayesinde
        // model validasyonu otomatik yapılır. Bu nedenle manuel kontrol gereksizdir.
        var exists = await _context.Authors.AnyAsync(a => a.Email == dto.Email);
            if (exists)
                return BadRequest("Bu email zaten kayıtlı.");

            var author = new Author
            {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "Reader"
            };

            _context.Authors.Add(author);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(author);
            return Ok(new { token });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _context.Authors.FirstOrDefaultAsync(a => a.Email == dto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized("Geçersiz e-posta veya şifre.");

            var token = GenerateJwtToken(user);

            return Ok(new { token }); // 🔥 Burada response body'ye token dönülmeli
        }


        [HttpGet("all")]
        [Authorize(Roles = "Admin")] // Sadece admin erişebilir
        public async Task<IActionResult> GetAllAuthors()
        {
            var authors = await _context.Authors
                .Select(a => new
                {
                    a.Id,
                    a.Name,
                    a.Role
                })
                .ToListAsync();

            return Ok(authors);
        }


        [HttpPut("promote/{id}")]
        [Authorize(Roles = "Admin")] // Sadece admin erişebilir
        public async Task<IActionResult> PromoteToAuthor(int id)
        {
            var user = await _context.Authors.FindAsync(id);
            if (user == null)
                return NotFound("Kullanıcı bulunamadı.");

            if (user.Role == "Author")
                return BadRequest("Kullanıcı zaten Author.");

            user.Role = "Author";
            await _context.SaveChangesAsync();

            return Ok(new { message = $"{user.Name} artık bir Author." });
        }


        private string GenerateJwtToken(Author user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var secretKey = _configuration["JwtSettings:SecretKey"];
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: null,
                audience: null,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}
