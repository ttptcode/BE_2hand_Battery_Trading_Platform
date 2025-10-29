using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Helpers;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Persistence;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces
{
    /// <summary>
    /// Background service để tự động tạo admin user khi app khởi động
    /// </summary>
    public class AdminSeedingService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AdminSeedingService> _logger;

        public AdminSeedingService(
            IServiceProvider serviceProvider,
            ILogger<AdminSeedingService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Đợi 10 giây để app hoàn toàn khởi động và database sẵn sàng
            await Task.Delay(10000, stoppingToken);

            const int maxRetries = 3;
            const int retryDelaySeconds = 5;

            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    _logger.LogInformation("🔐 Bắt đầu seed admin user... (Attempt {Attempt}/{MaxAttempts})", attempt, maxRetries);

                    using var scope = _serviceProvider.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<OemEvWarrantyContext>();

                    // Test database connection với timeout ngắn
                    var canConnect = await DatabaseHelper.IsDatabaseReadyAsync(dbContext, stoppingToken);
                    if (!canConnect)
                    {
                        _logger.LogWarning("⚠️ Cannot connect to database on attempt {Attempt}. Retrying in {Delay} seconds...", attempt, retryDelaySeconds);
                        
                        if (attempt < maxRetries)
                        {
                            await Task.Delay(retryDelaySeconds * 1000, stoppingToken);
                            continue;
                        }
                        else
                        {
                            _logger.LogError("❌ Max retries reached. Skipping admin seed.");
                            return;
                        }
                    }

                    // 1. Tạo hoặc lấy Admin Role
                    var adminRole = await GetOrCreateAdminRoleAsync(dbContext, stoppingToken);

                    // 2. Check xem admin user đã tồn tại chưa
                    var adminPhone = "012345678910";
                    var existingAdmin = await dbContext.Users
                        .FirstOrDefaultAsync(u => u.Phone == adminPhone, stoppingToken);

                    if (existingAdmin == null)
                    {
                        // 3. Tạo admin user mới
                        var adminUser = new User
                        {
                            UserId = Guid.NewGuid(),
                            Phone = adminPhone,
                            FullName = "Administrator",
                            Email = "admin@system.com",
                            PasswordHash = PasswordHelper.HashPassword("admin"),
                            RoleId = adminRole.RoleId,
                            Status = "Active",
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow,
                            Balance = 0
                        };

                        dbContext.Users.Add(adminUser);
                        await dbContext.SaveChangesAsync(stoppingToken);

                        _logger.LogInformation("✅ Admin user đã được tạo thành công!");
                        _logger.LogInformation("📱 Phone: 0123456789");
                        _logger.LogInformation("🔑 Password: admin");
                    }
                    else
                    {
                        _logger.LogInformation("ℹ️ Admin user đã tồn tại trong database");
                    }

                    // Success - exit loop
                    return;
                }
                catch (Microsoft.Data.SqlClient.SqlException sqlEx)
                {
                    _logger.LogWarning("⚠️ Database connection error on attempt {Attempt}: {Message}", attempt, sqlEx.Message);
                    
                    if (attempt < maxRetries)
                    {
                        await Task.Delay(retryDelaySeconds * 1000, stoppingToken);
                        continue;
                    }
                    else
                    {
                        _logger.LogError("❌ Max retries reached. Database connection failed.");
                        return;
                    }
                }
                catch (TaskCanceledException)
                {
                    _logger.LogInformation("ℹ️ Admin seeding cancelled");
                    return;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Unexpected error when seed admin user on attempt {Attempt}", attempt);
                    
                    if (attempt < maxRetries)
                    {
                        await Task.Delay(retryDelaySeconds * 1000, stoppingToken);
                        continue;
                    }
                    else
                    {
                        _logger.LogError("❌ Max retries reached. Giving up on admin seeding.");
                        return;
                    }
                }
            }
        }

        private async Task<Role> GetOrCreateAdminRoleAsync(OemEvWarrantyContext dbContext, CancellationToken cancellationToken = default)
        {
            var adminRole = await dbContext.Roles
                .FirstOrDefaultAsync(r => r.RoleName == "Admin", cancellationToken);

            if (adminRole == null)
            {
                _logger.LogInformation("📝 Tạo Admin role mới...");
                
                adminRole = new Role
                {
                    RoleId = Guid.NewGuid(),
                    RoleName = "Admin",
                    Description = "Administrator role",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                dbContext.Roles.Add(adminRole);
                await dbContext.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("✅ Admin role đã được tạo thành công!");
            }
            else
            {
                _logger.LogInformation("ℹ️ Admin role đã tồn tại");
            }

            return adminRole;
        }
    }

    /// <summary>
    /// Helper class để test database connection
    /// </summary>
    public static class DatabaseHelper
    {
        public static async Task<bool> IsDatabaseReadyAsync(OemEvWarrantyContext dbContext, CancellationToken cancellationToken = default)
        {
            try
            {
                // Test connection với timeout ngắn
                using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                cts.CancelAfter(TimeSpan.FromSeconds(5));
                
                return await dbContext.Database.CanConnectAsync(cts.Token);
            }
            catch
            {
                return false;
            }
        }
    }
}
