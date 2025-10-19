# Swagger Documentation Template cho .NET Core Controllers

## Các Attributes chính:

### 1. Controller Level:
```csharp
[ApiController]
[Route("api/[controller]")]
[SwaggerTag("Mô tả chức năng của controller")]
public class YourController : ControllerBase
```

### 2. Method Level:
```csharp
/// <summary>
/// Mô tả ngắn gọn về chức năng của API
/// </summary>
/// <param name="param1">Mô tả tham số 1</param>
/// <param name="param2">Mô tả tham số 2</param>
/// <returns>Mô tả về giá trị trả về</returns>
[HttpGet]
[SwaggerOperation(
    Summary = "Tiêu đề ngắn gọn",
    Description = "Mô tả chi tiết về chức năng của API",
    OperationId = "UniqueOperationId",
    Tags = new[] { "TagName" }
)]
[SwaggerResponse(200, "Thành công", typeof(ApiResponse<YourDto>))]
[SwaggerResponse(400, "Dữ liệu không hợp lệ", typeof(ApiResponse<YourDto>))]
[SwaggerResponse(404, "Không tìm thấy", typeof(ApiResponse<YourDto>))]
[SwaggerResponse(500, "Lỗi server", typeof(ApiResponse<YourDto>))]
public async Task<ActionResult<ApiResponse<YourDto>>> YourMethod()
```

## Ví dụ cụ thể:

### ItemsController:
- Tag: "Items"
- Operations: GetAllItems, GetItemById, GetItemsByUser, GetItemsByStatus, SearchItems, CreateItem, UpdateItem, DeleteItem, ItemExists

### FeeCommissionsController:
- Tag: "FeeCommissions" 
- Operations: GetAllFeeCommissions, GetAvailablePackages, GetPackageById, CreateFeeCommission, UpdateFeeCommission, DeleteFeeCommission

### UserPackagesController:
- Tag: "UserPackages"
- Operations: PurchasePackage, GetUserPackages, GetActiveUserPackages, GetUserPackageDetail, ConsumeListing, GetRemainingListings

### AuthController:
- Tag: "Authentication"
- Operations: Login, Register, RefreshToken, Logout

### UsersController:
- Tag: "Users"
- Operations: GetAllUsers, GetUserById, CreateUser, UpdateUser, DeleteUser

## Các HTTP Status Codes thường dùng:
- 200: Thành công
- 201: Tạo thành công
- 400: Dữ liệu không hợp lệ
- 401: Chưa xác thực
- 403: Không có quyền
- 404: Không tìm thấy
- 409: Xung đột dữ liệu
- 500: Lỗi server
