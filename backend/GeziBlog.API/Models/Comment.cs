namespace GeziBlog.API.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public Post Post { get; set; } = null!;
        
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
