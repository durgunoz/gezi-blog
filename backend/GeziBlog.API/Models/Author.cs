namespace GeziBlog.API.Models
{
    public class Author
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Bio { get; set; }
        public string? ProfileImage { get; set; }
        public ICollection<Post>? Posts { get; set; }
    }
}
