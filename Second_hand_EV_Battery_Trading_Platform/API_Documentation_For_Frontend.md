# API Documentation cho Frontend Team

## Base URL
```
https://api.sixcinema.site
```

## Swagger Documentation
```
https://api.sixcinema.site/swagger
```

## Các Endpoint chính

### 1. Authentication
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh-token
```

### 2. Items (Sản phẩm)
```
GET    /api/items                    # Lấy tất cả sản phẩm
GET    /api/items/{id}              # Lấy sản phẩm theo ID
GET    /api/items/user/{userId}     # Lấy sản phẩm theo user
GET    /api/items/status/{status}   # Lấy sản phẩm theo trạng thái
GET    /api/items/search            # Tìm kiếm sản phẩm
POST   /api/items                   # Tạo sản phẩm mới
PUT    /api/items/{id}              # Cập nhật sản phẩm
DELETE /api/items/{id}              # Xóa sản phẩm
```

### 3. Conversations (Cuộc trò chuyện)
```
GET  /api/conversations/{userId}    # Lấy cuộc trò chuyện theo user
POST /api/conversations             # Tạo cuộc trò chuyện mới
```

### 4. Fee Commissions (Phí hoa hồng)
```
GET    /api/feecommissions          # Lấy tất cả phí hoa hồng
GET    /api/feecommissions/packages # Lấy gói dịch vụ
GET    /api/feecommissions/{id}     # Lấy phí hoa hồng theo ID
POST   /api/feecommissions          # Tạo phí hoa hồng mới
PUT    /api/feecommissions/{id}     # Cập nhật phí hoa hồng
DELETE /api/feecommissions/{id}     # Xóa phí hoa hồng
```

### 5. User Packages (Gói người dùng)
```
POST /api/userpackages/purchase     # Mua gói dịch vụ
GET  /api/userpackages/user/{userId} # Lấy gói của user
GET  /api/userpackages/active/{userId} # Lấy gói đang hoạt động
```

## Authentication

API sử dụng JWT Bearer Token:

```javascript
// Thêm vào header của mọi request
headers: {
  'Authorization': 'Bearer ' + token,
  'Content-Type': 'application/json'
}
```

## Response Format

Tất cả API đều trả về format chuẩn:

```json
{
  "success": true,
  "message": "Thông báo",
  "data": { ... },
  "errors": null
}
```

## Error Handling

```json
{
  "success": false,
  "message": "Thông báo lỗi",
  "data": null,
  "errors": "Chi tiết lỗi"
}
```

## CORS Configuration

API đã được cấu hình CORS cho các domain sau:
- `https://sixcinema.site`
- `http://localhost:3000` (React dev)
- `http://localhost:5173` (Vite dev)

## Testing

Bạn có thể test API trực tiếp qua Swagger UI hoặc sử dụng các công cụ như Postman, Insomnia.

## Lưu ý

1. **HTTPS**: API chỉ hoạt động qua HTTPS
2. **Authentication**: Hầu hết endpoint cần JWT token
3. **Rate Limiting**: Có thể có giới hạn request (tùy thuộc vào Cloudflare)
4. **Environment**: API đang chạy trên development environment
