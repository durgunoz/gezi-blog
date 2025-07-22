using System;
using System.Collections.Generic;

namespace GeziBlog.API.Dtos
{
    public class PostDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsPublished { get; set; }
        public int ViewCount { get; set; }

        public AuthorDto Author { get; set; } = new();
        public List<CategoryDto> Categories { get; set; } = new();
        public List<TagDto> Tags { get; set; } = new();
        public List<CommentDto> Comments { get; set; } = new();
    }
}
