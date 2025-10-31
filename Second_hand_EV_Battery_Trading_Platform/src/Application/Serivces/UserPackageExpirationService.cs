using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Persistence;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

public class UserPackageExpirationService : BackgroundService
{
    private readonly ILogger<UserPackageExpirationService> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly TimeSpan _checkInterval;

    public UserPackageExpirationService(IServiceProvider serviceProvider, ILogger<UserPackageExpirationService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        // Default interval: 1 hour. You can change or make configurable later.
        _checkInterval = TimeSpan.FromHours(1);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("UserPackageExpirationService started. Checking every {Interval}", _checkInterval);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RemoveExpiredUserPackagesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while removing expired user packages");
            }

            try
            {
                await Task.Delay(_checkInterval, stoppingToken);
            }
            catch (TaskCanceledException) { /* shutting down */ }
        }

        _logger.LogInformation("UserPackageExpirationService stopping");
    }

    private async Task RemoveExpiredUserPackagesAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<OemEvWarrantyContext>();

        var now = DateTime.UtcNow;

        var expired = await db.UserPackages
            .Where(up => up.ExpiredAt <= now)
            .ToListAsync(cancellationToken);

        if (expired == null || expired.Count == 0)
        {
            _logger.LogDebug("No expired user packages found at {Now}", now);
            return;
        }

        _logger.LogInformation("Found {Count} expired user packages. Deleting...", expired.Count);

        db.UserPackages.RemoveRange(expired);
        await db.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Deleted {Count} expired user packages", expired.Count);
    }
}
