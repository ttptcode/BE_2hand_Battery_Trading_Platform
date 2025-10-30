using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Hubs;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Extensions;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;
using Second_hand_EV_Battery_Trading_Platform.src.Helpers;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.DataProtection;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// 🇻🇳 Cấu hình múi giờ Việt Nam
builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    options.DefaultRequestCulture = new Microsoft.AspNetCore.Localization.RequestCulture("vi-VN");
    options.SupportedCultures = new[] { new System.Globalization.CultureInfo("vi-VN") };
    options.SupportedUICultures = new[] { new System.Globalization.CultureInfo("vi-VN") };
});
builder.Services.AddMemoryCache();
// Cấu hình TimeZone cho toàn bộ ứng dụng
System.Globalization.CultureInfo.DefaultThreadCurrentCulture = new System.Globalization.CultureInfo("vi-VN");
System.Globalization.CultureInfo.DefaultThreadCurrentUICulture = new System.Globalization.CultureInfo("vi-VN");

// 🔧 Cấu hình Data Protection để fix correlation cookie issues
builder.Services.AddDataProtection()
    .SetApplicationName("SecondHandEVBatteryPlatform")
    .SetDefaultKeyLifetime(TimeSpan.FromDays(90));

// 🔐 1️⃣ Cấu hình xác thực Keycloak JWT
var keycloak = configuration.GetSection("Keycloak");

var key = Encoding.UTF8.GetBytes(configuration["Jwt:Key"]);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
})
   .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
   {
       // 🔧 Cấu hình cookie để fix correlation failed
       options.Cookie.Name = ".AspNetCore.Correlation";
       options.Cookie.HttpOnly = false; // Cho phép JavaScript access để debug
       options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest; // Sử dụng SameAsRequest thay vì None
       options.Cookie.SameSite = SameSiteMode.Lax; // Sử dụng Lax thay vì None
       options.Cookie.IsEssential = true;
       options.ExpireTimeSpan = TimeSpan.FromMinutes(30); // Tăng thời gian sống
       options.SlidingExpiration = true; // Reset thời gian khi có activity
       options.Cookie.Path = "/"; // Đảm bảo cookie có path đúng
   })




.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
        RoleClaimType = ClaimTypes.Role,
        NameClaimType = ClaimTypes.Name
    };

    // ✅ Xử lý lỗi JWT bằng ApiResponse
    // ...
    options.Events = new JwtBearerEvents
    {
        // 🚀 SignalR Authentication Support
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chathub"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            // 1. Dừng các xử lý mặc định. ĐÂY LÀ DÒNG QUAN TRỌNG NHẤT!
            context.HandleResponse();

            // 2. Bây giờ bạn có thể an toàn tùy chỉnh response
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            var result = ApiResponse<object>.ErrorResult("Unauthorized access - Invalid or missing token");

            // Trả về Task từ việc ghi response
            return context.Response.WriteAsJsonAsync(result);
        },
        OnForbidden = context =>
        {
            // Tương tự, dừng xử lý mặc định

            context.Response.ContentType = "application/json";
            var result = ApiResponse<object>.ErrorResult("Forbidden: You do not have permission to access this resource.");
            return context.Response.WriteAsJsonAsync(result);
        },
        OnAuthenticationFailed = context =>
        {
            // Tương tự, dừng xử lý mặc định
            // Ghi log lỗi để debug.
            // Bạn có thể dùng ILogger ở đây nếu đã inject.
            Console.WriteLine($"Authentication failed: {context.Exception.Message}");

            // KHÔNG làm gì với response ở đây.
            // Pipeline sẽ tự động chuyển sang OnChallenge để xử lý response 401.
            return Task.CompletedTask;
        }
    };

})

   .AddGoogle(googleOptions =>
    {
        googleOptions.ClientId = builder.Configuration["Authentication:Google:ClientId"];
        googleOptions.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];

        // ⚡ Thêm đủ scope
        googleOptions.Scope.Add("https://www.googleapis.com/auth/userinfo.email");
        googleOptions.Scope.Add("https://www.googleapis.com/auth/userinfo.profile");
        googleOptions.Scope.Add("https://www.googleapis.com/auth/user.phonenumbers.read");

        // ⚡ Yêu cầu token để gọi API
        googleOptions.SaveTokens = true;

        // ⚡ (Optional) xác nhận đường redirect chuẩn
        googleOptions.CallbackPath = "/signin-google";
        
        // 🔧 Cấu hình để fix correlation failed error
        googleOptions.Events.OnCreatingTicket = context =>
        {
            // Đảm bảo correlation state được xử lý đúng
            // Skip correlation validation cho production
            return Task.CompletedTask;
        };
        
        googleOptions.Events.OnRemoteFailure = context =>
        {
            // Log lỗi correlation để debug
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError("Google OAuth remote failure: {Error}", context.Failure?.Message);
            
            // Redirect về OAuth error endpoint thay vì root domain
            var errorUrl = $"/api/Auth/oauth-error?error=oauth_failed&message={Uri.EscapeDataString(context.Failure?.Message ?? "Unknown error")}&returnUrl=/";
            context.Response.Redirect(errorUrl);
            context.HandleResponse();
            return Task.CompletedTask;
        };
        
        // 🔧 Workaround: Disable correlation validation cho production
        googleOptions.CorrelationCookie.Name = ".AspNetCore.Correlation";
        googleOptions.CorrelationCookie.HttpOnly = false;
        googleOptions.CorrelationCookie.SecurePolicy = CookieSecurePolicy.SameAsRequest; // Sử dụng SameAsRequest
        googleOptions.CorrelationCookie.SameSite = SameSiteMode.Lax; // Sử dụng Lax thay vì None
        googleOptions.CorrelationCookie.IsEssential = true;
    });


builder.Services.AddAuthorization();

// 🧱 2️⃣ Cấu hình Swagger với OAuth2 (Keycloak Password Flow)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Second-hand EV Battery Trading Platform API",
        Version = "v1",
        Description = "API cho nền tảng giao dịch pin xe điện cũ với xác thực JWT và phân quyền",
        Contact = new OpenApiContact
        {
            Name = "Development Team",
            Email = "dev@example.com"
        },
        License = new OpenApiLicense
        {
            Name = "MIT License"
        }
    });

    // 🟢 Dùng Bearer token (JWT) thay vì OAuth2 form login
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập JWT token của bạn vào đây (không cần gõ chữ Bearer).",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });

    // 📝 Cấu hình XML documentation
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }

    // 🏷️ Cấu hình tags và grouping
    c.TagActionsBy(api => new[] { api.GroupName ?? api.ActionDescriptor.RouteValues["controller"] });
    c.DocInclusionPredicate((name, api) => true);
});

// 🧩 3️⃣ Đăng ký các dịch vụ hạ tầng
builder.Services.AddInfrastructureServices(configuration);
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<IConversationRepository, ConversationRepository>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();
builder.Services.AddScoped<VNpayService>();
builder.Services.AddScoped<IUserReputationReviewRepository, UserReputationReviewRepository>();
builder.Services.AddScoped<IUserReputationReviewService, UserReputationReviewService>();
// 🔄 Background service để expire pending payments
builder.Services.AddHostedService<PaymentExpirationService>();
// Repository
builder.Services.AddScoped<IFavoriteRepository, FavoriteRepository>();

// Service
builder.Services.AddScoped<IFavoriteService, FavoriteService>();
// 🔐 Background service để tự động seed admin user
builder.Services.AddHostedService<AdminSeedingService>();
builder.Services.AddHttpClient();


// 🚀 4️⃣ SignalR Configuration
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
});

// 🧩 5️⃣ Controllers với timezone converter
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new VietnamDateTimeConverter());
        options.JsonSerializerOptions.Converters.Add(new VietnamNullableDateTimeConverter());
    });

// Configure form options để cho phép upload file lớn
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 1073741824; // 1GB
    options.ValueLengthLimit = int.MaxValue;
    options.ValueCountLimit = int.MaxValue;
});

// Cấu hình Kestrel để cho phép request body lớn
builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = 1073741824; // 1GB
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()   // Cho phép mọi tên miền
            .AllowAnyMethod()   // Cho phép mọi phương thức (GET, POST, PUT, DELETE, ...)
            .AllowAnyHeader();  // Cho phép mọi header
    });
    
    // CORS policy cho React development và production
    options.AddPolicy("ReactDev", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000", 
                "http://localhost:3001", 
                "http://localhost:5173",
                "https://vehiclemarket.runasp.net", // Thêm domain production
                "http://vehiclemarket.runasp.net"  // Thêm HTTP version
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials() // Cần thiết cho SignalR và OAuth
            .SetIsOriginAllowedToAllowWildcardSubdomains(); // Cho phép subdomain
    });
});

var app = builder.Build();

app.UseHttpsRedirection();

// 🇻🇳 Sử dụng localization middleware
app.UseRequestLocalization();

// Serve static files from wwwroot for uploaded images
app.UseStaticFiles();

// 🌐 Sử dụng CORS - ReactDev cho development, AllowAll cho production
app.UseCors("ReactDev");

// 🔒 Authentication luôn trước Authorization
app.UseAuthentication();
app.UseAuthorization();

// Bật Swagger sau Authentication để tránh conflict
// 🧰 5️⃣ Pipeline middleware

    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Second-hand EV Battery API v1");

        // ✅ Cấu hình OAuth2 login trực tiếp trên Swagger UI
        options.OAuthClientId(keycloak["ClientId"]);
        options.OAuthAppName("Swagger Keycloak Login");
        options.OAuthUsePkce();
    });



// 🚀 Map SignalR Hub
app.MapHub<ChatHub>("/chathub");

app.MapControllers();

app.Run();
