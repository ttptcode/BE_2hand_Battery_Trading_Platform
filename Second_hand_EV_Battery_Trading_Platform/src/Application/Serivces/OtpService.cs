using System;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

public class OtpService : IOtpService
{
    private readonly IOtpRepository _otpRepository;
    private readonly IConfiguration _configuration;
    private readonly ILogger<OtpService> _logger;

    private readonly int _expiryMinutes;
    private readonly int _maxSendPerHour;
    private readonly int _maxVerifyAttempts;
    private readonly string? _twilioSid;
    private readonly string? _twilioToken;
    private readonly string? _twilioFrom;

    public OtpService(IOtpRepository otpRepository, IConfiguration configuration, ILogger<OtpService> logger)
    {
        _otpRepository = otpRepository;
        _configuration = configuration;
        _logger = logger;

        _expiryMinutes = int.TryParse(configuration["Otp:ExpiryMinutes"], out var em) ? em : 5;
        _maxSendPerHour = int.TryParse(configuration["Otp:MaxSendPerHour"], out var ms) ? ms : 5;
        _maxVerifyAttempts = int.TryParse(configuration["Otp:MaxVerifyAttempts"], out var ma) ? ma : 5;

        _twilioSid = configuration["Twilio:AccountSid"];
        _twilioToken = configuration["Twilio:AuthToken"];
        _twilioFrom = configuration["Twilio:From"];
    }

    public async Task<SendOtpResponse> SendOtpAsync(string phone)
    {
        var since = DateTime.UtcNow.AddHours(-1);
        var sentCount = await _otpRepository.CountSentSinceAsync(phone, since);
        if (sentCount >= _maxSendPerHour)
        {
            _logger.LogWarning("OTP send rate limit hit for {Phone}. sentCount={SentCount}", phone, sentCount);
            throw new InvalidOperationException("Too many OTP requests. Try again later.");
        }

        // generate secure 6-digit OTP
        var val = RandomNumberGenerator.GetInt32(0, 1000000);
        var otp = val.ToString("D6");

        // generate salt and hash
        var salt = GenerateSalt(16);
        var hash = ComputeHash(otp, salt);

        var now = DateTime.UtcNow;
        var expiresAt = now.AddMinutes(_expiryMinutes);

        // send via Twilio (required config)
        if (string.IsNullOrEmpty(_twilioSid) || string.IsNullOrEmpty(_twilioToken) || string.IsNullOrEmpty(_twilioFrom))
        {
            _logger.LogError("Twilio configuration missing, cannot send OTP to {Phone}", phone);
            throw new InvalidOperationException("SMS provider not configured.");
        }

        try
        {
            TwilioClient.Init(_twilioSid, _twilioToken);
            var message = MessageResource.Create(
                to: new PhoneNumber(phone),
                from: new PhoneNumber(_twilioFrom),
                body: $"Your verification code is: {otp}. Expires in {_expiryMinutes} minute(s)."
            );
            _logger.LogInformation("Sent OTP SMS (sid={Sid}) to {Phone}", message.Sid, phone);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send OTP SMS to {Phone}", phone);
            throw new InvalidOperationException("Failed to send SMS: " + ex.Message, ex);
        }

        var entity = new OtpSaving
        {
            OtpSavingId = Guid.NewGuid(),
            Phone = phone,
            OtpHash = hash,
            Salt = salt,
            Attempts = 0,
            CreatedAt = now,
            ExpiresAt = expiresAt,
            IsUsed = false
        };

        await _otpRepository.AddAsync(entity);

        return new SendOtpResponse { ExpiresAt = expiresAt };
    }

    public async Task<(bool Success, string? Error)> VerifyOtpAsync(string phone, string otp)
    {
        var rec = await _otpRepository.GetLatestUnexpiredAsync(phone);
        if (rec == null)
        {
            _logger.LogInformation("No active OTP found for {Phone}", phone);
            return (false, "OTP not found or expired");
        }

        if (rec.Attempts >= _maxVerifyAttempts)
        {
            _logger.LogWarning("OTP verification attempts exceeded for {Phone}", phone);
            // mark used/locked to prevent further attempts
            await _otpRepository.MarkAsUsedAsync(rec);
            return (false, "Too many verification attempts");
        }

        var computed = ComputeHash(otp, rec.Salt);

        // constant-time comparison
        var recHashBytes = Convert.FromBase64String(rec.OtpHash);
        var compBytes = Convert.FromBase64String(computed);

        if (recHashBytes.Length != compBytes.Length)
        {
            await _otpRepository.IncrementAttemptsAsync(rec);
            _logger.LogInformation("OTP mismatch (length) for {Phone}", phone);
            return (false, "OTP is invalid");
        }

        if (System.Security.Cryptography.CryptographicOperations.FixedTimeEquals(recHashBytes, compBytes))
        {
            await _otpRepository.MarkAsUsedAsync(rec);
            _logger.LogInformation("OTP verified for {Phone}", phone);
            return (true, null);
        }

        await _otpRepository.IncrementAttemptsAsync(rec);
        _logger.LogInformation("OTP mismatch for {Phone} (attempts={Attempts})", phone, rec.Attempts + 1);
        return (false, "OTP is invalid");
    }

    // helpers
    private static string GenerateSalt(int size)
    {
        var bytes = new byte[size];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes);
    }

    private static string ComputeHash(string otp, string saltBase64)
    {
        var salt = Convert.FromBase64String(saltBase64);
        var otpBytes = Encoding.UTF8.GetBytes(otp);
        var combined = new byte[salt.Length + otpBytes.Length];
        Buffer.BlockCopy(salt, 0, combined, 0, salt.Length);
        Buffer.BlockCopy(otpBytes, 0, combined, salt.Length, otpBytes.Length);

        using var sha = SHA256.Create();
        var hash = sha.ComputeHash(combined);
        return Convert.ToBase64String(hash);
    }
}