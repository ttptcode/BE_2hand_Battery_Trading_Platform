import React, { useState } from 'react';
import PackageModal from './PackageModal';

// Component Icon tiện ích
const CheckIcon = () => (
  <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

const PricingCard = ({ packageInfo, isRecommended = false, isDarkMode = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    feeName,
    description,
    amount,
    packageDurationDays,
    maxListings,
    savingAmount,
    feeType
  } = packageInfo;

  // Helper định dạng tiền tệ
  const formatCurrency = (num) => {
    // Định dạng số với dấu chấm làm dấu phân cách nghìn
    const formattedPrice = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return formattedPrice + " VNĐ";
  };

  const cardClasses = `
    flex flex-col rounded-2xl shadow-xl
    w-full sm:w-[240px] md:w-[260px] lg:w-[280px]
    transition-all duration-500 ease-in-out
    border-4 border-transparent relative
    ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
  `;

  const buttonClasses = `
    w-full mt-6 py-2.5 px-5 rounded-full font-bold text-base 
    transition-all duration-500 ease-in-out
    ${isDarkMode 
      ? 'bg-gray-800 border-2 border-emerald-500 text-emerald-400 hover:bg-gray-700 hover:shadow-md' 
      : 'bg-white border-2 border-blue-500 text-blue-500 hover:bg-blue-50 hover:shadow-md'
    }
  `;

  return (
    <div className={cardClasses}>
      <div className="p-6 flex flex-col flex-grow">
        <div className="text-center mb-4">
          <h3 className={`text-xl font-bold mb-1.5 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{feeName}</h3>
          <p className={`text-sm h-10 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
        </div>

        <div className="text-center mb-6">
          <span className={`text-4xl font-extrabold transition-colors duration-500 ${isDarkMode ? 'text-emerald-400' : 'text-blue-600'}`}>
            {formatCurrency(amount)}
          </span>
          {/* Chỉ hiển thị "/ tháng" cho gói bình thường (Free), không hiển thị cho gói lẻ (Pay1v1) */}
          {feeType !== 'Pay1v1' && (
            <span className={`block text-base transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              /  tháng
            </span>
          )}
        </div>

        <ul className={`space-y-2.5 flex-grow text-sm transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <li className="flex items-center">
            <CheckIcon />
            {maxListings > 0 ? `Tối đa ${maxListings} tin đăng` : 'Không giới hạn tin đăng'}
          </li>
          <li className="flex items-center">
            <CheckIcon />
            Thời hạn sử dụng {packageDurationDays} ngày
          </li>
          
          {/* {isRecommended && (
             <li className="flex items-center font-semibold">
              <CheckIcon />
              Gắn nhãn "Ưu tiên"
            </li>
          )} */}
        </ul>

        <button 
          onClick={() => setIsModalOpen(true)}
          className={buttonClasses}
        >
          Chọn Gói
        </button>
      </div>

      {/* Modal */}
      <PackageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageInfo={packageInfo}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default PricingCard;