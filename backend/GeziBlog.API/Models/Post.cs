using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GeziBlog.API.Models.Enums;


namespace GeziBlog.API.Models
{
    public class Post
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;  // Gezi Başlığı

        [Required]
        public string ShortDescription { get; set; } = string.Empty; // Kısa açıklama

        [Required]
        public string ConQtent { get; set; } = string.Empty; // Uzun yazı

        public string? CoverImageUrl { get; set; } // Ana görsel

        public List<string>? GalleryImageUrls { get; set; } // Çoklu görseller (opsiyonel)

        [Required]
        public TripType TripType { get; set; }  // 🔁 Enum'a çevrildi

        [Required]
        public BudgetRange Budget { get; set; }  // 🔁 Enum'a çevrildi

        [Required]
        public DateTime TripDate { get; set; } // Tatil tarihi

        // Entegrasyon sonra: kullanıcı giriş sistemiyle doldurulacak
        [ForeignKey("Author")]
        public int AuthorId { get; set; }
        public Author? Author { get; set; }
    }
}
