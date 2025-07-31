using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;
using System.Security.Claims;
using GeziBlog.API.Data;
using GeziBlog.API.Models;

namespace GeziBlog.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatbotController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;

        public ChatbotController(AppDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
        }

        [HttpPost("chat")]
        public async Task<IActionResult> ChatWithBot([FromBody] ChatMessageDto request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId))
                return Unauthorized("Kullanıcı kimliği çözülemedi.");

            var userProfile = _context.UserProfiles.FirstOrDefault(u => u.AuthorId == userId);
            if (userProfile == null)
                return NotFound("Kullanıcı profili bulunamadı.");

            var payload = new
            {
                user_id = userProfile.Id,
                message = request.Message
            };

            var client = _httpClientFactory.CreateClient();

            try
            {
                var response = await client.PostAsJsonAsync("http://localhost:8000/chat", payload);
                if (!response.IsSuccessStatusCode)
                    return StatusCode((int)response.StatusCode, "Python ChatBot API'ye ulaşılamadı.");

                var result = await response.Content.ReadFromJsonAsync<ChatResponseDto>();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Sunucu hatası: {ex.Message}");
            }
        }
    }

    public class ChatMessageDto
    {
        public string Message { get; set; } = string.Empty;
    }

    public class ChatResponseDto
    {
        public string reply { get; set; } = string.Empty;
    }
}
