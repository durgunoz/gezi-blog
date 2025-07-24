using System.Collections.Generic;

namespace GeziBlog.API.Models
{
    public class Author
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string Role { get; set; } = "Reader";
        public ICollection<Post> Posts { get; set; } = new List<Post>();

    }
}