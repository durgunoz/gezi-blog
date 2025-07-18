using GeziBlog.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GeziBlog.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

        public DbSet<Post> Posts => Set<Post>();
        public DbSet<Author> Authors => Set<Author>();
    }
}
