using GeziBlog.API.Data;
using GeziBlog.API.Models;
using GeziBlog.API.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;


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

        /// <summary>Tüm blog yazılarını getirir ve filtrelere göre süzer.</summary>
[HttpGet]
[ProducesResponseType(typeof(IEnumerable<PostDto>), 200)]
public async Task<IActionResult> GetPosts([FromQuery] PostFilterDto filter)
{
    var query = _context.Posts
        .Include(p => p.Author)
        .Include(p => p.PostCategories).ThenInclude(pc => pc.Category)
        .Include(p => p.PostTags).ThenInclude(pt => pt.Tag)
        .AsQueryable();

    if (!string.IsNullOrWhiteSpace(filter.Title))
        query = query.Where(p => p.Title.Contains(filter.Title));

    if (filter.CategoryId.HasValue)
        query = query.Where(p => p.PostCategories.Any(pc => pc.CategoryId == filter.CategoryId.Value));

    if (filter.AuthorId.HasValue)
        query = query.Where(p => p.AuthorId == filter.AuthorId.Value);

    if (filter.IsPublished.HasValue)
        query = query.Where(p => p.IsPublished == filter.IsPublished.Value);

    if (filter.FromDate.HasValue)
        query = query.Where(p => p.CreatedAt >= filter.FromDate.Value);

    if (filter.ToDate.HasValue)
        query = query.Where(p => p.CreatedAt <= filter.ToDate.Value);

    var posts = await query
        .Select(p => new PostDto
        {
            Id = p.Id,
            Title = p.Title,
            Content = p.Content.Length > 150 ? p.Content.Substring(0, 150) + "..." : p.Content,
            CreatedAt = p.CreatedAt,
            ImageUrl = p.ImageUrl,
            IsPublished = p.IsPublished,
            ViewCount = p.ViewCount,
            Author = p.Author != null ? new AuthorDto
            {
                Id = p.Author.Id,
                Name = p.Author.Name
            } : new AuthorDto(),
            Categories = p.PostCategories.Select(pc => new CategoryDto
            {
                Id = pc.Category.Id,
                Name = pc.Category.Name
            }).ToList(),
            Tags = p.PostTags.Select(pt => new TagDto
            {
                Id = pt.Tag.Id,
                Name = pt.Tag.Name
            }).ToList()
        })
        .ToListAsync();

    return Ok(posts);
}


    // Tüm etiketleri döndür
    [HttpGet("tags")]
    public async Task<IActionResult> GetTags()
    {
        var tags = await _context.Tags
            .Select(t => new TagDto { Id = t.Id, Name = t.Name })
            .ToListAsync();

        return Ok(tags);
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

            var postDto = MapPostToDto(post);

            return Ok(postDto);
        }
        /// <summary>Yeni blog yazısı oluşturur.</summary>
        [HttpPost]
[ProducesResponseType(typeof(PostDto), 201)]
[ProducesResponseType(400)]
[Authorize(Roles = "Author,Admin")]
public async Task<IActionResult> CreatePost([FromBody] PostCreateDto postDto)
{
    // JWT içindeki kullanıcı adını al
    var username = User.Identity?.Name;
    if (string.IsNullOrEmpty(username))
        return Unauthorized("Kullanıcı kimliği alınamadı.");

    // Token'daki isme göre yazar kontrolü
    var author = await _context.Authors.FirstOrDefaultAsync(a => a.Name == username);
    if (author == null)
        return BadRequest("Kullanıcıya ait yazar bulunamadı.");

    // Gönderilen kategori ID'leri geçerli mi?
    if (postDto.CategoryIds.Any())
    {
        var validCategoryCount = await _context.Categories
            .CountAsync(c => postDto.CategoryIds.Contains(c.Id));
        if (validCategoryCount != postDto.CategoryIds.Distinct().Count())
            return BadRequest("Bir veya daha fazla kategori ID'si geçersiz.");
    }

    // Gönderilen etiket ID'leri geçerli mi?
    if (postDto.TagIds.Any())
    {
        var validTagCount = await _context.Tags
            .CountAsync(t => postDto.TagIds.Contains(t.Id));
        if (validTagCount != postDto.TagIds.Distinct().Count())
            return BadRequest("Bir veya daha fazla etiket ID'si geçersiz.");
    }

    // Post oluştur
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

    // İlişkili kategorileri ekle
    post.PostCategories = postDto.CategoryIds.Select(catId => new PostCategory
    {
        CategoryId = catId
    }).ToList();

    // İlişkili etiketleri ekle
    post.PostTags = postDto.TagIds.Select(tagId => new PostTag
    {
        TagId = tagId
    }).ToList();

    _context.Posts.Add(post);
    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(CreatePost), new { id = post.Id }, post);
}


        // Tüm kategorileri döndür
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories
                .Select(c => new CategoryDto { Id = c.Id, Name = c.Name })
                .ToListAsync();
            return Ok(categories);
        }

        // Tüm yazarları döndür
        [HttpGet("authors")]
        public async Task<IActionResult> GetAuthors()
        {
            var authors = await _context.Authors
                .Select(a => new AuthorDto { Id = a.Id, Name = a.Name })
                .ToListAsync();
            return Ok(authors);
        }


    [HttpPut("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [Authorize]
    public async Task<IActionResult> UpdatePost(int id, [FromBody] PostUpdateDto postUpdateDto)
    {
        var existingPost = await _context.Posts
            .Include(p => p.Author)
            .Include(p => p.PostCategories)
            .Include(p => p.PostTags)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (existingPost == null) return NotFound();

        var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userIdFromToken == null)
            return Unauthorized();

        bool isPostOwner = existingPost.AuthorId.ToString() == userIdFromToken;
        bool isAdmin = userRole == "Admin";

        if (!isPostOwner && !isAdmin)
            return Forbid("Sadece yazının sahibi veya admin düzenleyebilir.");

        // DTO'dan gelen verilerle güncelle
        existingPost.Title = postUpdateDto.Title;
        existingPost.Content = postUpdateDto.Content;
        existingPost.ImageUrl = postUpdateDto.ImageUrl;
        existingPost.IsPublished = postUpdateDto.IsPublished;

        // Kategoriler
        existingPost.PostCategories.Clear();
        if (postUpdateDto.CategoryIds.Any())
        {
            existingPost.PostCategories = postUpdateDto.CategoryIds
                .Select(catId => new PostCategory { PostId = id, CategoryId = catId })
                .ToList();
        }

        // Etiketler
        existingPost.PostTags.Clear();
        if (postUpdateDto.TagIds.Any())
        {
            existingPost.PostTags = postUpdateDto.TagIds
                .Select(tagId => new PostTag { PostId = id, TagId = tagId })
                .ToList();
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }


        /// <summary>Belirli ID'ye sahip blog yazısını siler.</summary>

        [HttpDelete("{id}")]
        [Authorize] // 🔐 Giriş yapmış herkes, ama kontrol içeride yapılacak
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> DeletePost(int id)
        {
            var post = await _context.Posts.Include(p => p.Author).FirstOrDefaultAsync(p => p.Id == id);
            if (post == null) return NotFound();

            var username = User.Identity?.Name;
            var isAdmin = User.IsInRole("Admin");

            if (!isAdmin && post.Author?.Name != username)
            {
                return Forbid("Sadece kendi yazınızı silebilirsiniz.");
            }

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
            return NoContent();
        }


        private PostDto MapPostToDto(Post post)
        {
            return new PostDto
            {
                Id = post.Id,
                Title = post.Title,
                Content = post.Content,
                CreatedAt = post.CreatedAt,
                ImageUrl = post.ImageUrl,
                IsPublished = post.IsPublished,
                ViewCount = post.ViewCount,
                Author = post.Author != null ? new AuthorDto
                {
                    Id = post.Author.Id,
                    Name = post.Author.Name
                } : new AuthorDto(),
                Categories = post.PostCategories?.Select(pc => new CategoryDto
                {
                    Id = pc.Category.Id,
                    Name = pc.Category.Name
                }).ToList() ?? new List<CategoryDto>(),
                Tags = post.PostTags?.Select(pt => new TagDto
                {
                    Id = pt.Tag.Id,
                    Name = pt.Tag.Name
                }).ToList() ?? new List<TagDto>(),
                Comments = post.Comments?.Select(c => new CommentDto
                {
                    Id = c.Id,
                    Name = c.Name ?? "",
                    Email = c.Email ?? "",
                    Message = c.Message,
                    CreatedAt = c.CreatedAt
                }).ToList() ?? new List<CommentDto>()
            };
        }
    }
}
