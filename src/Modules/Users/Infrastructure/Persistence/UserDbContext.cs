using Microsoft.EntityFrameworkCore;
using Modules.Users.Infrastructure.Persistence.Entities;

namespace Modules.Users.Infrastructure.Persistence
{
    public class UserDbContext : DbContext
    {
        public UserDbContext(DbContextOptions<UserDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserReputationReview> UserReputationReviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Fluent API configuration if needed
        }
    }
}