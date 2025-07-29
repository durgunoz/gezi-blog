namespace GeziBlog.API.Dtos
{
    public class UserProfileDto
    {
        public int Age { get; set; }
        public string Gender { get; set; } = "NotSpecified";
        public string? Nationality { get; set; }
        public string? Occupation { get; set; }
        public string? City { get; set; }
    }
}
