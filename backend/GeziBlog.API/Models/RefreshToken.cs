namespace GeziBlog.API.Models
{
    public class RefreshToken
    {
        public int Id { get; set; }
        public string Token { get; set; }
        public int AuthorId { get; set; }
        public Author Author { get; set; }
        public DateTime ExpiryDate { get; set; }
    }
}
