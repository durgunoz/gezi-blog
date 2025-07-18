using GeziBlog.API.Data;
using GeziBlog.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GeziBlog.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class PostController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PostController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>Tüm blog yazılarını getirir.</summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Post>), 200)]
        public async Task<IActionResult> GetPosts()
        {
            var posts = await _context.Posts.Include(p => p.Author).ToListAsync();
            return Ok(posts);
        }

        /// <summary>Belirli ID'ye sahip blog yazısını getirir.</summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Post), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetPost(int id)
        {
            var post = await _context.Posts.Include(p => p.Author)
                                           .FirstOrDefaultAsync(p => p.Id == id);
            if (post == null) return NotFound();
            return Ok(post);
        }

        /// <summary>Yeni blog yazısı oluşturur.</summary>
        [HttpPost]
        [ProducesResponseType(typeof(Post), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> CreatePost([FromBody] Post post)
        {
            _context.Posts.Add(post);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPost), new { id = post.Id }, post);
        }

        /// <summary>Var olan bir yazıyı günceller.</summary>
        [HttpPut("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdatePost(int id, [FromBody] Post post)
        {
            if (id != post.Id) return BadRequest();
            var exists = await _context.Posts.AnyAsync(p => p.Id == id);
            if (!exists) return NotFound();

            _context.Entry(post).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>Yazıyı siler.</summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeletePost(int id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null) return NotFound();

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
