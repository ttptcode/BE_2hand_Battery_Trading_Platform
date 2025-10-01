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
            services.AddScoped<IFeeCommissionRepository, FeeCommissionRepository>();
            services.AddScoped<IPaymentTransactionRepository, PaymentTransactionRepository>();
            // Add Services
            services.AddScoped<IItemService, ItemService>();
            services.AddScoped<IBiddingService, BiddingService>();
            services.AddScoped<IListingService, ListingService>();
            services.AddScoped<IFeeCommissionService, FeeCommissionService>();
            services.AddScoped<IPaymentService, PaymentService>();

            return services;
        }
    }
}
