using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace GeziBlog.API.Dtos
{
    public class PostCreateDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public string? ImageUrl { get; set; }

        public bool IsPublished { get; set; } = true;

        public List<int> CategoryIds { get; set; } = new();
        public List<int> TagIds { get; set; } = new();
    }
}
