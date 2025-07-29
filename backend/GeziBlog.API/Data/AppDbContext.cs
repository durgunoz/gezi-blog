using GeziBlog.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GeziBlog.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Post> Posts { get; set; }
        public DbSet<Author> Authors { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<PostCategory> PostCategories { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<PostTag> PostTags { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Post-Category ilişkisi (Çoka çok)
            modelBuilder.Entity<PostCategory>()
                .HasKey(pc => new { pc.PostId, pc.CategoryId });

            // Post-Tag ilişkisi (Çoka çok)
            modelBuilder.Entity<PostTag>()
                .HasKey(pt => new { pt.PostId, pt.TagId });

            // Author <-> UserProfile birebir ilişkisi
            modelBuilder.Entity<Author>()
                .HasOne(a => a.Profile)
                .WithOne(p => p.Author)
                .HasForeignKey<UserProfile>(p => p.Id)
                .OnDelete(DeleteBehavior.Cascade);

            // UserProfile.Id hem PK hem FK olacak
            modelBuilder.Entity<UserProfile>()
                .HasKey(p => p.Id);

            modelBuilder.Entity<UserProfile>()
                .Property(p => p.Id)
                .ValueGeneratedNever(); // Otomatik artmasın çünkü Author.Id ile aynı olacak
        }
    }
}
