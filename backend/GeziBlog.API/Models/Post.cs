using GeziBlog.API.Models;

public class Post
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int AuthorId { get; set; }
    public Author? Author { get; set; }

    public string? ImageUrl { get; set; }
    public bool IsPublished { get; set; } = true;
    public int ViewCount { get; set; } = 0;

    public ICollection<PostCategory> PostCategories { get; set; } = new List<PostCategory>();
    public ICollection<PostTag> PostTags { get; set; } = new List<PostTag>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}
