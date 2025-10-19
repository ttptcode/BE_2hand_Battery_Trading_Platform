# Test UserPackage API

## Các bước test chức năng mua gói

### 1. Lấy danh sách gói có sẵn
```bash
GET http://localhost:5000/api/FeeCommissions
```

### 2. Mua gói cho user
```bash
POST http://localhost:5000/api/UserPackages/{userId}/purchase
Content-Type: application/json

{
  "feeId": "fee-id-from-step-1"
}
```

### 3. Kiểm tra gói đã mua
```bash
GET http://localhost:5000/api/UserPackages/{userId}
```

### 4. Kiểm tra gói đang hoạt động
```bash
GET http://localhost:5000/api/UserPackages/{userId}/active
```

### 5. Sử dụng listing từ gói
```bash
POST http://localhost:5000/api/UserPackages/{userId}/{feeId}/consume-listing
```

### 6. Kiểm tra số listing còn lại
```bash
GET http://localhost:5000/api/UserPackages/{userId}/{feeId}/remaining-listings
```

## Ví dụ với Postman/Thunder Client

### Request 1: Lấy danh sách gói
```
GET http://localhost:5000/api/FeeCommissions
```

### Request 2: Mua gói
```
POST http://localhost:5000/api/UserPackages/123e4567-e89b-12d3-a456-426614174000/purchase
Content-Type: application/json

{
  "feeId": "456e7890-e89b-12d3-a456-426614174001"
}
```

### Request 3: Kiểm tra gói đã mua
```
GET http://localhost:5000/api/UserPackages/123e4567-e89b-12d3-a456-426614174000
```

## Lưu ý khi test

1. **Tạo dữ liệu mẫu**: Cần có ít nhất một FeeCommission với FeeType = "Package" trong database
2. **User ID**: Sử dụng User ID thật từ database
3. **Fee ID**: Sử dụng Fee ID thật từ bảng FeeCommission
4. **Kiểm tra database**: Sau khi mua gói, kiểm tra bảng UserPackage để xem dữ liệu đã được lưu chưa

## Dữ liệu mẫu để test

### Tạo FeeCommission mẫu:
```sql
INSERT INTO FeeCommission (FeeId, FeeName, FeeType, Amount, PackageDurationDays, MaxListings, Description, CreatedAt)
VALUES (NEWID(), 'Basic Package', 'Package', 100.00, 30, 10, 'Basic package for new users', GETDATE());
```

### Tạo User mẫu:
```sql
INSERT INTO [User] (UserId, FullName, Email, Phone, PasswordHash, Balance, CreatedAt, Status)
VALUES (NEWID(), 'Test User', 'test@example.com', '0123456789', 'hashedpassword', 0, GETDATE(), 'Active');
```
