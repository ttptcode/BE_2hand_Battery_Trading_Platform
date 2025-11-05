import React from "react";
import PhoneNumber from "./PhoneNumber";

export default function DetailInfo({ car, isLoggedIn, requireAuth, isDarkMode }) {
  if (!car) return null;

  // Lấy data từ car object (đã được transform)
  const specs = car.specs || {};
  const item = car.item || {};

  // Danh sách các field với label và value tương ứng - FIXED để match với data thực tế
  const fieldGroups = {
    // Thông tin cơ bản
    basicInfo: [
      { label: "Tình trạng", value: specs.usageStatus || item.condition || car.condition },
      { label: "Hãng", value: specs.brand || item.brand || car.brand },
      { label: "Loại", value: specs.itemTypeName || item.itemTypeName },
      { label: "Động cơ", value: specs.engine || item.engine || car.engine },
      { label: "Xuất xứ", value: specs.origin || item.origin || car.origin },
      { label: "Màu sắc", value: specs.color || item.color || car.color },
      { label: "Bảo hành", value: specs.warranty || item.warranty || car.warranty },
    ],

    // Thông số kỹ thuật xe máy
    technicalSpecs: [
      { label: "Năm sản xuất", value: specs.year || item.year || car.year },
      { label: "Dòng xe", value: specs.model || item.model || car.model },
      { label: "Phiên bản", value: specs.version || item.version || car.version },
      { label: "Hộp số", value: specs.gearbox || item.gearbox || car.gearbox },
      { label: "Nhiên liệu", value: specs.fuel || item.fuel || car.fuel },
      { label: "Kiểu dáng", value: specs.style || item.style || car.style },
      { label: "Số chỗ ngồi", value: specs.seat || item.seat || car.seat },
      { label: "Biển số xe", value: specs.licensePlate || item.licensePlate || car.licensePlate },
      { label: "Số đời chủ", value: specs.ownerCount || item.ownerCount || car.ownerCount },
      { label: "Có phụ kiện đi kèm", value: specs.accessories || item.accessories || car.accessories },
      { label: "Còn hạn đăng kiểm", value: specs.inspectionValidUntil || item.inspectionValidUntil || car.inspectionValidUntil },
      { label: "Số Km đã đi", value: specs.mileage ? `${item.mileage} km` : null  || (car.mileage ? `${car.mileage} km` : null) || (item.mileage ? `${item.mileage} km` : null)},
      { label: "Dung tích động cơ / Dung lượng (Ah)", value: specs.capacity || item.capacity || car.capacity },
      { label: "Trọng lượng", value: item.weight || specs.weight || car.weight },
    ],

    // Thông tin ắc quy/pin
    batteryInfo: [
      { label: "Thương hiệu ắc quy", value: specs.batteryBrand || item.batteryBrand || car.batteryBrand },
      { label: "Loại ắc quy", value: specs.batteryType || item.batteryType || car.batteryType },
      { label: "Điện áp", value: specs.voltage || item.voltage || car.voltage },
      { label: "Dung lượng (Ah)", value: specs.batteryCapacity || item.batteryCapacity || car.batteryCapacity },
      { label: "Số chu kỳ sạc", value: specs.cycles || item.cycles || car.cycles },
    ],

    // Thông tin xe đạp
    bikeInfo: [
      { label: "Chất liệu khung", value: item.frameMaterial || specs.frameMaterial || car.frameMaterial },
      { label: "Kích thước khung", value: item.frameSize || specs.frameSize || car.frameSize },
    ],

    // Thông tin phụ tùng
    partsInfo: [
      { label: "Loại phụ tùng", value: item.partType || specs.partType || car.partType },
    ],
  };

  // Hàm lọc các field có giá trị - IMPROVED để handle nhiều loại giá trị
  const getValidFields = (fields) => {
    return fields.filter(field => {
      const value = field.value;
      return value !== null && 
             value !== undefined
           
    });
  };

  // Hàm render group fields
  const renderFieldGroup = (title, fields) => {
    const validFields = getValidFields(fields);
    if (validFields.length === 0) return null;

    return (
      <div className={`border rounded-lg p-4 transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm">
          {validFields.map((field, index) => (
            <div key={index} className="flex justify-between">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{field.label}:</span>
              <span className={`font-medium text-right max-w-[200px] break-words ${
                isDarkMode ? 'text-gray-200' : 'text-gray-900'
              }`}>
                {field.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4 space-y-6">
      {/* Mô tả chi tiết */}
      <div className={`border rounded-lg p-4 transition-colors duration-500 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Mô tả chi tiết</h3>
        <p className={`mb-3 whitespace-pre-line ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {car.description || "Không có mô tả chi tiết"}
        </p>
     
        <PhoneNumber
          phone={car.seller.phone}
          isLoggedIn={isLoggedIn}
          requireAuth={requireAuth}
        />
      </div>


      {/* Thông tin cơ bản */}
      {renderFieldGroup("Thông tin cơ bản", fieldGroups.basicInfo)}

      {/* Thông số kỹ thuật */}
      {renderFieldGroup("Thông số kỹ thuật", fieldGroups.technicalSpecs)}

      {/* Thông tin ắc quy/pin */}
      {renderFieldGroup("Thông tin ắc quy/Pin", fieldGroups.batteryInfo)}

      {/* Thông tin xe đạp */}
      {renderFieldGroup("Thông tin xe đạp", fieldGroups.bikeInfo)}

      {/* Thông tin phụ tùng */}
      {renderFieldGroup("Thông tin phụ tùng", fieldGroups.partsInfo)}

    </div>
  );
}