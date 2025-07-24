using GeziBlog.API.Data;
using GeziBlog.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using GeziBlog.API.Dtos;

namespace GeziBlog.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CommentController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Belirli bir post'a ait yorumları getirir.
        /// </summary>
        [HttpGet("by-post/{postId}")]
        public async Task<IActionResult> GetCommentsByPost(int postId)
        {
            var comments = await _context.Comments
                .Where(c => c.PostId == postId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            return Ok(comments);
        }

        /// <summary>
        /// Sadece giriş yapmış kullanıcılar yorum bırakabilir.
        /// Yorum adı ve e-posta token'dan alınır.
        /// </summary>
        [HttpPost("{postId}")]
        [Authorize] // ✅ Token gerekli
        public async Task<IActionResult> AddComment(int postId, [FromBody] AddCommentDto dto)
        {
            var post = await _context.Posts.FindAsync(postId);
            if (post == null)
                return NotFound("Post bulunamadı.");

            if (string.IsNullOrWhiteSpace(dto.Message))
                return BadRequest("Yorum mesajı boş olamaz.");

            // ✅ Kullanıcının token'ından ad ve e-posta alınır
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;

            var comment = new Comment
            {
                PostId = postId,
                Name = userName,
                Email = userEmail,
                Message = dto.Message,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Yorum eklendi." });
        }

    }
}