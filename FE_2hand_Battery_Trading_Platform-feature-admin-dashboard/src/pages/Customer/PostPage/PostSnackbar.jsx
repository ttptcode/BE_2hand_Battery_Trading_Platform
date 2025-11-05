import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import { FiCheck, FiLoader, FiSave, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { userPackageService } from "../../../services/users/userPackageService";

/**
 * PostSnackbar - Fixed bottom action bar for post submission
 * Reusable component for all post categories
 * 
 * @param {Object} props
 * @param {string} props.formId - Form ID to submit (optional, for button outside form)
 * @param {boolean} props.isSubmitting - Loading state for submit
 * @param {boolean} props.isSavingDraft - Loading state for save draft
 * @param {Function} props.onSaveDraft - Handler for save draft button
 * @param {string} props.buttonText - Custom button text (default: "Đăng tin ngay")
 * @param {string} props.draftButtonText - Custom draft button text (default: "Lưu nháp")
 * @param {boolean} props.disabled - Disable buttons
 * @param {boolean} props.showDraftButton - Show/hide draft button (default: true)
 * @param {string} props.type - Button type (default: "submit")
 * @param {Object} props.activePackage - User's active package info
 * @param {Function} props.onPackageChange - Callback when user selects a different package
 */
const PostSnackbar = ({ 
  formId,
  isSubmitting = false,
  isSavingDraft = false,
  onSaveDraft,
  buttonText = "Đăng tin ngay",
  draftButtonText = "Lưu nháp",
  disabled = false,
  showDraftButton = true,
  type = "submit",
  activePackage = null,
  onPackageChange = null
}) => {
  // Dark mode state synced with localStorage & Header event
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    const stored = localStorage.getItem('landing_dark_mode');
    return stored === 'true';
  });

  React.useEffect(() => {
    const handleDarkModeChange = (event) => {
      setIsDarkMode(event.detail.isDarkMode);
    };
    window.addEventListener('darkModeChanged', handleDarkModeChange);
    return () => window.removeEventListener('darkModeChanged', handleDarkModeChange);
  }, []);

  // State cho package selector
  const [userPackages, setUserPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPackageDropdown, setShowPackageDropdown] = useState(false);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);
  const packageDropdownRef = useRef(null);
  const selectedPackageRef = useRef(null); // ✅ Ref để track selectedPackage tránh stale closure

  // ✅ Fetch packages lần đầu khi component mount (DUY NHẤT 1 LẦN)
  // ✅ KHÔNG fetch lại khi activePackage thay đổi để tránh reset selectedPackage

  // Close dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (packageDropdownRef.current && !packageDropdownRef.current.contains(event.target)) {
        setShowPackageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // Xác định trạng thái gói đăng tin - ✅ CHỈ dùng khi KHÔNG có selectedPackage
  const getPackageStatus = () => {
    // ✅ CHỈ check activePackage khi KHÔNG có selectedPackage (để hiển thị fallback)
    const packageToCheck = activePackage;
    
    if (!packageToCheck || (!packageToCheck.package && !packageToCheck.feeId)) {
      return {
        type: 'none',
        message: 'Bạn chưa có gói đăng tin',
        subMessage: 'Mua gói hoặc đăng tin lẻ',
        color: 'text-orange-500',
        bgColor: isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50',
        iconColor: 'text-orange-500'
      };
    }
    
    // Nếu activePackage là object từ API (có structure package)
    const pkg = packageToCheck.package || packageToCheck;
    
    if (pkg.status && pkg.status !== 'Active') {
      return {
        type: 'expired',
        message: 'Gói đăng tin đã hết hạn',
        subMessage: 'Vui lòng mua gói mới',
        color: 'text-red-500',
        bgColor: isDarkMode ? 'bg-red-900/30' : 'bg-red-50',
        iconColor: 'text-red-500'
      };
    }
    
    // Status = Active hoặc không có status field (tức là đang active)
    return {
      type: 'active',
      message: packageToCheck.feeName || pkg.feeCommission?.feeName || 'Gói đăng tin',
      subMessage: `Còn ${packageToCheck.remainingListings || pkg.remainingListings || 0} tin`,
      expiredAt: packageToCheck.expiredAt || pkg.expiredAt,
      color: 'text-[#00c9a7]',
      bgColor: isDarkMode ? 'bg-emerald-900/30' : 'bg-[#00c9a7]/10',
      iconColor: 'text-[#00c9a7]'
    };
  };
  
  const packageStatus = getPackageStatus();
  
  // Format ngày hết hạn
  const formatExpiredDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Handle package selection
  const handlePackageSelect = async (pkg) => {
    console.log('🔍 handlePackageSelect called with:', {
      feeId: pkg.feeId,
      feeName: pkg.feeCommission?.feeName,
      remainingListings: pkg.remainingListings,
      expiredAt: pkg.expiredAt,
      status: pkg.status
    });
    
    setShowPackageDropdown(false);
    setIsLoadingPackages(true);
    
    try {
      // ✅ GỌI LẠI API để lấy thông tin mới nhất từ server
      console.log('🔄 Fetching latest package info from API for feeId:', pkg.feeId);
      const response = await userPackageService.getUserPackages();
      const packages = response?.data?.packages || response?.data;
      
      if (response?.success && Array.isArray(packages)) {
        // ✅ Cập nhật danh sách userPackages với data mới nhất từ API
        const activePackages = packages.filter(apiPkg => apiPkg.status === 'Active');
        setUserPackages(activePackages);
        
        // ✅ Tìm package có feeId khớp với package user chọn
        const latestPackage = activePackages.find(
          apiPkg => apiPkg.feeId === pkg.feeId
        );
        
        if (latestPackage) {
          console.log('✅ Found latest package from API:', {
            feeId: latestPackage.feeId,
            feeName: latestPackage.feeCommission?.feeName,
            remainingListings: latestPackage.remainingListings,
            expiredAt: latestPackage.expiredAt
          });
          
          // ✅ Set cả state và ref với data mới nhất từ API - ĐẢM BẢO KHÔNG BỊ RESET
          console.log('✅ Setting selectedPackage with latest API data:', {
            feeId: latestPackage.feeId,
            feeName: latestPackage.feeCommission?.feeName,
            remainingListings: latestPackage.remainingListings
          });
          
          // ✅ Set state và ref đồng thời để đảm bảo sync
          // ✅ QUAN TRỌNG: Set ref trước, sau đó set state để đảm bảo useEffect không clear ref
          selectedPackageRef.current = latestPackage;
          setSelectedPackage(latestPackage);
          
          // ✅ Lưu vào sessionStorage để tránh mất khi component remount
          sessionStorage.setItem('selectedPackageFeeId', latestPackage.feeId);
          console.log('✅ Saved to sessionStorage:', latestPackage.feeId);
          
          // ✅ Gọi onPackageChange với thông tin mới nhất từ API
          if (onPackageChange) {
            const packageInfo = {
              feeId: latestPackage.feeId, // ✅ feeId chính xác từ API
              feeName: latestPackage.feeCommission?.feeName,
              feeType: latestPackage.feeCommission?.feeType,
              remainingListings: latestPackage.remainingListings, // ✅ Số tin còn lại mới nhất
              expiredAt: latestPackage.expiredAt, // ✅ Ngày hết hạn mới nhất
              package: latestPackage
            };
            console.log('📤 Calling onPackageChange with latest API data:', packageInfo);
            onPackageChange(packageInfo);
            console.log('✅ Package selected and notified parent with latest API data:', packageInfo);
          } else {
            console.warn('⚠️ onPackageChange is not provided!');
          }
        } else {
          console.warn('⚠️ Package not found in API response or no longer active. Using cached data.');
          // Fallback: dùng data từ pkg nếu không tìm thấy trong API
          setSelectedPackage(pkg);
          selectedPackageRef.current = pkg;
          sessionStorage.setItem('selectedPackageFeeId', pkg.feeId);
          
          if (onPackageChange) {
            const packageInfo = {
              feeId: pkg.feeId,
              feeName: pkg.feeCommission?.feeName,
              feeType: pkg.feeCommission?.feeType,
              remainingListings: pkg.remainingListings,
              expiredAt: pkg.expiredAt,
              package: pkg
            };
            onPackageChange(packageInfo);
          }
        }
      } else {
        console.warn('⚠️ Invalid API response. Using cached data.');
        // Fallback: dùng data từ pkg nếu API lỗi
        setSelectedPackage(pkg);
        selectedPackageRef.current = pkg;
        sessionStorage.setItem('selectedPackageFeeId', pkg.feeId);
        
        if (onPackageChange) {
          const packageInfo = {
            feeId: pkg.feeId,
            feeName: pkg.feeCommission?.feeName,
            feeType: pkg.feeCommission?.feeType,
            remainingListings: pkg.remainingListings,
            expiredAt: pkg.expiredAt,
            package: pkg
          };
          onPackageChange(packageInfo);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching latest package info:', error);
      // Fallback: dùng data từ pkg nếu API lỗi
      setSelectedPackage(pkg);
      selectedPackageRef.current = pkg;
      sessionStorage.setItem('selectedPackageFeeId', pkg.feeId);
      
      if (onPackageChange) {
        const packageInfo = {
          feeId: pkg.feeId,
          feeName: pkg.feeCommission?.feeName,
          feeType: pkg.feeCommission?.feeType,
          remainingListings: pkg.remainingListings,
          expiredAt: pkg.expiredAt,
          package: pkg
        };
        onPackageChange(packageInfo);
      }
    } finally {
      setIsLoadingPackages(false);
    }
  };
  
  // ✅ Update ref khi selectedPackage thay đổi - CHỈ KHI STATE THAY ĐỔI (không override khi đã set)
  React.useEffect(() => {
    // ✅ CHỈ update ref nếu selectedPackage thay đổi VÀ ref chưa có hoặc khác
    if (selectedPackage) {
      const currentRefFeeId = selectedPackageRef.current?.feeId || selectedPackageRef.current?.package?.feeId;
      const newStateFeeId = selectedPackage.feeId || selectedPackage.package?.feeId;
      
      // ✅ CHỈ update ref nếu feeId khác (tránh override khi đã set trước đó)
      if (currentRefFeeId !== newStateFeeId) {
        selectedPackageRef.current = selectedPackage;
        console.log('🔄 selectedPackageRef synced with state:', {
          oldFeeId: currentRefFeeId,
          newFeeId: newStateFeeId,
          feeName: selectedPackage.feeCommission?.feeName || selectedPackage.feeName || selectedPackage.package?.feeCommission?.feeName
        });
      }
    } else {
      // ✅ CHỈ clear ref nếu thực sự null và không có sessionStorage
      const savedFeeId = sessionStorage.getItem('selectedPackageFeeId');
      if (!savedFeeId) {
        const currentRefFeeId = selectedPackageRef.current?.feeId || selectedPackageRef.current?.package?.feeId;
        if (currentRefFeeId) {
          selectedPackageRef.current = null;
          console.log('🔄 selectedPackageRef cleared (no saved package)');
        }
      } else {
        console.log('⚠️ selectedPackage is null but sessionStorage has savedFeeId:', savedFeeId);
      }
    }
  }, [selectedPackage]);
  
  // ✅ Fetch packages lần đầu khi component mount
  React.useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoadingPackages(true);
        const response = await userPackageService.getUserPackages();
        const packages = response?.data?.packages || response?.data;
        
        if (response?.success && Array.isArray(packages)) {
          const activePackages = packages.filter(pkg => pkg.status === 'Active');
          setUserPackages(activePackages);
          
          // ✅ ƯU TIÊN: Khôi phục selectedPackage từ sessionStorage nếu có (tránh mất khi remount)
          const savedPackageFeeId = sessionStorage.getItem('selectedPackageFeeId');
          console.log('🔍 Checking sessionStorage for saved package:', savedPackageFeeId);
          
          if (savedPackageFeeId && activePackages.length > 0) {
            const savedPackage = activePackages.find(pkg => pkg.feeId === savedPackageFeeId);
            if (savedPackage) {
              console.log('✅ Restoring saved package from sessionStorage:', {
                feeId: savedPackage.feeId,
                feeName: savedPackage.feeCommission?.feeName,
                remainingListings: savedPackage.remainingListings
              });
              
              // ✅ Set ngay lập tức, không async
              setSelectedPackage(savedPackage);
              selectedPackageRef.current = savedPackage;
              
              if (onPackageChange) {
                const packageInfo = {
                  feeId: savedPackage.feeId,
                  feeName: savedPackage.feeCommission?.feeName,
                  feeType: savedPackage.feeCommission?.feeType,
                  remainingListings: savedPackage.remainingListings,
                  expiredAt: savedPackage.expiredAt,
                  package: savedPackage
                };
                onPackageChange(packageInfo);
                console.log('✅ Restored and notified parent:', packageInfo);
              }
              setIsLoadingPackages(false);
              return; // ✅ Không set default nếu đã restore từ sessionStorage
            } else {
              console.warn('⚠️ Saved packageFeeId not found in activePackages:', savedPackageFeeId);
              // ✅ Xóa sessionStorage nếu package không còn active
              sessionStorage.removeItem('selectedPackageFeeId');
            }
          }
          
          // ✅ CHỈ set default nếu chưa có selectedPackage (lần đầu mount)
          if (!selectedPackageRef.current && !selectedPackage && activePackages.length > 0) {
            let defaultPackage = null;
            if (activePackage && activePackage.feeId) {
              const matchedPackage = activePackages.find(
                pkg => pkg.feeId === activePackage.feeId
              );
              defaultPackage = matchedPackage || activePackages[0];
            } else {
              defaultPackage = activePackages[0];
            }
            
            if (defaultPackage) {
              console.log('📦 Setting initial default package:', defaultPackage.feeCommission?.feeName);
              setSelectedPackage(defaultPackage);
              selectedPackageRef.current = defaultPackage;
              
              if (onPackageChange) {
                const packageInfo = {
                  feeId: defaultPackage.feeId,
                  feeName: defaultPackage.feeCommission?.feeName,
                  feeType: defaultPackage.feeCommission?.feeType,
                  remainingListings: defaultPackage.remainingListings,
                  expiredAt: defaultPackage.expiredAt,
                  package: defaultPackage
                };
                onPackageChange(packageInfo);
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ Error fetching user packages:', error);
      } finally {
        setIsLoadingPackages(false);
      }
    };
    
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // CHỈ chạy 1 lần khi mount
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 border-t shadow-lg transition-colors duration-500 ${
      isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Info Section - Package Status với Dropdown Selector */}
          <div className="hidden md:flex items-center gap-2">
            {/* ✅ Debug log */}
            {console.log('🔍 PostSnackbar render check:', {
              hasSelectedPackage: !!selectedPackage,
              selectedPackageFeeId: selectedPackage?.feeId,
              selectedPackageName: selectedPackage?.feeCommission?.feeName || selectedPackage?.feeName,
              userPackagesCount: userPackages.length
            })}
            
            {/* ✅ Hiển thị selectedPackage nếu có feeId - Kiểm tra kỹ để tránh hiển thị "Chọn Gói Đăng Tin" */}
            {(() => {
              // ✅ Kiểm tra kỹ selectedPackage có hợp lệ không
              const hasValidSelectedPackage = selectedPackage && (
                selectedPackage.feeId || 
                (selectedPackage.package && selectedPackage.package.feeId)
              );
              
              // ✅ Debug log chi tiết
              if (hasValidSelectedPackage) {
                console.log('✅ Will render selectedPackage:', {
                  feeId: selectedPackage.feeId || selectedPackage.package?.feeId,
                  feeName: selectedPackage.feeCommission?.feeName || selectedPackage.package?.feeCommission?.feeName || selectedPackage.feeName,
                  remainingListings: selectedPackage.remainingListings || selectedPackage.package?.remainingListings
                });
              } else {
                console.warn('⚠️ Will NOT render selectedPackage (fallback to packageStatus):', {
                  selectedPackageExists: !!selectedPackage,
                  hasFeeId: selectedPackage?.feeId,
                  hasPackageFeeId: selectedPackage?.package?.feeId,
                  selectedPackage: selectedPackage
                });
              }
              
              return hasValidSelectedPackage;
            })() ? (
              <div className="relative" ref={packageDropdownRef}>
                <div
                  onClick={() => !isLoadingPackages && setShowPackageDropdown(!showPackageDropdown)}
                  className={`flex items-center gap-2 transition-all rounded-lg px-2 py-1.5 ${
                    isLoadingPackages 
                      ? 'cursor-wait opacity-50' 
                      : 'cursor-pointer ' + (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
                  }`}
                >
                  {/* ✅ Luôn dùng màu xanh cho gói đã chọn (vì đã được filter Active) */}
                  <div className={`w-8 h-8 ${isDarkMode ? 'bg-emerald-900/30' : 'bg-[#00c9a7]/10'} rounded-full flex items-center justify-center`}>
                    {isLoadingPackages ? (
                      <FiLoader className={`text-[#00c9a7] text-base animate-spin`} />
                    ) : (
                      <FiCheck className={`text-[#00c9a7] text-base`} />
                    )}
                  </div>
                  <div>
                    {/* ✅ Hiển thị trực tiếp từ selectedPackage */}
                    {(() => {
                      // ✅ Package từ API có structure: { feeId, feeCommission: { feeName }, remainingListings, expiredAt, status }
                      // ✅ Package từ activePackage có thể có: { feeId, feeName, remainingListings, expiredAt, package: {...} }
                      const pkg = selectedPackage.package || selectedPackage;
                      const feeName = pkg.feeCommission?.feeName || selectedPackage.feeName || 'Gói đăng tin';
                      const remainingListings = pkg.remainingListings ?? selectedPackage.remainingListings ?? 0;
                      const expiredAt = pkg.expiredAt || selectedPackage.expiredAt;
                      
                      return (
                        <>
                          <p className={`text-xs font-semibold text-[#00c9a7]`}>
                            {isLoadingPackages ? 'Đang tải...' : feeName}
                          </p>
                          <p className={`text-xs transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            {isLoadingPackages ? (
                              <span className="text-gray-400">Đang lấy thông tin mới...</span>
                            ) : (
                              <>
                                Còn {remainingListings} tin
                                {expiredAt && 
                                  ` - HSD: ${formatExpiredDate(expiredAt)}`
                                }
                              </>
                            )}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                  <button
                    type="button"
                    disabled={isLoadingPackages}
                    className={`transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} ${isLoadingPackages ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {showPackageDropdown ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                </div>

                {/* Package Dropdown */}
                {showPackageDropdown && userPackages.length > 0 && (
                  <div className={`absolute bottom-full left-0 mb-2 w-72 max-h-60 overflow-y-auto rounded-lg shadow-lg border-2 z-50 transition-colors duration-500 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    {userPackages.map((pkg, index) => {
                      const isSelected = selectedPackage?.feeId === pkg.feeId;
                      return (
                        <div
                          key={pkg.feeId}
                          onClick={() => handlePackageSelect(pkg)}
                          className={`cursor-pointer transition-all px-3 py-2.5 ${
                            isSelected
                              ? isDarkMode ? 'bg-emerald-900/30' : 'bg-[#00c9a7]/10'
                              : isDarkMode 
                                ? 'hover:bg-gray-700' 
                                : 'hover:bg-gray-50'
                          } ${index !== userPackages.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#00c9a7]' : 'bg-transparent border border-gray-400'}`} />
                            <div className="flex-1">
                              <p className={`text-xs font-semibold transition-colors duration-500 ${
                                isSelected 
                                  ? 'text-[#00c9a7]' 
                                  : isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {pkg.feeCommission?.feeName || 'Gói đăng tin'}
                              </p>
                              <p className={`text-xs transition-colors duration-500 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                Còn {pkg.remainingListings || 0} tin
                                {pkg.expiredAt && ` - HSD: ${formatExpiredDate(pkg.expiredAt)}`}
                              </p>
                            </div>
                            {isSelected && (
                              <FiCheck className={`text-[#00c9a7] text-base`} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 ${packageStatus.bgColor} rounded-full flex items-center justify-center`}>
                  <FiCheck className={`${packageStatus.iconColor} text-base`} />
                </div>
                <div>
                  <p className={`text-xs font-semibold ${packageStatus.color}`}>
                    {packageStatus.message}
                  </p>
                  <p className={`text-xs transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    {packageStatus.subMessage}
                    {packageStatus.type === 'active' && packageStatus.expiredAt && 
                      ` - HSD: ${formatExpiredDate(packageStatus.expiredAt)}`
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-1 md:flex-none">
            {/* Save Draft Button */}
            {showDraftButton && onSaveDraft && (
              <motion.button
                whileHover={{ scale: disabled || isSavingDraft || isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: disabled || isSavingDraft || isSubmitting ? 1 : 0.98 }}
                type="button"
                onClick={onSaveDraft}
                disabled={disabled || isSavingDraft || isSubmitting}
                className={`flex-1 md:flex-none md:min-w-[120px] py-2.5 px-4 rounded-lg font-semibold border-2 transition-all flex items-center justify-center gap-2 text-sm ${
                  disabled || isSavingDraft || isSubmitting
                    ? (isDarkMode ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed' : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed')
                    : (isDarkMode ? 'bg-gray-800 text-[#00c9a7] border-[#00c9a7] hover:bg-emerald-900/20' : 'bg-white text-[#00c9a7] border-[#00c9a7] hover:bg-[#00c9a7]/5 hover:border-[#00b897]')
                }`}
              >
                {isSavingDraft ? (
                  <>
                    <FiLoader className="animate-spin text-base" />
                    <span className="hidden sm:inline">Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="text-base" />
                    <span className="hidden sm:inline">{draftButtonText}</span>
                  </>
                )}
              </motion.button>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: disabled || isSubmitting || isSavingDraft ? 1 : 1.02 }}
              whileTap={{ scale: disabled || isSubmitting || isSavingDraft ? 1 : 0.98 }}
              type={type}
              form={formId}
              disabled={disabled || isSubmitting || isSavingDraft}
              className={`flex-1 md:flex-none md:min-w-[140px] py-2.5 px-6 rounded-lg font-bold shadow-md transition-all flex items-center justify-center gap-2 text-sm ${
                disabled || isSubmitting || isSavingDraft
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-[#00c9a7] hover:bg-[#00b897] text-white hover:shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="animate-spin text-base" />
                  <span className="hidden sm:inline">Đang đăng...</span>
                  <span className="sm:hidden">Đăng...</span>
                </>
              ) : (
                <>
                  <FiCheck className="text-base" />
                  <span className="hidden sm:inline">{buttonText}</span>
                  <span className="sm:hidden">Đăng</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostSnackbar;
