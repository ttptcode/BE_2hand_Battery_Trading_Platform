using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

/// <summary>
/// Background service để expire pending payments sau 10 phút
/// </summary>
public class PaymentExpirationService : BackgroundService
{
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ILogger<PaymentExpirationService> _logger;

    public PaymentExpirationService(
        IServiceScopeFactory serviceScopeFactory,
        ILogger<PaymentExpirationService> logger)
    {
        _serviceScopeFactory = serviceScopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // Chạy mỗi 1 phút để kiểm tra pending payments
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

                using var scope = _serviceScopeFactory.CreateScope();
                var vnpayService = scope.ServiceProvider.GetRequiredService<VNpayService>();

                await vnpayService.ExpirePendingPaymentsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in PaymentExpirationService");
            }
        }
    }
}

