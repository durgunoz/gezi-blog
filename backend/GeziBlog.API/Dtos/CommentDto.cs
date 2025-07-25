namespace GeziBlog.API.Dtos
{
    public class CommentDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        public int? UserId { get; set; } 
    }
}
