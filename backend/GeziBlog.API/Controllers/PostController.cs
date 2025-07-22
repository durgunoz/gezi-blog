using GeziBlog.API.Data;
using GeziBlog.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GeziBlog.API.Dtos;


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
            var posts = await _context.Posts
                .Include(p => p.Author)
                .Include(p => p.PostCategories).ThenInclude(pc => pc.Category)
                .Include(p => p.PostTags).ThenInclude(pt => pt.Tag)
                .Include(p => p.Comments)
                .ToListAsync();

            var postDtos = posts.Select(post => new PostDto
            {
                Id = post.Id,
                Title = post.Title,
                Content = post.Content,
                CreatedAt = post.CreatedAt,
                ImageUrl = post.ImageUrl,
                IsPublished = post.IsPublished,
                ViewCount = post.ViewCount,

                Author = new AuthorDto
                {
                    Id = post.Author?.Id ?? 0,
                    Name = post.Author?.Name ?? ""
                },

                Categories = post.PostCategories.Select(pc => new CategoryDto
                {
                    Id = pc.Category.Id,
                    Name = pc.Category.Name
                }).ToList(),

                Tags = post.PostTags.Select(pt => new TagDto
                {
                    Id = pt.Tag.Id,
                    Name = pt.Tag.Name
                }).ToList(),

                Comments = post.Comments.Select(c => new CommentDto
                {
                    Id = c.Id,
                    Name = c.Name ?? "",
                    Email = c.Email ?? "",
                    Message = c.Message ?? "",
                    CreatedAt = c.CreatedAt
                }).ToList()

            }).ToList();

            return Ok(postDtos);
        }

        /// <summary>Belirli ID'ye sahip blog yazısını getirir.</summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(PostDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetPost(int id)
        {
            var post = await _context.Posts
                .Include(p => p.Author)
                .Include(p => p.PostCategories).ThenInclude(pc => pc.Category)
                .Include(p => p.PostTags).ThenInclude(pt => pt.Tag)
                .Include(p => p.Comments)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (post == null) return NotFound();

            var postDto = new PostDto
            {
                Id = post.Id,
                Title = post.Title,
                Content = post.Content,
                CreatedAt = post.CreatedAt,
                ImageUrl = post.ImageUrl,
                IsPublished = post.IsPublished,
                ViewCount = post.ViewCount,

                Author = new AuthorDto
                {
                    Id = post.Author?.Id ?? 0,
                    Name = post.Author?.Name ?? ""
                },

                Categories = post.PostCategories.Select(pc => new CategoryDto
                {
                    Id = pc.Category.Id,
                    Name = pc.Category.Name
                }).ToList(),

                Tags = post.PostTags.Select(pt => new TagDto
                {
                    Id = pt.Tag.Id,
                    Name = pt.Tag.Name
                }).ToList(),

                Comments = post.Comments.Select(c => new CommentDto
                {
                    Id = c.Id,
                    Name = c.Name ?? "",
                    Email = c.Email ?? "",
                    Message = c.Message ?? "",
                    CreatedAt = c.CreatedAt
                }).ToList()
            };

            return Ok(postDto);
        }


        /// <summary>Yeni blog yazısı oluşturur.</summary>
        [HttpPost]
        [ProducesResponseType(typeof(Post), 201)]
        [ProducesResponseType(400)]
        //[Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> CreatePost([FromBody] PostCreateDto postDto)
        {
            // var username = User.Identity?.Name;
            // if (string.IsNullOrEmpty(username)) return Unauthorized();

            // var author = await _context.Authors.FirstOrDefaultAsync(a => a.Name == username);
            // if (author == null)
            //     return BadRequest("Kullanıcıya ait yazar bulunamadı.");

            // Auth devre dışı bırakıldığı için, varsayılan bir yazar kullanılıyor.
            // Test ortamı için ilk yazarı alıyoruz. Gerçek uygulamada bu olmamalıdır.
            var author = await _context.Authors.FirstOrDefaultAsync();
            if (author == null)
                return BadRequest("Veritabanında yazar bulunamadı. Lütfen test için bir yazar ekleyin.");
            
            var post = new Post
            {
                Title = postDto.Title,
                Content = postDto.Content,
                CreatedAt = DateTime.UtcNow,
                ImageUrl = postDto.ImageUrl,
                IsPublished = postDto.IsPublished,
                ViewCount = 0,
                Author = author
            };

            // Kategoriler
            post.PostCategories = postDto.CategoryIds.Select(catId => new PostCategory
            {
                CategoryId = catId
            }).ToList();

            // Etiketler
            post.PostTags = postDto.TagIds.Select(tagId => new PostTag
            {
                TagId = tagId
            }).ToList();

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPost), new { id = post.Id }, post);
        }


        /// <summary>Var olan bir yazıyı günceller.</summary>
        [HttpPut("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        //[Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> UpdatePost(int id, [FromBody] Post post)
        {
            if (id != post.Id) return BadRequest();
            var existingPost = await _context.Posts.Include(p => p.Author).FirstOrDefaultAsync(p => p.Id == id);
            if (existingPost == null) return NotFound();

            // var username = User.Identity?.Name;
            // var isAdmin = User.IsInRole("Admin");
            // if (!isAdmin && existingPost.Author?.Name != username)
            //     return Forbid("Sadece kendi yazınızı güncelleyebilirsiniz.");

            // Sadece gerekli alanlar güncelleniyor
            existingPost.Title = post.Title;
            existingPost.Content = post.Content;
            // ... diğer alanlar eklenebilir

            await _context.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>Yazıyı siler.</summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        //[Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> DeletePost(int id)
        {
            var post = await _context.Posts.Include(p => p.Author).FirstOrDefaultAsync(p => p.Id == id);
            if (post == null) return NotFound();

            // var username = User.Identity?.Name;
            // var isAdmin = User.IsInRole("Admin");
            // if (!isAdmin && post.Author?.Name != username)
            //     return Forbid("Sadece kendi yazınızı silebilirsiniz.");

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
