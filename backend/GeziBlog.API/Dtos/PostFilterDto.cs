using System;
using System.ComponentModel.DataAnnotations;

namespace GeziBlog.API.Dtos
{
    public class PostFilterDto
    {
        public string? Title { get; set; }

        public int? CategoryId { get; set; }

        public int? AuthorId { get; set; }

        public bool? IsPublished { get; set; }

        public DateTime? FromDate { get; set; }

        public DateTime? ToDate { get; set; }
    }
}