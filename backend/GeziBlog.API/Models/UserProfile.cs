namespace GeziBlog.API.Models
{
    public class UserProfile
    {
        public int Id { get; set; }  // PK = AuthorId ile eşleşmeli

        public int AuthorId { get; set; }  // 1:1 bağlantı
        public Author Author { get; set; } = null!;

        public int Age { get; set; }
        public string Gender { get; set; } = "NotSpecified";
        public string? Nationality { get; set; }
        public string? Occupation { get; set; }
        public string? City { get; set; }
    }
}
