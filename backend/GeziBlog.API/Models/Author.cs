using System.Collections.Generic;

namespace GeziBlog.API.Models
{
    public class Author
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public ICollection<Post> Posts { get; set; } = new List<Post>();
    }
}