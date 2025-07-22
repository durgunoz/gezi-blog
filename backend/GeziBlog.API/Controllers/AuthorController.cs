using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GeziBlog.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        // Basit bir bellek içi kullanıcı listesi (gerçek projede veritabanı kullanılmalı)
        private static List<(string Username, string Password)> users = new List<(string, string)>();

        [HttpPost("register")] 
        public IActionResult Register([FromBody] RegisterModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Username) || string.IsNullOrWhiteSpace(model.Password))
                return BadRequest("Kullanıcı adı ve parola zorunludur.");

            if (users.Any(u => u.Username == model.Username))
                return BadRequest("Bu kullanıcı adı zaten alınmış.");

            users.Add((model.Username, model.Password));

            // Kayıt sonrası otomatik login (JWT token üretimi)
            var token = GenerateJwtToken(model.Username);
            return Ok(new { token });
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel model)
        {
            // Kullanıcı adı/parola kontrolü
            var user = users.FirstOrDefault(u => u.Username == model.Username && u.Password == model.Password);
            if (user == default)
                return Unauthorized("Kullanıcı adı veya parola hatalı.");

            var token = GenerateJwtToken(model.Username);
            return Ok(new { token });
        }

        private string GenerateJwtToken(string username)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, username)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("super-secret-key"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: null,
                audience: null,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    // Register ve Login için basit modeller
    public class RegisterModel
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
    public class LoginModel
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
