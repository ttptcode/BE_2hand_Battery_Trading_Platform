using Azure.Core;
using Google.Protobuf.WellKnownTypes;
using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Application.DTOs;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Persistence;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Repository;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace Second_hand_EV_Battery_Trading_Platform.src.Application.Serivces;

public class VNpayService
{
    private readonly IConfiguration _configuration;
    private readonly IPaymentTransactionRepository _paymentRepo;
    private readonly IUserRepository _userRepo;
    private readonly IUserPackageService _userPackageService;
    private readonly ILogger<VNpayService> _logger;

    private readonly OemEvWarrantyContext _context;
    private readonly IUserPackageRepository _userPackageRepository;

    public VNpayService(
        IConfiguration configuration,
        IPaymentTransactionRepository paymentRepo,
        IUserRepository userRepo,
        IUserPackageService userPackageService,
        ILogger<VNpayService> logger,
        OemEvWarrantyContext context,
        IUserPackageRepository userPackageRepository)
    {
        _configuration = configuration;
        _paymentRepo = paymentRepo;
        _userRepo = userRepo;
        _userPackageService = userPackageService;
        _logger = logger;
        _context = context;
        _userPackageRepository = userPackageRepository;
    }

    /// <summary>
    /// Tạo payment URL từ VNpay
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="amount">Số tiền thanh toán</param>
    /// <param name="listingId">Listing ID (nếu thanh toán cho listing)</param>
    /// <param name="feeId">Fee ID (nếu thanh toán gói)</param>
    /// <remarks>
    /// Trường hợp 1: listingId ≠ null → Thanh toán cho listing
    /// Trường hợp 2: listingId = null, feeId = null → Nạp tiền vào tài khoản
    /// Trường hợp 3: listingId = null, feeId ≠ null → Thanh toán gói
    /// </remarks>
    public async Task<string> CreatePaymentUrlAsync(Guid userId, decimal amount, Guid? listingId = null, Guid? feeId = null)
    {
        try
        {
            var config = _configuration.GetSection("Vnpay");
            var tmnCode = config["TmnCode"];
            var hashSecret = config["HashSecret"];
            var baseUrl = config["BaseUrl"];
            if (feeId.HasValue)
            {
                try
                {
                    // BƯỚC 1: Lấy thông tin của gói người dùng ĐANG CỐ MUA
                    var newPackageFeeInfo = await _context.FeeCommissions.FirstOrDefaultAsync(fc => fc.FeeId == feeId.Value);

                    if (newPackageFeeInfo == null)
                    {
                        throw new InvalidOperationException("Gói phí bạn đang cố mua không tồn tại.");
                    }

                    // BƯỚC 2: Lấy thông tin các gói người dùng ĐANG CÓ
                    var activePackagesResp = await _userPackageService.GetUserPackagesAsync(userId);

                    // Chỉ thực hiện kiểm tra nếu lấy được thông tin gói thành công
                    if (activePackagesResp.Success && activePackagesResp.Data != null)
                    {
                        // QUY TẮC 1: Không cho mua GÓI LẺ nếu đã có GÓI LẺ


                        // QUY TẮC 2: Không cho mua GÓI DÀI HẠN nếu đã có GÓI DÀI HẠN
                        if (newPackageFeeInfo.FeeType != "Pay1v1" &&
                            activePackagesResp.Data.Packages.Any(p => p.FeeCommission?.FeeType != "Pay1v1"))
                        {
                            throw new InvalidOperationException("User này đã có gói dài hạn đang hoạt động.");
                        }
                    }
                }
                // Bắt chính xác lỗi nghiệp vụ và ném lại nó
                catch (InvalidOperationException ex)
                {
                    _logger.LogWarning("Validation failed for user {UserId}: {ErrorMessage}", userId, ex.Message);
                    // Ném lại lỗi gốc để lớp gọi nó (Controller) có thể nhận được thông báo lỗi chính xác
                    throw;
                }
                // Chỉ bắt các lỗi hệ thống không mong muốn khác
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi không mong muốn xảy ra khi xác thực gói cho người dùng {UserId}", userId);

                    // Ném ra một lỗi chung chung cho các vấn đề không lường trước (VD: database sập)
                    throw new InvalidOperationException("Không thể xác thực các gói hiện có của người dùng tại thời điểm này do lỗi hệ thống.");
                }
            }

            // Tạo transaction mới với status "Pending"
            var payment = new PaymentTransaction
            {
                PaymentId = Guid.NewGuid(),
                UserId = userId,
                FeeId = feeId,
                ListingId = listingId,
                Amount = amount,
                PaymentMethod = "VNpay",
                PaymentStatus = "Pending",
                TransactionRef = $"VNPAY_{DateTime.Now:yyyyMMddHHmmss}_{Guid.NewGuid():N}",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _paymentRepo.AddAsync(payment);

            // Tạo URL payment theo chuẩn VNpay
            var vnpParams = new Dictionary<string, string>
            {
                { "vnp_Version", config["Version"] ?? "2.1.0" },
                { "vnp_Command", config["Command"] ?? "pay" },
                { "vnp_TmnCode", tmnCode ?? "" },
                { "vnp_Amount", ((long)(amount * 100)).ToString() },
                { "vnp_CurrCode", config["CurrCode"] ?? "VND" },
                { "vnp_TxnRef", payment.TransactionRef ?? "" },
                { "vnp_OrderInfo", $"Thanh toan: {payment.PaymentId}" },
                { "vnp_OrderType", "other" },
                { "vnp_Locale", config["Locale"] ?? "vn" },
                { "vnp_ReturnUrl", config["PaymentBackReturnUrl"] ?? "" },
                { "vnp_IpAddr", "127.0.0.1" },
                { "vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss") }
            };

            // Remove empty values and sort theo chuẩn VNpay
            var filteredParams = vnpParams
                .Where(x => !string.IsNullOrEmpty(x.Value))
                .OrderBy(x => x.Key)
                .ToDictionary(x => x.Key, x => x.Value);

            // Build query string cho hash (theo chuẩn VNpay - sử dụng WebUtility.UrlEncode)
            var data = new StringBuilder();
            foreach (var (key, value) in filteredParams)
            {
                data.Append(WebUtility.UrlEncode(key) + "=" + WebUtility.UrlEncode(value) + "&");
            }

            var querystring = data.ToString();
            var signData = querystring;
            if (signData.Length > 0)
            {
                signData = signData.Remove(signData.Length - 1, 1); // Remove last '&'
            }

            // Create hash với HMAC-SHA512
            var hash = HmacSHA512(hashSecret ?? "", signData);
            
            // Log để debug
            _logger.LogInformation("Sign Data: {SignData}", signData);
            _logger.LogInformation("Hash: {Hash}", hash);
            
            // Build final URL
            var paymentUrl = $"{baseUrl}?{querystring}vnp_SecureHash={hash}";

            _logger.LogInformation("Created VNpay payment URL for PaymentId: {PaymentId}, URL: {Url}", payment.PaymentId, paymentUrl);

            return paymentUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating VNpay payment URL");
            throw;
        }
    }

    /// <summary>
    /// Xử lý callback từ VNpay
    /// </summary>
    public async Task<PaymentTransaction?> HandleCallbackAsync(Dictionary<string, string> callbackParams)
    {
        try
        {
            var config = _configuration.GetSection("Vnpay");
            var hashSecret = config["HashSecret"];

            // Lấy thông tin từ callback
            var secureHash = callbackParams.GetValueOrDefault("vnp_SecureHash");
            var txnRef = callbackParams.GetValueOrDefault("vnp_TxnRef");
            var responseCode = callbackParams.GetValueOrDefault("vnp_ResponseCode");

            // Validate signature theo chuẩn VNpay
            var sortedParams = callbackParams
                .Where(x => x.Key != "vnp_SecureHash" && x.Key != "vnp_SecureHashType" && !string.IsNullOrEmpty(x.Value))
                .OrderBy(x => x.Key)
                .ToDictionary(x => x.Key, x => x.Value);

            // Build sign data theo chuẩn VNpay (sử dụng WebUtility.UrlEncode)
            var data = new StringBuilder();
            foreach (var (key, value) in sortedParams)
            {
                data.Append(WebUtility.UrlEncode(key) + "=" + WebUtility.UrlEncode(value) + "&");
            }

            var signData = data.ToString();
            if (signData.Length > 0)
            {
                signData = signData.Remove(signData.Length - 1, 1); // Remove last '&'
            }

            var signed = HmacSHA512(hashSecret ?? "", signData);

            _logger.LogInformation("Callback Sign Data: {SignData}", signData);
            _logger.LogInformation("Callback Hash: {Hash}", signed);
            _logger.LogInformation("Callback SecureHash: {SecureHash}", secureHash);

            if (signed != secureHash)
            {
                _logger.LogWarning("Invalid VNpay signature for transaction: {TransactionRef}", txnRef);
                return null;
            }

            // Find payment by TransactionRef
            var payment = await _paymentRepo.GetByTransactionRefAsync(txnRef ?? "");
            if (payment == null)
            {
                _logger.LogWarning("Payment not found for TransactionRef: {TransactionRef}", txnRef);
                return null;
            }

            _logger.LogInformation("Found payment {PaymentId} for TransactionRef {TransactionRef}. Current status={Status}, method={Method}",
                payment.PaymentId, txnRef, payment.PaymentStatus, payment.PaymentMethod);

            // Update status based on response code
            if (responseCode == "00") // Success
            {
                payment.PaymentStatus = "Success";

                // Xử lý logic sau khi thanh toán thành công
                await HandleSuccessfulPaymentAsync(payment);
            }
            else
            {
                payment.PaymentStatus = "Fail";
            }

            // attempt to persist update with logging
            payment.UpdatedAt = DateTime.UtcNow;
            try
            {
                _logger.LogInformation("Updating payment {PaymentId} in database. New status={Status}, method={Method}", payment.PaymentId, payment.PaymentStatus, payment.PaymentMethod);
                await _paymentRepo.UpdateAsync(payment);
                _logger.LogInformation("Payment {PaymentId} updated successfully in database", payment.PaymentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update payment {PaymentId} in database", payment.PaymentId);
                // rethrow or return null depending on desired behavior; here return null so controller returns BadRequest
                return null;
            }

            _logger.LogInformation("Updated payment status to {Status} for PaymentId: {PaymentId}",
                payment.PaymentStatus, payment.PaymentId);

            return payment;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling VNpay callback");
            return null;
        }
    }

    /// <summary>
    /// Hủy payment pending sau 10 phút
    /// </summary>
    public async Task ExpirePendingPaymentsAsync()
    {
        try
        {
            var pendingPayments = await _paymentRepo.GetPendingPaymentsAsync();
            var expiredPayments = pendingPayments
                .Where(p => p.CreatedAt.HasValue &&
                           (DateTime.UtcNow - p.CreatedAt.Value).TotalMinutes > 10)
                .ToList();

            foreach (var payment in expiredPayments)
            {
                payment.PaymentStatus = "Fail";
                payment.UpdatedAt = DateTime.UtcNow;
                await _paymentRepo.UpdateAsync(payment);
                _logger.LogInformation("Expired pending payment: {PaymentId}", payment.PaymentId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error expiring pending payments");
        }
    }

    /// <summary>
    /// Xử lý logic sau khi thanh toán thành công
    /// </summary>
    /// <remarks>
    /// Trường hợp 1: ListingId ≠ null → Thanh toán cho listing (không cần xử lý thêm)
    /// Trường hợp 2: ListingId = null, FeeId = null → Nạp tiền vào tài khoản (cộng vào Balance)
    /// Trường hợp 3: ListingId = null, FeeId ≠ null → Thanh toán gói (gọi PurchasePackageAsync)
    /// </remarks>
    private async Task HandleSuccessfulPaymentAsync(PaymentTransaction payment)
    {
        try
        {
            _logger.LogInformation("Handling successful payment {PaymentId} for UserId {UserId}",
                payment.PaymentId, payment.UserId);

            if (!payment.UserId.HasValue)
            {
                _logger.LogWarning("Payment {PaymentId} has no UserId", payment.PaymentId);
                return;
            }

            var userId = payment.UserId.Value;

            // Chỉ xử lý khi có FeeId (thanh toán cho gói)
            if (payment.FeeId != null)
            {
                // Lấy thông tin của gói phí vừa được thanh toán
                var fee = await _context.FeeCommissions.FirstOrDefaultAsync(fc => fc.FeeId == payment.FeeId.Value);

                if (fee == null)
                {
                    _logger.LogError("FeeCommission with ID {FeeId} not found after successful payment.", payment.FeeId.Value);
                    return; // Không thể tiếp tục nếu không có thông tin gói
                }

                if (!fee.Amount.HasValue || fee.Amount.Value == 0)
                {
                    _logger.LogError("FeeCommission {FeeId} has an invalid Amount.", fee.FeeId);
                    return; // Tránh lỗi chia cho 0
                }

                int month = (int)(payment.Amount.Value / fee.Amount.Value);

                // --- LOGIC MỚI: KIỂM TRA LOẠI GÓI ĐỂ CỘNG DỒN HOẶC TẠO MỚI ---

                // Trường hợp 1: Mua GÓI LẺ ("Pay1v1")
                if (fee.FeeType == "Pay1v1")
                {
                    // Tìm xem người dùng có gói lẻ nào đang hoạt động không
                    var existingPackage = await _context.UserPackages
                        .FirstOrDefaultAsync(up => up.UserId == userId && up.FeeCommission.FeeType == "Pay1v1" && up.Status == "Active");

                    if (existingPackage != null)
                    {
                        // **CẬP NHẬT GÓI CŨ**: Nếu có, cộng dồn lượt đăng và gia hạn
                        _logger.LogInformation("Stacking new purchase onto existing Pay1v1 package for UserId {UserId}", userId);

                        existingPackage.RemainingListings += (fee.MaxListings ?? 0);
                        // Gia hạn thêm 'month' tháng KỂ TỪ NGÀY HẾT HẠN HIỆN TẠI
                        existingPackage.ExpiredAt = existingPackage.ExpiredAt.AddMonths(month);

                        await _userPackageRepository.UpdateUserPackageAsync(existingPackage);
                    }
                    else
                    {
                        // **TẠO GÓI MỚI**: Nếu không có, tạo một gói lẻ mới
                        await CreateNewUserPackage(userId, fee, month);
                    }
                }
                // Trường hợp 2: Mua GÓI DÀI HẠN (không phải "Pay1v1")
                else
                {
                    // Logic mặc định là tạo một gói dài hạn mới
                    // (Giả sử các bước kiểm tra trước đó đã đảm bảo người dùng chưa có gói dài hạn)
                    await CreateNewUserPackage(userId, fee, month);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling successful payment {PaymentId}", payment.PaymentId);
        }
    }

    // Hàm phụ trợ để tránh lặp code
    private async Task CreateNewUserPackage(Guid userId, FeeCommission fee, int month)
    {
        _logger.LogInformation("Creating new package of type {FeeType} for UserId {UserId}", fee.FeeType, userId);
        var userPackage = new UserPackage
        {
            UserId = userId,
            FeeId = fee.FeeId,
            RemainingListings = fee.MaxListings ?? 0,
            ActivatedAt = DateTime.UtcNow,
            ExpiredAt = DateTime.UtcNow.AddMonths(month), // Ngày hết hạn tính từ bây giờ
            Status = "Active"
        };
        await _userPackageRepository.CreateUserPackageAsync(userPackage);
    }

    private string HmacSHA512(string key, string inputData)
    {
        var hash = new StringBuilder();
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var inputBytes = Encoding.UTF8.GetBytes(inputData);
        
        using (var hmac = new HMACSHA512(keyBytes))
        {
            var hashValue = hmac.ComputeHash(inputBytes);
            foreach (var theByte in hashValue)
            {
                hash.Append(theByte.ToString("x2"));
            }
        }

        return hash.ToString();
    }
}
