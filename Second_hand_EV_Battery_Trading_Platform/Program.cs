using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Extensions;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// 🔐 1️⃣ Cấu hình xác thực Keycloak JWT
var keycloak = configuration.GetSection("Keycloak");

var key = Encoding.UTF8.GetBytes(configuration["Jwt:Key"]);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
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

// 🧩 4️⃣ Controllers
builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()   // Cho phép mọi tên miền
            .AllowAnyMethod()   // Cho phép mọi phương thức (GET, POST, PUT, DELETE, ...)
            .AllowAnyHeader();  // Cho phép mọi header
    });
});

var app = builder.Build();

app.UseHttpsRedirection();

// Serve static files from wwwroot for uploaded images
app.UseStaticFiles();

// 🌐 Sử dụng CORS
app.UseCors("AllowAll");

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



app.MapControllers();

app.Run();
