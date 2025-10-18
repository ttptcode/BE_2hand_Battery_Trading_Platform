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
    options.Events = new JwtBearerEvents
    {
        OnChallenge = context =>
        {
            context.HandleResponse();
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            var result = ApiResponse<object>.ErrorResult("Unauthorized access - Invalid or missing token");
            return context.Response.WriteAsJsonAsync(result);
        },
        OnForbidden = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";
            var result = ApiResponse<object>.ErrorResult("Forbidden - You do not have permission to access this resource");
            return context.Response.WriteAsJsonAsync(result);
        },
        OnAuthenticationFailed = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            var result = ApiResponse<object>.ErrorResult("Authentication failed", context.Exception.Message);
            return context.Response.WriteAsJsonAsync(result);
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
        Title = "Second-hand EV Battery API",
        Version = "v1",
        Description = "API xác thực JWT và phân quyền (admin / user)"
    });

    // 🟢 Dùng Bearer token (JWT) thay vì OAuth2 form login
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập token của bạn vào đây (không cần gõ chữ Bearer).",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,          // 🔹 đổi từ ApiKey → Http
        Scheme = "bearer",                       // 🔹 chữ thường
        BearerFormat = "JWT"                     // 🔹 thêm dòng này
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

var app = builder.Build();

// 🧰 5️⃣ Pipeline middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Second-hand EV Battery API v1");

        // ✅ Cấu hình OAuth2 login trực tiếp trên Swagger UI
        options.OAuthClientId(keycloak["ClientId"]);
        options.OAuthAppName("Swagger Keycloak Login");
        options.OAuthUsePkce();
    });
}

app.UseHttpsRedirection();

// 🔒 Authentication luôn trước Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
