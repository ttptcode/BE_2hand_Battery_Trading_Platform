# API Response Standard Documentation

## Tổng quan
Tất cả API endpoints đều trả về response theo chuẩn `ApiResponse<T>` để đảm bảo tính nhất quán và dễ dàng xử lý ở phía client.

## Cấu trúc ApiResponse

### Generic ApiResponse<T>
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* Dữ liệu trả về */ },
  "errors": [],
  "timestamp": "2023-12-01T10:00:00Z"
}
```

### Non-generic ApiResponse
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": null,
  "errors": [],
  "timestamp": "2023-12-01T10:00:00Z"
}
```

## Các trường trong ApiResponse

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `success` | boolean | `true` nếu thành công, `false` nếu có lỗi |
| `message` | string | Thông báo mô tả kết quả |
| `data` | T | Dữ liệu trả về (có thể null) |
| `errors` | string[] | Danh sách lỗi chi tiết |
| `timestamp` | DateTime | Thời gian phản hồi (UTC) |

## Ví dụ Response

### ✅ Thành công - Lấy danh sách Items
```json
{
  "success": true,
  "message": "Items retrieved successfully",
  "data": [
    {
      "itemId": "guid",
      "userId": "guid",
      "serialNumber": "BAT001",
      "itemType": "Battery",
      "title": "Tesla Model 3 Battery Pack",
      "brand": "Tesla",
      "model": "Model 3",
      "year": 2020,
      "mileage": 50000,
      "batteryCapacity": 75,
      "capacity": 100,
      "cycles": 500,
      "condition": "Good",
      "price": 15000.00,
      "images": "battery_image.jpg",
      "status": "Active",
      "createdAt": "2023-12-01T10:00:00Z",
      "updatedAt": "2023-12-01T10:00:00Z",
      "userName": "Test User"
    }
  ],
  "errors": [],
  "timestamp": "2023-12-01T10:00:00Z"
}
```

### ✅ Thành công - Tạo Item mới
```json
{
  "success": true,
  "message": "Item created successfully",
  "data": {
    "itemId": "new-guid",
    "userId": "user-guid",
    "serialNumber": "BAT002",
    "itemType": "Battery",
    "title": "New Battery Pack",
    "brand": "Tesla",
    "model": "Model S",
    "year": 2021,
    "mileage": 30000,
    "batteryCapacity": 85,
    "capacity": 100,
    "cycles": 300,
    "condition": "Excellent",
    "price": 18000.00,
    "images": "new_battery.jpg",
    "status": "Active",
    "createdAt": "2023-12-01T10:00:00Z",
    "updatedAt": "2023-12-01T10:00:00Z",
    "userName": "Test User"
  },
  "errors": [],
  "timestamp": "2023-12-01T10:00:00Z"
}
```

### ❌ Lỗi Validation - 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": [
    "The Title field is required.",
    "The SerialNumber field is required.",
    "The field Year must be between 1900 and 2030."
  ],
  "timestamp": "2023-12-01T10:00:00Z"
}
```

### ❌ Lỗi Business Logic - 400 Bad Request
```json
{
  "success": false,
  "message": "Business logic error",
  "data": null,
  "errors": [
    "User with ID 'invalid-guid' does not exist."
  ],
  "timestamp": "2023-12-01T10:00:00Z"
}
```

### ❌ Không tìm thấy - 404 Not Found
```json
{
  "success": false,
  "message": "Item with ID 123e4567-e89b-12d3-a456-426614174000 not found",
  "data": null,
  "errors": [],
  "timestamp": "2023-12-01T10:00:00Z"
}
```

### ❌ Lỗi Server - 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error occurred while creating item",
  "data": null,
  "errors": [
    "The INSERT statement conflicted with the FOREIGN KEY constraint..."
  ],
  "timestamp": "2023-12-01T10:00:00Z"
}
```

## HTTP Status Codes

| Status Code | Mô tả | Khi nào sử dụng |
|-------------|-------|-----------------|
| 200 OK | Thành công | GET, PUT thành công |
| 201 Created | Tạo mới thành công | POST thành công |
| 400 Bad Request | Lỗi validation hoặc business logic | Dữ liệu không hợp lệ |
| 404 Not Found | Không tìm thấy resource | Resource không tồn tại |
| 500 Internal Server Error | Lỗi server | Lỗi hệ thống |

## Cách sử dụng ở Client

### JavaScript/TypeScript
```javascript
async function createItem(itemData) {
  try {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Success:', result.message);
      console.log('Created item:', result.data);
    } else {
      console.error('Error:', result.message);
      console.error('Details:', result.errors);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}
```

### C# Client
```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public T Data { get; set; }
    public List<string> Errors { get; set; }
    public DateTime Timestamp { get; set; }
}

public async Task<ApiResponse<ItemResponseDto>> CreateItemAsync(CreateItemDto item)
{
    var response = await _httpClient.PostAsJsonAsync("/api/items", item);
    var result = await response.Content.ReadFromJsonAsync<ApiResponse<ItemResponseDto>>();
    return result;
}
```

## Lợi ích của ApiResponse Standard

1. **Nhất quán**: Tất cả API đều có cùng format response
2. **Dễ xử lý**: Client có thể xử lý lỗi một cách thống nhất
3. **Thông tin đầy đủ**: Có message và errors chi tiết
4. **Debugging**: Timestamp giúp track thời gian
5. **Type Safety**: Generic type đảm bảo type safety
6. **Extensible**: Dễ dàng mở rộng thêm fields nếu cần

## Best Practices

1. **Luôn kiểm tra `success` field** trước khi xử lý `data`
2. **Hiển thị `message`** cho user để thông báo kết quả
3. **Log `errors`** để debug khi có lỗi
4. **Sử dụng `timestamp`** để track performance
5. **Handle cả success và error cases** trong client code
