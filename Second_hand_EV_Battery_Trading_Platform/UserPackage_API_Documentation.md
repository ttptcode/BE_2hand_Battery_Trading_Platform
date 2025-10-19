# UserPackage API Documentation

## Tổng quan
API này cho phép user mua các gói từ FeeCommission và quản lý UserPackage của họ.

## Endpoints

### 1. Lấy danh sách tất cả FeeCommission
```
GET /api/FeeCommissions
```

### 2. Lấy danh sách gói có sẵn để mua (chỉ Package type)
```
GET /api/FeeCommissions/packages
```
**Response:**
```json
{
  "success": true,
  "message": "Available packages retrieved successfully",
  "data": [
    {
      "feeId": "guid",
      "feeName": "Basic Package",
      "feeType": "Package",
      "amount": 100.00,
      "packageDurationDays": 30,
      "maxListings": 10,
      "savingAmount": 0.00,
      "description": "Basic package for new users",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "statusCode": 200
}
```

### 2. Mua gói
```
POST /api/UserPackages/{userId}/purchase
```
**Request Body:**
```json
{
  "feeId": "guid"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Package purchased successfully",
  "data": {
    "userId": "guid",
    "feeId": "guid",
    "remainingListings": 10,
    "activatedAt": "2024-01-01T00:00:00Z",
    "expiredAt": "2024-01-31T00:00:00Z",
    "status": "Active",
    "feeName": "Basic Package",
    "feeType": "Package",
    "amount": 100.00,
    "packageDurationDays": 30,
    "maxListings": 10
  },
  "statusCode": 200
}
```

### 3. Lấy danh sách gói của user
```
GET /api/UserPackages/{userId}
```
**Response:**
```json
{
  "success": true,
  "message": "User packages retrieved successfully",
  "data": [
    {
      "userId": "guid",
      "feeId": "guid",
      "remainingListings": 8,
      "activatedAt": "2024-01-01T00:00:00Z",
      "expiredAt": "2024-01-31T00:00:00Z",
      "status": "Active",
      "feeName": "Basic Package",
      "feeType": "Package",
      "amount": 100.00,
      "packageDurationDays": 30,
      "maxListings": 10
    }
  ],
  "statusCode": 200
}
```

### 4. Lấy danh sách gói đang hoạt động
```
GET /api/UserPackages/{userId}/active
```
**Response:** Tương tự như endpoint trên nhưng chỉ trả về các gói có status = "Active" và chưa hết hạn.

### 5. Lấy thông tin chi tiết một gói
```
GET /api/UserPackages/{userId}/{feeId}
```
**Response:** Trả về thông tin chi tiết của một gói cụ thể.

### 6. Sử dụng một listing từ gói
```
POST /api/UserPackages/{userId}/{feeId}/consume-listing
```
**Response:**
```json
{
  "success": true,
  "message": "Listing consumed successfully",
  "data": true,
  "statusCode": 200
}
```

### 7. Lấy số lượng listing còn lại
```
GET /api/UserPackages/{userId}/{feeId}/remaining-listings
```
**Response:**
```json
{
  "success": true,
  "message": "Remaining listings retrieved successfully",
  "data": 8,
  "statusCode": 200
}
```

## Luồng hoạt động

1. **Xem gói có sẵn:** User gọi `GET /api/FeeCommissions` để xem các gói có thể mua
2. **Mua gói:** User gọi `POST /api/UserPackages/{userId}/purchase` với `feeId` để mua gói
3. **Kiểm tra gói:** User có thể gọi `GET /api/UserPackages/{userId}/active` để xem các gói đang hoạt động
4. **Sử dụng listing:** Khi tạo listing mới, hệ thống sẽ tự động gọi `POST /api/UserPackages/{userId}/{feeId}/consume-listing` để sử dụng một listing từ gói

## Lưu ý

- Mỗi user chỉ có thể mua một gói của cùng một loại FeeCommission
- Gói sẽ tự động hết hạn sau `PackageDurationDays` ngày
- Khi `RemainingListings` = 0, gói sẽ tự động chuyển sang status "Expired"
- Hệ thống sẽ kiểm tra gói đang hoạt động trước khi cho phép tạo listing mới
