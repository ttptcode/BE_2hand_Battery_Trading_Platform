using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Persistence;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Extensions
{
    public static class ServiceExtensionCollection
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Add DbContext
            services.AddDbContext<OemEvWarrantyContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

            // Add Repositories
            services.AddScoped<IItemRepository, ItemRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IBidRepository, BidRepository>();
            services.AddScoped<IListingRepository, ListingRepository>();

            // Add Services
            services.AddScoped<IItemService, ItemService>();
            services.AddScoped<IBiddingService, BiddingService>();

            return services;
        }
    }
}
