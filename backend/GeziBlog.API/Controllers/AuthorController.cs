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
            return Ok(new { token });
        }

        private string GenerateJwtToken(Author user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // ✅ Kullanıcı ID'si
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var secretKey = _configuration["JwtSettings:SecretKey"];
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: "GeziBlog.API",
                audience: "GeziBlog.Client",
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var refreshToken = Request.Cookies["refreshToken"];

            if (string.IsNullOrEmpty(refreshToken))
                return BadRequest("Refresh token bulunamadı.");

            var tokenInDb = await _context.RefreshTokens.FirstOrDefaultAsync(t => t.Token == refreshToken);
            if (tokenInDb != null)
            {
                _context.RefreshTokens.Remove(tokenInDb);
                await _context.SaveChangesAsync();
            }

            Response.Cookies.Delete("refreshToken");

            return Ok(new { message = "Çıkış yapıldı." });
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAuthors()
        {
            var authors = await _context.Authors
                .Where(a => a.Role == "Author")
                .Select(a => new
                {
                    a.Id,
                    a.Name,
                    a.Role
                })
                .ToListAsync();

            return Ok(authors);
        }

        [HttpGet("with-posts")]
        public async Task<IActionResult> GetAuthorsWithPosts()
        {
            var authorsWithPosts = await _context.Authors
                .Where(a => a.Posts.Any())
                .Select(a => new
                {
                    a.Id,
                    a.Name
                })
                .ToListAsync();

            return Ok(authorsWithPosts);
        }

        [HttpPut("promote/{id}")]
        [Authorize(Roles = "Admin")]
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
    }
}
