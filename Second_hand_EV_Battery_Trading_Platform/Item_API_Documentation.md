# Item CRUD API Documentation

## Tổng quan
API này cung cấp các chức năng CRUD (Create, Read, Update, Delete) cho Item trong hệ thống Second-hand EV Battery Trading Platform.

## Base URL
```
https://localhost:7000/api/items
```

## Endpoints

### 1. Lấy tất cả Items
```http
GET /api/items
```

**Response:**
```json
[
  {
    "itemId": "guid",
    "userId": "guid",
    "serialNumber": "string",
    "itemType": "string",
    "title": "string",
    "brand": "string",
    "model": "string",
    "year": 2023,
    "mileage": 10000,
    "batteryCapacity": 75,
    "capacity": 100,
    "cycles": 500,
    "condition": "string",
    "price": 15000.00,
    "images": "string",
    "status": "string",
    "createdAt": "2023-12-01T10:00:00Z",
    "updatedAt": "2023-12-01T10:00:00Z",
    "userName": "string"
  }
]
```

### 2. Lấy Item theo ID
```http
GET /api/items/{id}
```

**Parameters:**
- `id` (Guid): ID của item

**Response:**
```json
{
  "itemId": "guid",
  "userId": "guid",
  "serialNumber": "string",
  "itemType": "string",
  "title": "string",
  "brand": "string",
  "model": "string",
  "year": 2023,
  "mileage": 10000,
  "batteryCapacity": 75,
  "capacity": 100,
  "cycles": 500,
  "condition": "string",
  "price": 15000.00,
  "images": "string",
  "status": "string",
  "createdAt": "2023-12-01T10:00:00Z",
  "updatedAt": "2023-12-01T10:00:00Z",
  "userName": "string"
}
```

### 3. Lấy Items theo User ID
```http
GET /api/items/user/{userId}
```

**Parameters:**
- `userId` (Guid): ID của user

### 4. Lấy Items theo Status
```http
GET /api/items/status/{status}
```

**Parameters:**
- `status` (string): Trạng thái của item (Active, Inactive, Sold, etc.)

### 5. Tìm kiếm Items
```http
GET /api/items/search?title={title}&brand={brand}&model={model}&itemType={itemType}
```

**Query Parameters:**
- `title` (string, optional): Tìm kiếm theo tiêu đề
- `brand` (string, optional): Tìm kiếm theo thương hiệu
- `model` (string, optional): Tìm kiếm theo model
- `itemType` (string, optional): Tìm kiếm theo loại item

### 6. Tạo Item mới
```http
POST /api/items
```

**Request Body:**
```json
{
  "userId": "guid",
  "serialNumber": "string",
  "itemType": "string",
  "title": "string",
  "brand": "string",
  "model": "string",
  "year": 2023,
  "mileage": 10000,
  "batteryCapacity": 75,
  "capacity": 100,
  "cycles": 500,
  "condition": "string",
  "price": 15000.00,
  "images": "string",
  "status": "Active"
}
```

**Response:** 201 Created với item đã tạo

### 7. Cập nhật Item
```http
PUT /api/items/{id}
```

**Parameters:**
- `id` (Guid): ID của item cần cập nhật

**Request Body:** (Tất cả fields đều optional)
```json
{
  "serialNumber": "string",
  "itemType": "string",
  "title": "string",
  "brand": "string",
  "model": "string",
  "year": 2023,
  "mileage": 10000,
  "batteryCapacity": 75,
  "capacity": 100,
  "cycles": 500,
  "condition": "string",
  "price": 15000.00,
  "images": "string",
  "status": "string"
}
```

### 8. Xóa Item
```http
DELETE /api/items/{id}
```

**Parameters:**
- `id` (Guid): ID của item cần xóa

**Response:** 204 No Content

### 9. Kiểm tra Item tồn tại
```http
HEAD /api/items/{id}
```

**Parameters:**
- `id` (Guid): ID của item cần kiểm tra

**Response:** 
- 200 OK nếu item tồn tại
- 404 Not Found nếu item không tồn tại

## Validation Rules

### CreateItemDto
- `userId`: Required
- `serialNumber`: Required, MaxLength(100), Unique
- `itemType`: Required, MaxLength(50)
- `title`: Required, MaxLength(255)
- `brand`: MaxLength(100)
- `model`: MaxLength(100)
- `year`: Range(1900, 2030)
- `mileage`: Range(0, int.MaxValue)
- `batteryCapacity`: Range(0, int.MaxValue)
- `capacity`: Range(0, int.MaxValue)
- `cycles`: Range(0, int.MaxValue)
- `condition`: MaxLength(50)
- `price`: Range(0, double.MaxValue)
- `status`: MaxLength(20), Default: "Active"

### UpdateItemDto
- Tất cả fields đều optional
- Validation rules giống CreateItemDto nhưng không required

## Error Responses

### 400 Bad Request
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "fieldName": ["Error message"]
  }
}
```

### 404 Not Found
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "Item with ID {id} not found"
}
```

### 500 Internal Server Error
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.6.1",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "Internal server error"
}
```

## Business Logic

1. **Serial Number Uniqueness**: Serial number phải unique trong toàn bộ hệ thống
2. **Automatic Timestamps**: CreatedAt và UpdatedAt được tự động cập nhật
3. **Soft Delete**: Có thể implement soft delete bằng cách thay đổi status thay vì xóa thật
4. **User Validation**: ✅ **Đã implement** - validate userId tồn tại trước khi tạo item
5. **Foreign Key Validation**: Kiểm tra User tồn tại trước khi tạo Item để tránh lỗi FOREIGN KEY constraint

## Database Schema

Item table có các relationships:
- One-to-Many với User (UserId)
- One-to-Many với Listing
- One-to-Many với Conversation
- One-to-Many với UserReputationReview

## Testing

### Chuẩn bị dữ liệu test

1. **Chạy script SQL**: Trước khi test API, chạy file `Create_Sample_User.sql` để tạo User mẫu
2. **Lấy UserId**: Sau khi chạy script, copy UserId từ kết quả để sử dụng trong test

### Test với Swagger UI

Sử dụng Swagger UI tại: `https://localhost:7000/swagger` để test các endpoints.

### Test với Postman/HTTP Client

**Tạo Item mới:**
```http
POST https://localhost:7000/api/items
Content-Type: application/json

{
  "userId": "PASTE_USER_ID_HERE",
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
  "status": "Active"
}
```

**Kiểm tra User tồn tại:**
```http
HEAD https://localhost:7000/api/users/{userId}
```

**Lấy thông tin User:**
```http
GET https://localhost:7000/api/users/{userId}
```
