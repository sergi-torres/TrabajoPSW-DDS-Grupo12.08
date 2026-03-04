using Microsoft.EntityFrameworkCore;
using Votify.API.Models.Domain;

namespace Votify.API.Data
{
    public class VotifyDbContext : DbContext
    {
        public VotifyDbContext(DbContextOptions<VotifyDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
    }
}