using System;
using System.ComponentModel.DataAnnotations;

namespace GeziBlog.API.Models
{
    public class RefreshToken
    {
        public int Id { get; set; }

        [Required]
        public string Token { get; set; } = string.Empty;

        public int AuthorId { get; set; }

        [Required]
        public Author Author { get; set; } = null!;

        public DateTime ExpiryDate { get; set; }
    }
}
