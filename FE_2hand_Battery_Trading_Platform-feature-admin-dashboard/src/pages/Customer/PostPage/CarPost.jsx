import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FiChevronDown, FiChevronUp, FiCamera, FiVideo, FiX } from "react-icons/fi";
import PostSnackbar from "./PostSnackbar";
import SuccessModal from "../../../components/SuccessModal/SuccessModal";
import UploadProgressModal from "../../../components/UploadProgressModal/UploadProgressModal";
import PlansModal from "../PlansPage/PlansModal";
import PhoneUpdateModal from "../../../components/PhoneUpdateModal/PhoneUpdateModal";
import { itemService, phoneUpdateService } from "../../../services";
import { listingService } from "../../../services/listings/listingService";
import { userPackageService } from "../../../services/users/userPackageService";

// ✅ Import validation & auto-fill utilities
import {
  validateForm,
  validateDraft,
  createHandleFieldChange,
  createClearError,
  hasErrors,
  getValidationSummary,
} from "../../../services/listings/formValidation";
import {
  autoFillFormData,
  autoFillMedia,
  urlToFile,
  clearDraftMetadata,
} from "../../../services/listings/formAutoFill";

const CAR_BRANDS = [
  "Acura", "Aion", "Alfa Romeo", "Asia", "Aston Martin", "Audi", "Baic", "Bentley", 
  "BMW", "Buick", "BYD", "Cadillac", "Changan", "Chery", "Chevrolet", "Chrysler", 
  "Citroen", "Daewoo", "Daihatsu", "Dodge", "Dongfeng", "Ferrari", "Fiat", "Ford", 
  "GAC", "Gaz", "Geely", "Genesis", "GMC", "GWM", "Haima", "Haval", "Honda", 
  "HongQi", "Hummer", "Hyundai", "Infiniti", "Isuzu", "Jaguar", "Jeep", "Kia", 
  "Lada", "Lamborghini", "LandRover", "Lexus", "Lifan", "Lincoln", "Luxgen", 
  "Lynk&Co", "Man", "Maserati", "Maybach", "Mazda", "McLaren", "Mekong", 
  "Mercedes Benz", "Mercury", "MG", "MINI", "Mitsubishi", "Nissan", "Opel", 
  "Peugeot", "Pontiac", "Porsche", "Proton", "RAM", "Renault", "Reult", 
  "Rolls Royce", "Rover", "Samsung", "Scion", "Skoda", "Smart", "Ssangyong", 
  "Subaru", "Suzuki", "SYM", "Tesla", "Toyota", "UAZ", "VinFast", "Volkswagen", 
  "Volvo", "Wuling", "Zotye", "Hãng khác"
];

const CAR_YEARS = [
  "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016",
  "2015", "2014", "2013", "2012", "2011", "2010", "2009", "2008", "2007", "2006",
  "2005", "2004", "2003", "2002", "2001", "2000", "1999", "1998", "1997", "1996",
  "1995", "1994", "1993", "1992", "1991", "1990", "1989", "1988", "1987", "1986",
  "1985", "1984", "1983", "1982", "1981", "trước năm 1980"
];

const CAR_ORIGINS = [
  "Việt Nam",
  "Ấn Độ",
  "Hàn Quốc",
  "Thái Lan",
  "Nhật Bản",
  "Trung Quốc",
  "Mỹ",
  "Đức",
  "Đài Loan",
  "Nước khác"
];

const CAR_BODY_TYPES = [
  "Sedan",
  "SUV / Cross over",
  "Hatchback",
  "Pick-up (bán tải)",
  "Minivan (MPV)",
  "Van",
  "Coupe (2 cửa)",
  "Mui trần",
  "Kiểu dáng khác"
];

const CAR_SEATS = [
  "2",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "12",
  "14",
  "16",
  "24",
  "32",
  "45",
  "Khác"
];

const CAR_COLORS = [
  "Trắng",
  "Đen",
  "Xám",
  "Bạc",
  "Đỏ",
  "Xanh dương",
  "Xanh lam",
  "Xanh lá",
  "Vàng",
  "Cam",
  "Nâu",
  "Be",
  "Hồng",
  "Tím",
  "Xanh ngọc",
  "Màu khác"
];

const CAR_PREVIOUS_OWNERS = [
  "Chủ đầu tiên",  // ✅ Khớp với auto-fill
  "2 chủ",
  "3 chủ",
  "4 chủ trở lên"  // ✅ Khớp với auto-fill
];

const CarPost = ({ images, itemTypeId, draftData, isEditMode }) => {
  // Track listingId & itemId sau khi lưu nháp lần đầu
  const [savedDraft, setSavedDraft] = useState({
    listingId: draftData?.listingId || null,
    itemId: draftData?.item?.itemId || null
  });
  
  // Dark mode state synced with localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('landing_dark_mode');
    return stored === 'true';
  });

  // Listen for dark mode changes from Header
  useEffect(() => {
    const handleDarkModeChange = (event) => {
      setIsDarkMode(event.detail.isDarkMode);
    };
    
    window.addEventListener('darkModeChanged', handleDarkModeChange);
    return () => window.removeEventListener('darkModeChanged', handleDarkModeChange);
  }, []);
  
  // ✅ State để lưu thông tin gói đăng tin active
  const [activePackage, setActivePackage] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null); // Gói được chọn từ dropdown
  const [isCheckingPackage, setIsCheckingPackage] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showPhoneUpdateModal, setShowPhoneUpdateModal] = useState(false);
  
  const [formData, setFormData] = useState({
    condition: "",
    brand: "",
    year: "",
    version: "",
    transmission: "",
    fuelType: "",
    origin: "",
    bodyType: "",
    seats: "",
    color: "",
    licensePlate: "",
    previousOwners: "",
    hasAccessories: "",
    hasValidInspection: "",
    mileage: "",
    price: "",
    title: "",
    description: "",
    sellerType: "",
    address: "",
  });

  // ✅ Kiểm tra gói đăng tin active khi component mount
  useEffect(() => {
    const checkUserPackage = async () => {
      try {
        setIsCheckingPackage(true);
        const packageInfo = await userPackageService.getActivePackage();
        
        if (packageInfo) {
          setActivePackage(packageInfo);
          console.log('✅ Tìm thấy gói đăng tin Active:', packageInfo);
        } else {
          console.log('⚠️ Không có gói đăng tin active, sẽ yêu cầu thanh toán phí lẻ');
          setActivePackage(null);
        }
      } catch (error) {
        console.error('❌ Lỗi khi kiểm tra gói đăng tin:', error);
        setActivePackage(null);
      } finally {
        setIsCheckingPackage(false);
      }
    };
    
    checkUserPackage();
  }, []);

  // ✅ Pre-fill formData từ draftData khi có (Refactored)
  useEffect(() => {
    if (isEditMode && draftData) {
      // ✅ Auto-fill form data - 1 dòng thay vì 90+ dòng mapping code
      const filledData = autoFillFormData(draftData, 'car');
      
      // ✅ Map buyNowPrice (number) từ backend vào formData.price (string)
      if (draftData?.buyNowPrice !== undefined && draftData?.buyNowPrice !== null) {
        // Đảm bảo convert number thành string để hiển thị trong input
        filledData.price = String(draftData.buyNowPrice);
      }
      
      setFormData((prev) => ({ ...prev, ...filledData }));
      
      // ✅ Auto-fill media - 1 function thay vì 20+ dòng code
      const { images, video } = autoFillMedia(draftData);
      
      if (images.length > 0) {
        setUploadedImages(images);
      }
      
      if (video) {
        setUploadedVideos([video]);
      }
    }
  }, [isEditMode, draftData]);

  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", message: "" });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const [titleCount, setTitleCount] = useState(0);
  const [descCount, setDescCount] = useState(0);
  const [showTitleSuggestion, setShowTitleSuggestion] = useState(false);
  const [showDescSuggestion, setShowDescSuggestion] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [brandSearchTerm, setBrandSearchTerm] = useState("");
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [yearSearchTerm, setYearSearchTerm] = useState("");
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [originSearchTerm, setOriginSearchTerm] = useState("");
  const [showBodyTypeDropdown, setShowBodyTypeDropdown] = useState(false);
  const [bodyTypeSearchTerm, setBodyTypeSearchTerm] = useState("");
  const [showSeatsDropdown, setShowSeatsDropdown] = useState(false);
  const [seatsSearchTerm, setSeatsSearchTerm] = useState("");
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [colorSearchTerm, setColorSearchTerm] = useState("");
  const [showOwnersDropdown, setShowOwnersDropdown] = useState(false);
  const [ownersSearchTerm, setOwnersSearchTerm] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const brandDropdownRef = useRef(null);
  const yearDropdownRef = useRef(null);
  const originDropdownRef = useRef(null);
  const bodyTypeDropdownRef = useRef(null);
  const seatsDropdownRef = useRef(null);
  const colorDropdownRef = useRef(null);
  const ownersDropdownRef = useRef(null);


  const filteredBrands = CAR_BRANDS.filter((brand) =>
    brand.toLowerCase().includes(brandSearchTerm.toLowerCase())
  );

  const filteredYears = CAR_YEARS.filter((year) =>
    year.toLowerCase().includes(yearSearchTerm.toLowerCase())
  );

  const filteredOrigins = CAR_ORIGINS.filter((origin) =>
    origin.toLowerCase().includes(originSearchTerm.toLowerCase())
  );

  const filteredBodyTypes = CAR_BODY_TYPES.filter((bodyType) =>
    bodyType.toLowerCase().includes(bodyTypeSearchTerm.toLowerCase())
  );

  const filteredSeats = CAR_SEATS.filter((seats) =>
    seats.toLowerCase().includes(seatsSearchTerm.toLowerCase())
  );

  const filteredColors = CAR_COLORS.filter((color) =>
    color.toLowerCase().includes(colorSearchTerm.toLowerCase())
  );

  const filteredOwners = CAR_PREVIOUS_OWNERS.filter((owner) =>
    owner.toLowerCase().includes(ownersSearchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target)) {
        setShowBrandDropdown(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setShowYearDropdown(false);
      }
      if (originDropdownRef.current && !originDropdownRef.current.contains(event.target)) {
        setShowOriginDropdown(false);
      }
      if (bodyTypeDropdownRef.current && !bodyTypeDropdownRef.current.contains(event.target)) {
        setShowBodyTypeDropdown(false);
      }
      if (seatsDropdownRef.current && !seatsDropdownRef.current.contains(event.target)) {
        setShowSeatsDropdown(false);
      }
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(event.target)) {
        setShowColorDropdown(false);
      }
      if (ownersDropdownRef.current && !ownersDropdownRef.current.contains(event.target)) {
        setShowOwnersDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBrandSelect = (brand) => {
    setFormData((prev) => ({ ...prev, brand }));
    setBrandSearchTerm("");
    setShowBrandDropdown(false);
    // Clear error khi chọn
    if (validationErrors.brand) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.brand;
        return newErrors;
      });
    }
  };

  const handleYearSelect = (year) => {
    setFormData((prev) => ({ ...prev, year }));
    setYearSearchTerm("");
    setShowYearDropdown(false);
    // Clear error khi chọn
    if (validationErrors.year) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.year;
        return newErrors;
      });
    }
  };

  const handleOriginSelect = (origin) => {
    setFormData((prev) => ({ ...prev, origin }));
    setOriginSearchTerm("");
    setShowOriginDropdown(false);
    // Clear error khi chọn
    if (validationErrors.origin) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.origin;
        return newErrors;
      });
    }
  };

  const handleBodyTypeSelect = (bodyType) => {
    setFormData((prev) => ({ ...prev, bodyType }));
    setBodyTypeSearchTerm("");
    setShowBodyTypeDropdown(false);
    // Clear error khi chọn
    if (validationErrors.bodyType) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.bodyType;
        return newErrors;
      });
    }
  };

  const handleSeatsSelect = (seats) => {
    setFormData((prev) => ({ ...prev, seats }));
    setSeatsSearchTerm("");
    setShowSeatsDropdown(false);
    // Clear error khi chọn
    if (validationErrors.seats) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.seats;
        return newErrors;
      });
    }
  };

  const handleColorSelect = (color) => {
    setFormData((prev) => ({ ...prev, color }));
    setColorSearchTerm("");
    setShowColorDropdown(false);
    // Clear error khi chọn
    if (validationErrors.color) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.color;
        return newErrors;
      });
    }
  };

  const handleOwnersSelect = (owners) => {
    setFormData((prev) => ({ ...prev, previousOwners: owners }));
    setOwnersSearchTerm("");
    setShowOwnersDropdown(false);
    clearFieldError('previousOwners');
  };

  // ✅ Helper function để clear error - sử dụng utility
  const clearFieldError = createClearError(setValidationErrors);
  
  // ✅ urlToFile đã được import từ formAutoFill.js

  // Image upload handlers
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (uploadedImages.length + files.length > 20) {
      alert("Bạn chỉ có thể tải lên tối đa 20 hình ảnh");
      return;
    }
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setUploadedImages((prev) => [...prev, ...newImages]);
    // Clear error khi upload ảnh
    clearFieldError('images');
  };

  const handleImageDragOver = (e) => {
    e.preventDefault();
    setIsDraggingImage(true);
  };

  const handleImageDragLeave = () => {
    setIsDraggingImage(false);
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setIsDraggingImage(false);
    const files = Array.from(e.dataTransfer.files);
    if (uploadedImages.length + files.length > 20) {
      alert("Bạn chỉ có thể tải lên tối đa 20 hình ảnh");
      return;
    }
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setUploadedImages((prev) => [...prev, ...newImages]);
    // Clear error khi upload ảnh
    clearFieldError('images');
  };

  const removeImage = (index) => {
    console.log(`🗑️ Removing image at index ${index}`);
    setUploadedImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      console.log(`📊 Images after removal: ${updated.length} (was ${prev.length})`);
      return updated;
    });
  };

  // Video upload handlers
  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (uploadedVideos.length + files.length > 3) {
      alert("Bạn chỉ có thể tải lên tối đa 3 video");
      return;
    }
    const newVideos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    setUploadedVideos((prev) => [...prev, ...newVideos]);
  };

  const handleVideoDragOver = (e) => {
    e.preventDefault();
    setIsDraggingVideo(true);
  };

  const handleVideoDragLeave = () => {
    setIsDraggingVideo(false);
  };

  const handleVideoDrop = (e) => {
    e.preventDefault();
    setIsDraggingVideo(false);
    const files = Array.from(e.dataTransfer.files);
    if (uploadedVideos.length + files.length > 3) {
      alert("Bạn chỉ có thể tải lên tối đa 3 video");
      return;
    }
    const newVideos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    setUploadedVideos((prev) => [...prev, ...newVideos]);
  };

  const removeVideo = (index) => {
    console.log(`🗑️ Removing video at index ${index}`);
    setUploadedVideos((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      console.log(`📊 Videos after removal: ${updated.length} (was ${prev.length})`);
      return updated;
    });
  };

  // ✅ Callback để nhận package được chọn từ PostSnackbar
  const handlePackageChange = (packageInfo) => {
    setSelectedPackage(packageInfo);
    console.log('✅ Package selected in CarPost:', {
      feeId: packageInfo.feeId,
      feeName: packageInfo.feeName,
      remainingListings: packageInfo.remainingListings
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error của field này khi người dùng bắt đầu nhập
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Format price with dots for display
    let processedValue = value;
    if (name === "price") {
      // Remove all non-numeric characters (allow only digits)
      const numericValue = value.replace(/[^0-9]/g, '');
      // Add dots for thousands separator
      processedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    
    if (name === "title") {
      if (processedValue.length <= 50) {
        setFormData((prev) => ({ ...prev, [name]: processedValue }));
        setTitleCount(processedValue.length);
      }
    } else if (name === "description") {
      if (processedValue.length <= 1500) {
        setFormData((prev) => ({ ...prev, [name]: processedValue }));
        setDescCount(processedValue.length);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: processedValue }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Sử dụng selectedPackage nếu có, nếu không thì dùng activePackage
    const packageToUse = selectedPackage || activePackage;
    
    // ✅ KIỂM TRA GÓI ĐĂNG TIN - Bắt buộc phải có gói
    if (!packageToUse || !packageToUse.feeId) {
      console.log('⚠️ Không có gói đăng tin active');
      // Lưu current path để quay về sau khi mua gói thành công
      sessionStorage.setItem('postingPath', window.location.pathname);
      // Mở modal chọn gói
      setShowPlansModal(true);
      return;
    }
    
    // ✅ KIỂM TRA THỜI HẠN GÓI - Kiểm tra xem gói còn hạn không
    if (packageToUse.expiredAt) {
      const now = new Date();
      const expiredDate = new Date(packageToUse.expiredAt);
      
      if (expiredDate < now) {
        console.log('⚠️ Gói đăng tin đã hết hạn:', packageToUse.expiredAt);
        // Lưu current path để quay về sau khi mua gói thành công
        sessionStorage.setItem('postingPath', window.location.pathname);
        // Mở modal chọn gói
        setShowPlansModal(true);
        return;
      }
    }
    
    // ✅ KIỂM TRA SỐ TIN ĐĂNG CÒN LẠI - Phải > 0
    if (packageToUse.remainingListings !== undefined && packageToUse.remainingListings !== null) {
      if (packageToUse.remainingListings <= 0) {
        console.log('⚠️ Đã hết số tin đăng còn lại:', packageToUse.remainingListings);
        // Lưu current path để quay về sau khi mua gói thành công
        sessionStorage.setItem('postingPath', window.location.pathname);
        // Mở modal chọn gói
        setShowPlansModal(true);
        return;
      }
    }
    
    // ✅ KIỂM TRA SỐ ĐIỆN THOẠI - Bắt buộc phải có phone
    if (!phoneUpdateService.hasPhoneNumber()) {
      console.log('⚠️ User does not have phone number');
      // Mở modal cập nhật phone và password
      setShowPhoneUpdateModal(true);
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(0);
    setShowUploadModal(true);
    
    try {
      // ✅ VALIDATION - 1 dòng thay vì 100+ dòng validation code
      const errors = validateForm(formData, 'car', uploadedImages);
      
      if (hasErrors(errors)) {
        setValidationErrors(errors);
        setIsSubmitting(false);
        setShowUploadModal(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // ✅ Optional: Show toast notification
        // alert(getValidationSummary(errors));
        return;
      }
      
      setValidationErrors({});
      
      // 1. Kiểm tra itemTypeId từ props
      if (!itemTypeId) {
        throw new Error('Không tìm thấy ItemTypeId cho danh mục này');
      }
      
      // 2. Tạo SerialNumber tự động
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      const serialNumber = `CAR_${formData.brand || 'UNKNOWN'}_${formData.year || 'YEAR'}_${randomStr}_${timestamp}`;
      
      // 🔍 DEBUG: Check formData TRƯỚC khi mapping
      console.log('🔍 DEBUG - formData TRƯỚC khi mapping:');
      console.log('   previousOwners:', formData.previousOwners);
      console.log('   hasAccessories:', formData.hasAccessories);
      console.log('   hasValidInspection:', formData.hasValidInspection);
      console.log('   sellerType:', formData.sellerType);
      
      // 3. Chuẩn bị dữ liệu listing
      const listingData = {
        serialNumber: serialNumber,
        itemTypeId: itemTypeId,
        title: formData.title,
        brand: formData.brand || '',
        model: formData.version || '',
        year: formData.year ? parseInt(formData.year) : null,
        mileage: formData.mileage || '', // ✅ STRING theo API spec mới
        condition: formData.condition === 'used' ? 'Đã qua sử dụng' : 'Mới',
        style: formData.bodyType || '',
        color: formData.color || '',
        seat: formData.seats || '', // ✅ STRING theo API spec mới
        licensePlate: formData.licensePlate || '',
        origin: formData.origin || '',
        fuel: formData.fuelType === 'gasoline' ? 'Xăng' : 
              formData.fuelType === 'diesel' ? 'Dầu' : 
              formData.fuelType === 'electric' ? 'Điện' : 
              formData.fuelType === 'hybrid' ? 'Động cơ Hybrid' : '',
        gearbox: formData.transmission === 'automatic' ? 'Số tự động' : 'Số sàn',
        ownerCount: (() => {
          // ✅ Map "Chủ đầu tiên" → "1", "2 chủ" → "2", "4 chủ trở lên" → "4"
          if (!formData.previousOwners) return '';
          if (formData.previousOwners.includes('Chủ đầu')) return '1';
          const match = formData.previousOwners.match(/\d+/);
          return match ? String(match[0]) : '';
        })(), // ✅ STRING
        accessories: formData.hasAccessories === 'yes' ? true : formData.hasAccessories === 'no' ? false : null, // ✅ BOOLEAN
        inspectionValidUntil: formData.hasValidInspection === 'yes' ? true : formData.hasValidInspection === 'no' ? false : null, // ✅ BOOLEAN
        youAre: formData.sellerType === 'individual' ? 'Cá nhân' : formData.sellerType === 'professional' ? 'Bán chuyên' : '', // ✅ STRING
        detail: formData.description || '',
        address: formData.address || '',
        listingType: 0, // BẮT BUỘC lưu Draft trước, sau đó toggle sang Active
      };
      
      // ✅ Thêm FeeId nếu có gói đăng tin (ưu tiên selectedPackage)
      const packageToUseForListing = selectedPackage || activePackage;
      console.log('🔍 Package to use for listing:', {
        selectedPackage: selectedPackage ? {
          feeId: selectedPackage.feeId,
          feeName: selectedPackage.feeName
        } : null,
        activePackage: activePackage ? {
          feeId: activePackage.feeId,
          feeName: activePackage.feeName
        } : null,
        finalPackage: packageToUseForListing ? {
          feeId: packageToUseForListing.feeId,
          feeName: packageToUseForListing.feeName
        } : null
      });
      
      if (packageToUseForListing && packageToUseForListing.feeId) {
        listingData.feeId = packageToUseForListing.feeId;
        console.log('✅ Đăng tin bằng gói:', {
          feeId: packageToUseForListing.feeId,
          feeName: packageToUseForListing.feeName,
          remainingListings: packageToUseForListing.remainingListings
        });
      } else {
        console.log('⚠️ Không có gói, backend sẽ xử lý thanh toán phí lẻ');
      }
      
      // ✅ Giá bán bắt buộc > 0 khi đăng tin chính thức - ĐẢM BẢO LÀ NUMBER
      // Remove dots before parsing
      const numericPrice = formData.price.replace(/\./g, '');
      const priceValue = parseFloat(numericPrice);
      if (isNaN(priceValue) || priceValue <= 0) {
        throw new Error('Giá bán phải là số hợp lệ và lớn hơn 0');
      }
      listingData.buyNowPrice = priceValue;
      
      // 🔍 DEBUG: Check các field đặc biệt
      console.log('🔍 DEBUG - Các field đặc biệt GỬI LÊN BACKEND:');
      console.log('   buyNowPrice:', listingData.buyNowPrice, typeof listingData.buyNowPrice);
      console.log('   ownerCount:', listingData.ownerCount, typeof listingData.ownerCount);
      console.log('   accessories:', listingData.accessories, typeof listingData.accessories);
      console.log('   inspectionValidUntil:', listingData.inspectionValidUntil, typeof listingData.inspectionValidUntil);
      console.log('   youAre:', listingData.youAre, typeof listingData.youAre);
      
      // 4. Chuẩn bị file images và video
      // 4. BƯỚC 1: Lưu tin dạng Draft trước (theo logic MỚI)
      let response;
      let listingId;
      
      if (isEditMode && draftData?.item?.itemId) {
        // ===== EDIT MODE: Gửi existing URLs + new files =====
        console.log('🔄 BƯỚC 1: Cập nhật tin nháp (UPDATE)');
        
        console.log('=== DEBUG HANDLESUBMIT: TRẠNG THÁI ẢNH ===');
        console.log('📊 Tổng số ảnh trong uploadedImages:', uploadedImages.length);
        uploadedImages.forEach((img, index) => {
          console.log(`   [${index}] ${img.isExisting ? '🔵 ẢNH CŨ' : '🟢 ẢNH MỚI'}: ${img.preview?.substring(0, 80)}...`);
        });
        
        // Extract existing image URLs
        const existingImageUrls = uploadedImages
          .filter(img => img.isExisting && img.preview)
          .map(img => img.preview);
        
        // Extract new image files
        const newImageFiles = uploadedImages
          .filter(img => !img.isExisting && img.file)
          .map(img => img.file);
        
        // Video URLs & files
        const existingVideoUrl = uploadedVideos.length > 0 && uploadedVideos[0].isExisting 
          ? uploadedVideos[0].preview 
          : null;
        const newVideoFile = uploadedVideos.length > 0 && !uploadedVideos[0].isExisting 
          ? uploadedVideos[0].file 
          : null;
        
        console.log('=== ✅ HANDLESUBMIT: SẼ GỬI CHO BACKEND ===');
        console.log(`📸 existingImageUrls (${existingImageUrls.length} URLs):`);
        existingImageUrls.forEach((url, i) => {
          console.log(`   [${i}] ${url.substring(0, 100)}...`);
        });
        console.log(`📸 newImageFiles (${newImageFiles.length} Files):`);
        newImageFiles.forEach((file, i) => {
          console.log(`   [${i}] ${file.name} (${file.size} bytes)`);
        });
        console.log(`🎬 existingVideoUrl: ${existingVideoUrl ? existingVideoUrl.substring(0, 100) + '...' : 'null'}`);
        console.log(`🎬 newVideoFile: ${newVideoFile ? newVideoFile.name : 'null'}`);
        
        // 🔍 DEBUG: Kiểm tra listingData trước khi gọi UPDATE API
        console.log('🔍 DEBUG UPDATE - listingData.buyNowPrice:', listingData.buyNowPrice, typeof listingData.buyNowPrice);
        console.log('================================');
        
        response = await itemService.updateListingWithItem(
          draftData.listingId,
          draftData.item.itemId,
          listingData,
          existingImageUrls,
          newImageFiles,
          existingVideoUrl,
          newVideoFile,
          (progress) => setUploadProgress(progress)
        );
        
        listingId = draftData.listingId;
      } else {
        // ===== CREATE MODE: Chỉ gửi new files =====
        console.log('📝 BƯỚC 1: Tạo tin nháp mới (CREATE)');
        
        const imageFiles = uploadedImages
          .filter(img => img.file && !img.isExisting)
          .map(img => img.file);
        const videoFile = uploadedVideos.length > 0 && !uploadedVideos[0].isExisting 
          ? uploadedVideos[0].file 
          : null;
        
        console.log(`📸 Thêm ${imageFiles.length} ảnh mới`);
        
        response = await itemService.createListingWithItem(
          listingData,
          imageFiles,
          videoFile,
          (progress) => setUploadProgress(progress)
        );
        
        // Lấy listingId từ response
        const responseData = response?.data?.data || response?.data;
        listingId = responseData?.listingId;
        
        if (!listingId) {
          throw new Error('Không lấy được listingId từ response');
        }
      }
      
      console.log('✓ BƯỚC 1 hoàn tất. ListingId:', listingId);
      
      // ✅ Refresh package info trước khi toggle (đảm bảo có remainingListings chính xác)
      console.log('🔄 Refreshing package info...');
      const packageToUseForRefresh = selectedPackage || activePackage;
      console.log('🔍 Package to refresh:', {
        hasSelectedPackage: !!selectedPackage,
        selectedPackageFeeId: selectedPackage?.feeId,
        activePackageFeeId: activePackage?.feeId,
        packageToUseFeeId: packageToUseForRefresh?.feeId
      });
      
      let refreshedPackage = packageToUseForRefresh;
      try {
        // Refresh từ API để lấy thông tin mới nhất
        const response = await userPackageService.getUserPackages();
        const packages = response?.data?.packages || response?.data;
        
        if (response?.success && Array.isArray(packages)) {
          // Tìm gói tương ứng với package đang sử dụng
          const currentPackageId = packageToUseForRefresh?.feeId;
          const updatedPackage = packages.find(pkg => pkg.feeId === currentPackageId);
          
          if (updatedPackage) {
            const packageInfo = {
              feeId: updatedPackage.feeId,
              feeName: updatedPackage.feeCommission?.feeName,
              feeType: updatedPackage.feeCommission?.feeType,
              remainingListings: updatedPackage.remainingListings,
              expiredAt: updatedPackage.expiredAt,
              package: updatedPackage
            };
            
            // ✅ Ưu tiên cập nhật selectedPackage nếu có (gói user đã chọn)
            if (selectedPackage) {
              setSelectedPackage(packageInfo);
              refreshedPackage = packageInfo;
              console.log('✅ SelectedPackage refreshed:', packageInfo);
            } else {
              setActivePackage(packageInfo);
              refreshedPackage = packageInfo;
              console.log('✅ ActivePackage refreshed:', packageInfo);
            }
          } else {
            console.warn('⚠️ Package not found after refresh, using cached package');
          }
        }
      } catch (error) {
        console.error('⚠️ Error refreshing package info:', error);
        // Không throw error, tiếp tục với package cũ
      }
      
      console.log('🔍 Final refreshedPackage to use:', {
        feeId: refreshedPackage?.feeId,
        feeName: refreshedPackage?.feeName,
        remainingListings: refreshedPackage?.remainingListings
      });
      
      // ✅ DOUBLE-CHECK: Kiểm tra lại thời hạn và số tin còn lại sau khi refresh
      if (refreshedPackage && refreshedPackage.expiredAt) {
        const now = new Date();
        const expiredDate = new Date(refreshedPackage.expiredAt);
        
        if (expiredDate < now) {
          console.error('❌ Gói đăng tin đã hết hạn sau khi refresh:', refreshedPackage.expiredAt);
          throw new Error('Gói đăng tin của bạn đã hết hạn. Vui lòng gia hạn hoặc mua gói mới.');
        }
      }
      
      if (refreshedPackage && refreshedPackage.remainingListings !== undefined && refreshedPackage.remainingListings !== null) {
        console.log('🔍 Checking remainingListings:', refreshedPackage.remainingListings);
        if (refreshedPackage.remainingListings <= 0) {
          console.error('❌ Đã hết số tin đăng còn lại sau khi refresh:', refreshedPackage.remainingListings);
          throw new Error('Bạn đã hết số tin đăng còn lại trong gói. Vui lòng mua gói mới.');
        }
      }
      
      // 6. BƯỚC 2: Toggle status từ Draft → Active (CHỈ khi listing đang ở Draft)
      if (isEditMode && draftData?.status) {
        console.log('🔍 Draft status:', draftData.status);
        if (draftData.status !== 'Draft' && draftData.status !== 'draft') {
          console.log('⚠️ Listing không phải Draft, bỏ qua toggle. Status:', draftData.status);
          // Listing đã Active rồi, không cần toggle, chỉ hiển thị success
          setShowUploadModal(false);
          setSuccessMessage({
            title: "Cập nhật tin thành công!",
            message: "Thông tin tin đăng đã được cập nhật."
          });
          setShowSuccessModal(true);
          return;
        }
      }
      
      console.log('🚀 BƯỚC 2: Chuyển trạng thái sang Active...');
      await listingService.toggleListingStatus(listingId);
      console.log('✓ BƯỚC 2 hoàn tất. Tin đã được đăng công khai!');
      
      // ✅ Clear metadata sau khi đăng tin thành công
      clearDraftMetadata(listingId);
      
      // Hide upload modal and show success modal
      setShowUploadModal(false);
      
      setSuccessMessage({
        title: "Đăng tin thành công!",
        message: "Tin của bạn đã được đăng công khai và đang chờ duyệt."
      });
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
      const errorDetails = error.response?.data?.errors || [];
      setShowUploadModal(false);
      
      // ✅ Kiểm tra nếu lỗi liên quan đến package
      const hasPackageError = errorDetails.some(err => 
        typeof err === 'string' && err.includes('remaining listing slots')
      ) || errorMessage.includes('remaining listing slots') || errorMessage.includes('package');
      
      if (hasPackageError) {
        console.log('⚠️ Lỗi liên quan đến gói, mở Plans Modal');
        sessionStorage.setItem('postingPath', window.location.pathname);
        setShowPlansModal(true);
      } else {
        alert(`Có lỗi xảy ra: ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setUploadProgress(0);
    setShowUploadModal(true);
    
    try {
      // ✅ VALIDATION Draft - 1 dòng thay vì 15+ dòng
      const errors = validateDraft(uploadedImages);
      
      if (hasErrors(errors)) {
        setValidationErrors(errors);
        setIsSavingDraft(false);
        setShowUploadModal(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      setValidationErrors({});
      
      console.log('Saving draft...');
      console.log('Form Data:', formData);
      console.log('Images:', uploadedImages);
      console.log('Videos:', uploadedVideos);
      
      // 1. Kiểm tra itemTypeId từ props
      if (!itemTypeId) {
        throw new Error('Không tìm thấy ItemTypeId cho danh mục này');
      }
      
      console.log('ItemTypeId từ props:', itemTypeId);
      
      // 2. Tạo SerialNumber tự động
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      const serialNumber = `CAR_${formData.brand || 'UNKNOWN'}_${formData.year || 'YEAR'}_${randomStr}_${timestamp}`;
      
      console.log('SerialNumber:', serialNumber);
      
      // 🔍 DEBUG: Check formData TRƯỚC khi mapping (DRAFT)
      console.log('🔍 DEBUG DRAFT - formData TRƯỚC khi mapping:');
      console.log('   previousOwners:', formData.previousOwners);
      console.log('   hasAccessories:', formData.hasAccessories);
      console.log('   hasValidInspection:', formData.hasValidInspection);
      console.log('   sellerType:', formData.sellerType);
      
      // 3. Chuẩn bị dữ liệu listing
      const listingData = {
        serialNumber: serialNumber,
        itemTypeId: itemTypeId,
        title: formData.title || '',
        brand: formData.brand || '',
        model: formData.version || '', // version -> model
        year: formData.year ? parseInt(formData.year) : null,
        mileage: formData.mileage || '', // ✅ STRING theo API spec mới
        condition: formData.condition === 'used' ? 'Đã qua sử dụng' : 'Mới',
        style: formData.bodyType || '', // bodyType -> style
        color: formData.color || '',
        seat: formData.seats || '', // ✅ STRING theo API spec mới
        licensePlate: formData.licensePlate || '',
        origin: formData.origin || '',
        fuel: formData.fuelType === 'gasoline' ? 'Xăng' : 
              formData.fuelType === 'diesel' ? 'Dầu' : 
              formData.fuelType === 'electric' ? 'Điện' : 
              formData.fuelType === 'hybrid' ? 'Động cơ Hybrid' : '',
        gearbox: formData.transmission === 'automatic' ? 'Số tự động' : 'Số sàn',
        ownerCount: (() => {
          // ✅ Map "Chủ đầu tiên" → "1", "2 chủ" → "2", "4 chủ trở lên" → "4"
          if (!formData.previousOwners) return '';
          if (formData.previousOwners.includes('Chủ đầu')) return '1';
          const match = formData.previousOwners.match(/\d+/);
          return match ? String(match[0]) : '';
        })(), // ✅ STRING
        accessories: formData.hasAccessories === 'yes' ? true : formData.hasAccessories === 'no' ? false : null, // ✅ BOOLEAN
        inspectionValidUntil: formData.hasValidInspection === 'yes' ? true : formData.hasValidInspection === 'no' ? false : null, // ✅ BOOLEAN
        youAre: formData.sellerType === 'individual' ? 'Cá nhân' : formData.sellerType === 'professional' ? 'Bán chuyên' : '', // ✅ STRING
        detail: formData.description || '',
        address: formData.address || '',
        listingType: 0, // 0 = Draft (bản nháp) - REQUIRED
      };
      
      // ✅ Thêm FeeId nếu có gói đăng tin (ưu tiên selectedPackage)
      const packageToUseForDraft = selectedPackage || activePackage;
      if (packageToUseForDraft && packageToUseForDraft.feeId) {
        listingData.feeId = packageToUseForDraft.feeId;
        console.log('💾 Lưu nháp với gói đăng tin:', packageToUseForDraft.feeName);
      }
      
      // ✅ Tự động truyền 0 nếu để trống giá bán - ĐẢM BẢO LÀ NUMBER
      // Remove dots before parsing
      const numericPriceDraft = formData.price ? formData.price.replace(/\./g, '') : '0';
      const draftPriceValue = parseFloat(numericPriceDraft);
      listingData.buyNowPrice = isNaN(draftPriceValue) ? 0 : draftPriceValue;
      
      console.log('Listing Data to send:', listingData);
      
      // 🔍 DEBUG: Check các field đặc biệt
      console.log('🔍 DEBUG DRAFT - Các field đặc biệt GỬI LÊN BACKEND:');
      console.log('   ownerCount:', listingData.ownerCount, typeof listingData.ownerCount);
      console.log('   accessories:', listingData.accessories, typeof listingData.accessories);
      console.log('   inspectionValidUntil:', listingData.inspectionValidUntil, typeof listingData.inspectionValidUntil);
      console.log('   youAre:', listingData.youAre, typeof listingData.youAre);
      
      // 4. Chuẩn bị file images và video
      console.log('=== CHUẨN BỊ ẢNH ĐỂ LƯU NHÁP ===');
      console.log('📊 Tổng số ảnh trong state uploadedImages:', uploadedImages.length);
      console.log('📊 Chi tiết:', uploadedImages.map((img, i) => `${i}: ${img.isExisting ? 'CŨ' : 'MỚI'} - ${img.preview?.substring(0, 50)}...`));
      
      // 4. Prepare files theo logic MỚI của backend
      let response;
      
      // ✅ LOGIC ĐÚNG: Check savedDraft thay vì isEditMode
      if (savedDraft.listingId && savedDraft.itemId) {
        // ===== UPDATE MODE: Đã có draft, cập nhật lại =====
        console.log('🔄 Đang CẬP NHẬT tin nháp (lần 2+)');
        console.log('   ListingId:', savedDraft.listingId);
        console.log('   ItemId:', savedDraft.itemId);
        
        console.log('=== DEBUG: TRẠNG THÁI ẢNH TRƯỚC KHI GỬI ===');
        console.log('📊 Tổng số ảnh trong uploadedImages:', uploadedImages.length);
        uploadedImages.forEach((img, index) => {
          console.log(`   [${index}] ${img.isExisting ? '🔵 ẢNH CŨ' : '🟢 ẢNH MỚI'}: ${img.preview?.substring(0, 80)}...`);
        });
        
        // Extract existing image URLs (ảnh cũ cần GIỮ LẠI)
        const existingImageUrls = uploadedImages
          .filter(img => img.isExisting && img.preview)
          .map(img => img.preview);
        
        // Extract new image files (ảnh mới cần THÊM VÀO)
        const newImageFiles = uploadedImages
          .filter(img => !img.isExisting && img.file)
          .map(img => img.file);
        
        // Video: Lấy URL nếu giữ lại, hoặc file nếu mới
        const existingVideoUrl = uploadedVideos.length > 0 && uploadedVideos[0].isExisting 
          ? uploadedVideos[0].preview 
          : null;
        const newVideoFile = uploadedVideos.length > 0 && !uploadedVideos[0].isExisting 
          ? uploadedVideos[0].file 
          : null;
        
        console.log('=== ✅ SẼ GỬI CHO BACKEND ===');
        console.log(`📸 existingImageUrls (${existingImageUrls.length} URLs):`);
        existingImageUrls.forEach((url, i) => {
          console.log(`   [${i}] ${url.substring(0, 100)}...`);
        });
        console.log(`📸 newImageFiles (${newImageFiles.length} Files):`);
        newImageFiles.forEach((file, i) => {
          console.log(`   [${i}] ${file.name} (${file.size} bytes)`);
        });
        console.log(`🎬 existingVideoUrl: ${existingVideoUrl ? existingVideoUrl.substring(0, 100) + '...' : 'null'}`);
        console.log(`🎬 newVideoFile: ${newVideoFile ? newVideoFile.name : 'null'}`);
        console.log('================================');
        
        response = await itemService.updateListingWithItem(
          savedDraft.listingId,
          savedDraft.itemId,
          listingData,
          existingImageUrls,  // URLs ảnh cũ
          newImageFiles,      // Files ảnh mới
          existingVideoUrl,   // URL video cũ
          newVideoFile,       // File video mới
          (progress) => setUploadProgress(progress)
        );
        
        setShowUploadModal(false);
        
        setSuccessMessage({
          title: "Cập nhật nháp thành công!",
          message: "Bản nháp đã được cập nhật. Bạn có thể tiếp tục chỉnh sửa tại trang quản lý tin."
        });
      } else {
        // ===== CREATE MODE: Lần đầu lưu nháp =====
        console.log('📝 Đang TẠO MỚI tin nháp (lần đầu)');
        
        const imageFiles = uploadedImages
          .filter(img => img.file && !img.isExisting)
          .map(img => img.file);
        const videoFile = uploadedVideos.length > 0 && !uploadedVideos[0].isExisting 
          ? uploadedVideos[0].file 
          : null;
        
        console.log(`📸 Thêm ${imageFiles.length} ảnh mới`);
        
        response = await itemService.createListingWithItem(
          listingData,
          imageFiles,
          videoFile,
          (progress) => setUploadProgress(progress)
        );
        
        setShowUploadModal(false);
        
        // ✅ LƯU listingId & itemId sau khi tạo thành công
        const responseData = response?.data?.data || response?.data;
        const newListingId = responseData?.listingId;
        const newItemId = responseData?.item?.itemId;
        
        if (newListingId && newItemId) {
          setSavedDraft({
            listingId: newListingId,
            itemId: newItemId
          });
          console.log('✅ Đã lưu draft IDs:', { listingId: newListingId, itemId: newItemId });
        }
        
        setSuccessMessage({
          title: "Lưu nháp thành công!",
          message: "Bản nháp đã được lưu. Bạn có thể tiếp tục chỉnh sửa tại trang quản lý tin."
        });
      }
      
      console.log('Draft saved successfully:', response);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving draft:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      // Hiển thị chi tiết validation errors
      if (error.response?.data?.errors) {
        console.error('=== VALIDATION ERRORS ===');
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          console.error(`Field "${key}":`, errors[key]);
        });
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data?.title || error.message || 'Có lỗi xảy ra';
      setShowUploadModal(false);
      alert(`Có lỗi xảy ra khi lưu nháp: ${errorMessage}`);
    } finally {
      setIsSavingDraft(false);
    }
  };

  return (
    <>
      {/* Image Upload Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-xl shadow-md p-5 border-2 w-full min-w-0 mb-4 transition-colors duration-500 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-[#00c9a7]/20'
        }`}
      >
        <h2 className={`text-base font-bold mb-3 flex items-center gap-2 transition-colors duration-500 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <FiCamera className="text-[#00c9a7]" />
          Hình ảnh sản phẩm
        </h2>
        <p className={`text-xs mb-3 transition-colors duration-500 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Đăng từ 01 đến 20 hình{" "}
          <span className="text-[#00c9a7] font-semibold">
            (tối thiểu 240 x 240)
          </span>
        </p>

        {/* Upload Area */}
        <div
          onDragOver={handleImageDragOver}
          onDragLeave={handleImageDragLeave}
          onDrop={handleImageDrop}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${
            validationErrors.images
              ? "border-red-500 bg-red-50"
              : isDraggingImage
              ? "border-[#00c9a7] bg-[#00c9a7]/5"
              : isDarkMode
              ? "border-gray-600 hover:border-[#00c9a7] hover:bg-gray-700/30"
              : "border-gray-300 hover:border-[#00c9a7] hover:bg-gray-50"
          }`}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-[#00c9a7]/10 rounded-full flex items-center justify-center mb-3">
              <FiCamera className="text-3xl text-[#00c9a7]" />
            </div>
            <p className={`text-sm font-semibold mb-1 transition-colors duration-500 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Nhấp để tải ảnh lên
            </p>
            <p className={`text-xs transition-colors duration-500 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Hình có kích thước tối thiểu 240x240 ({uploadedImages.length}/20)
            </p>
          </label>
        </div>

        {/* Error Message */}
        {validationErrors.images && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span>
            <span>{validationErrors.images}</span>
          </p>
        )}

        {/* Uploaded Images Preview */}
        {uploadedImages.length > 0 && (
          <div className="mt-4 grid grid-cols-4 gap-3">
            {uploadedImages.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group aspect-square"
              >
                <img
                  src={img.preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <FiX />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Video Upload Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`rounded-xl shadow-md p-5 border-2 w-full min-w-0 mb-4 transition-colors duration-500 ${
          isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200'
        }`}
      >
        <h2 className={`text-base font-bold mb-3 flex items-center gap-2 transition-colors duration-500 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <FiVideo className="text-orange-500" />
          Đăng video để bán nhanh hơn
        </h2>
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2 py-1 rounded-full font-semibold transition-colors duration-500 ${
            isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-600'
          }`}>
            🔥 Lượt xem tăng gấp x2
          </span>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleVideoDragOver}
          onDragLeave={handleVideoDragLeave}
          onDrop={handleVideoDrop}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${
            isDraggingVideo
              ? "border-orange-500 bg-orange-50"
              : isDarkMode
              ? "bg-gray-800 border-orange-600 hover:border-orange-500 hover:bg-orange-900/20"
              : "bg-white border-orange-300 hover:border-orange-500 hover:bg-orange-50/50"
          }`}
        >
          <input
            type="file"
            multiple
            accept="video/*"
            onChange={handleVideoUpload}
            className="hidden"
            id="video-upload"
          />
          <label
            htmlFor="video-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors duration-500 ${
              isDarkMode ? 'bg-orange-900/30' : 'bg-orange-100'
            }`}>
              <FiVideo className="text-3xl text-orange-500" />
            </div>
            <p className={`text-sm font-semibold mb-1 transition-colors duration-500 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Nhấp để tải video lên
            </p>
            <p className={`text-xs transition-colors duration-500 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Tối đa 3 video ({uploadedVideos.length}/3)
            </p>
          </label>
        </div>

        {/* Uploaded Videos Preview */}
        {uploadedVideos.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {uploadedVideos.map((video, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    src={video.preview}
                    className="w-full h-full object-cover"
                    controls
                    onError={(e) => {
                      console.error('❌ Video load error:', video.preview);
                      console.error('Error details:', e);
                    }}
                    onLoadedData={() => {
                      console.log('✓ Video loaded successfully:', video.preview);
                    }}
                  >
                    <source src={video.preview} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <FiVideo size={12} />
                    {video.isExisting ? 'Video đã lưu' : 'Video'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeVideo(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                >
                  <FiX />
                </button>
                <p className={`text-xs mt-1 truncate transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>{video.name}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`rounded-xl shadow-md p-5 border-2 w-full min-w-0 transition-colors duration-500 ${
          isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-[#00c9a7]/20'
        }`}
      >
        <h3 className={`text-base font-bold mb-4 transition-colors duration-500 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Thông tin chi tiết</h3>
        
        <form id="car-post-form" onSubmit={handleSubmit} noValidate className="space-y-4 w-full min-w-0">
        {/* Tình trạng */}
        <div>
          <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Tình trạng <span className="text-red-500">*</span>
          </label>
          <div className={`flex gap-3 p-3 border-2 rounded-lg ${
            validationErrors.condition
              ? "border-red-500 bg-red-50"
              : "border-transparent"
          }`}>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, condition: "used" }));
                clearFieldError('condition');
              }}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                formData.condition === "used"
                  ? "bg-[#00c9a7]/10 border-[#00c9a7] text-[#00c9a7] font-semibold"
                  : isDarkMode 
                  ? "border-gray-600 text-gray-300 hover:border-gray-500" 
                  : "border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              Đã sử dụng
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, condition: "new" }));
                clearFieldError('condition');
              }}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                formData.condition === "new"
                  ? "bg-[#00c9a7]/10 border-[#00c9a7] text-[#00c9a7] font-semibold"
                  : isDarkMode 
                  ? "border-gray-600 text-gray-300 hover:border-gray-500" 
                  : "border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              Mới
            </button>
          </div>
          {validationErrors.condition && (
            <p className="mt-1 text-xs text-red-600">⚠️ {validationErrors.condition}</p>
          )}
        </div>

        {/* Hãng xe & Năm sản xuất */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative" ref={brandDropdownRef}>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
              Hãng xe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={showBrandDropdown ? brandSearchTerm : formData.brand}
                onChange={(e) => setBrandSearchTerm(e.target.value)}
                onFocus={() => setShowBrandDropdown(true)}
                placeholder={formData.brand || "Hãng xe *"}
                className={`w-full px-3 py-2 pr-8 border-2 rounded-lg focus:outline-none transition-colors text-sm ${
                  isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                } ${
                  validationErrors.brand
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-[#00c9a7]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
              }`}
              >
                {showBrandDropdown ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>
            
            {showBrandDropdown && (
              <div className={`absolute z-10 w-full mt-1 border-2 rounded-lg shadow-lg max-h-60 overflow-y-auto transition-colors duration-500 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-600'
                  : 'bg-white border-gray-300'
              }`}>
                {filteredBrands.length > 0 ? (
                  filteredBrands.map((brand, index) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => handleBrandSelect(brand)}
                      className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                        isDarkMode 
                          ? 'text-white hover:bg-gray-600' 
                          : 'text-gray-900 hover:bg-gray-100'
                      } ${
                        index % 2 === 0 
                          ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-50')
                          : (isDarkMode ? 'bg-gray-800' : 'bg-white')
                      } ${formData.brand === brand ? 'bg-[#00c9a7]/10 font-semibold' : ''}`}
                    >
                      {brand}
                    </button>
                  ))
                ) : (
                  <div className={`px-3 py-2 text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Không tìm thấy hãng xe
                  </div>
                )}
              </div>
            )}
            {validationErrors.brand && (
              <p className="mt-1 text-xs text-red-600">⚠️ {validationErrors.brand}</p>
            )}
          </div>

          <div className="relative" ref={yearDropdownRef}>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
              Năm sản xuất <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={showYearDropdown ? yearSearchTerm : formData.year}
                onChange={(e) => setYearSearchTerm(e.target.value)}
                onFocus={() => setShowYearDropdown(true)}
                placeholder={formData.year || "Năm sản xuất *"}
                className={`w-full px-3 py-2 pr-8 border-2 rounded-lg focus:outline-none transition-colors text-sm ${
                  isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                } ${
                  validationErrors.year
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-[#00c9a7]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowYearDropdown(!showYearDropdown)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
              }`}
              >
                {showYearDropdown ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>
            
            {showYearDropdown && (
              <div className={`absolute z-10 w-full mt-1 border-2 rounded-lg shadow-lg max-h-60 overflow-y-auto transition-colors duration-500 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-600'
                  : 'bg-white border-gray-300'
              }`}>
                {filteredYears.length > 0 ? (
                  filteredYears.map((year, index) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => handleYearSelect(year)}
                      className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                        isDarkMode 
                          ? 'text-white hover:bg-gray-600' 
                          : 'text-gray-900 hover:bg-gray-100'
                      } ${
                        index % 2 === 0 
                          ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-50')
                          : (isDarkMode ? 'bg-gray-800' : 'bg-white')
                      } ${formData.year === year ? 'bg-[#00c9a7]/10 font-semibold' : ''}`}
                    >
                      {year}
                    </button>
                  ))
                ) : (
                  <div className={`px-3 py-2 text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Không tìm thấy năm
                  </div>
                )}
              </div>
            )}
            {validationErrors.year && (
              <p className="mt-1 text-xs text-red-600">⚠️ {validationErrors.year}</p>
            )}
          </div>
        </div>

        {/* Phiên bản */}
        <div>
          <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Phiên bản <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="version"
            value={formData.version}
            onChange={handleChange}
            placeholder="VD: Fortuner 2.4G AT, VF8 Plus, BMW 530i ..."
            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-colors text-sm ${
              isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
            } ${
              validationErrors.version
                ? "border-red-500 focus:border-red-500"
                : "focus:border-[#00c9a7]"
            }`}
          />
          {validationErrors.version && (
            <p className="mt-1 text-xs text-red-600">⚠️ {validationErrors.version}</p>
          )}
        </div>

        {/* Hộp số */}
        <div>
          <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Hộp số <span className="text-red-500">*</span>
          </label>
          <div className={`flex gap-2 p-3 border-2 rounded-lg ${
            validationErrors.transmission
              ? "border-red-500 bg-red-50"
              : "border-transparent"
          }`}>
            {["automatic", "manual", "semi-automatic"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, transmission: type }));
                  clearFieldError('transmission');
                }}
                className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all text-sm ${
                  formData.transmission === type
                    ? "bg-[#00c9a7]/10 border-[#00c9a7] text-[#00c9a7] font-semibold"
                    : isDarkMode 
                  ? "border-gray-600 text-gray-300 hover:border-gray-500" 
                  : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                {type === "automatic" ? "Tự động" : type === "manual" ? "Số sàn" : "Bán tự động"}
              </button>
            ))}
          </div>
          {validationErrors.transmission && (
            <p className="mt-1 text-xs text-red-600">⚠️ {validationErrors.transmission}</p>
          )}
        </div>

        {/* Nhiên liệu */}
        <div>
          <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Nhiên liệu <span className="text-red-500">*</span>
          </label>
          <div className={`grid grid-cols-2 gap-2 p-3 border-2 rounded-lg ${
            validationErrors.fuelType
              ? "border-red-500 bg-red-50"
              : "border-transparent"
          }`}>
            {[
              { value: "gasoline", label: "Xăng" },
              { value: "diesel", label: "Dầu" },
              { value: "hybrid", label: "Động cơ Hybrid" },
              { value: "electric", label: "Điện" }
            ].map((fuel) => (
              <button
                key={fuel.value}
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, fuelType: fuel.value }));
                  clearFieldError('fuelType');
                }}
                className={`py-2 px-3 rounded-lg border-2 transition-all text-sm ${
                  formData.fuelType === fuel.value
                    ? "bg-[#00c9a7]/10 border-[#00c9a7] text-[#00c9a7] font-semibold"
                    : isDarkMode 
                  ? "border-gray-600 text-gray-300 hover:border-gray-500" 
                  : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                {fuel.label}
              </button>
            ))}
          </div>
          {validationErrors.fuelType && (
            <p className="mt-1 text-xs text-red-600">⚠️ {validationErrors.fuelType}</p>
          )}
        </div>

        {/* Xuất xứ & Kiểu dáng */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative" ref={originDropdownRef}>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
              Xuất xứ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={showOriginDropdown ? originSearchTerm : formData.origin}
                onChange={(e) => setOriginSearchTerm(e.target.value)}
                onFocus={() => setShowOriginDropdown(true)}
                placeholder={formData.origin || "Xuất xứ *"}
                className={`w-full px-3 py-2 pr-8 border-2 rounded-lg focus:outline-none transition-colors text-sm ${
                  isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                } ${
                  validationErrors.origin
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-[#00c9a7]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowOriginDropdown(!showOriginDropdown)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
              }`}
              >
                {showOriginDropdown ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>
            
            {showOriginDropdown && (
              <div className={`absolute z-10 w-full mt-1 border-2 rounded-lg shadow-lg max-h-60 overflow-y-auto transition-colors duration-500 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-600'
                  : 'bg-white border-gray-300'
              }`}>
                {filteredOrigins.length > 0 ? (
                  filteredOrigins.map((origin, index) => (
                    <button
                      key={origin}
                      type="button"
                      onClick={() => handleOriginSelect(origin)}
                      className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                        isDarkMode 
                          ? 'text-white hover:bg-gray-600' 
                          : 'text-gray-900 hover:bg-gray-100'
                      } ${
                        index % 2 === 0 
                          ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-50')
                          : (isDarkMode ? 'bg-gray-800' : 'bg-white')
                      } ${formData.origin === origin ? 'bg-[#00c9a7]/10 font-semibold' : ''}`}
                    >
                      {origin}
                    </button>
                  ))
                ) : (
                  <div className={`px-3 py-2 text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Không tìm thấy xuất xứ
                  </div>
                )}
              </div>
            )}
            {validationErrors.origin && (
              <p className="mt-1 text-xs text-red-600">⚠️ {validationErrors.origin}</p>
            )}
          </div>

          <div className="relative" ref={bodyTypeDropdownRef}>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
              Kiểu dáng <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={showBodyTypeDropdown ? bodyTypeSearchTerm : formData.bodyType}
                onChange={(e) => setBodyTypeSearchTerm(e.target.value)}
                onFocus={() => setShowBodyTypeDropdown(true)}
                placeholder={formData.bodyType || "Kiểu dáng *"}
                className={`w-full px-3 py-2 pr-8 border-2 rounded-lg focus:outline-none transition-colors text-sm ${
                  isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                } ${
                  validationErrors.bodyType
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-[#00c9a7]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowBodyTypeDropdown(!showBodyTypeDropdown)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
              }`}
              >
                {showBodyTypeDropdown ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>
            {showBodyTypeDropdown && (
              <div className={`absolute z-10 w-full mt-1 border-2 rounded-lg shadow-lg max-h-60 overflow-y-auto transition-colors duration-500 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-600'
                  : 'bg-white border-gray-300'
              }`}>
                {filteredBodyTypes.length > 0 ? (
                  filteredBodyTypes.map((bodyType, index) => (
                    <button
                      key={bodyType}
                      type="button"
                      onClick={() => handleBodyTypeSelect(bodyType)}
                      className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                        isDarkMode 
                          ? 'text-white hover:bg-gray-600' 
                          : 'text-gray-900 hover:bg-gray-100'
                      } ${
                        index % 2 === 0 
                          ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-50')
                          : (isDarkMode ? 'bg-gray-800' : 'bg-white')
                      } ${formData.bodyType === bodyType ? 'bg-[#00c9a7]/10 font-semibold' : ''}`}
                    >
                      {bodyType}
                    </button>
                  ))
                ) : (
                  <div className={`px-3 py-2 text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Không tìm thấy kiểu dáng
                  </div>
                )}
              </div>
            )}
            {validationErrors.bodyType && (
              <p className="mt-1 text-xs text-red-600">⚠️ {validationErrors.bodyType}</p>
            )}
          </div>
        </div>

        {/* Số chỗ & Màu sắc */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative" ref={seatsDropdownRef}>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
              Số chỗ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={showSeatsDropdown ? seatsSearchTerm : formData.seats}
                onChange={(e) => setSeatsSearchTerm(e.target.value)}
                onFocus={() => setShowSeatsDropdown(true)}
                placeholder={formData.seats || "Số chỗ *"}
                className={`w-full px-3 py-2 pr-8 border-2 rounded-lg focus:outline-none transition-colors text-sm ${
                  isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                } ${
                  validationErrors.seats
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-[#00c9a7]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowSeatsDropdown(!showSeatsDropdown)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
              }`}
              >
                {showSeatsDropdown ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>
            {showSeatsDropdown && (
              <div className={`absolute z-10 w-full mt-1 border-2 rounded-lg shadow-lg max-h-60 overflow-y-auto transition-colors duration-500 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-600'
                  : 'bg-white border-gray-300'
              }`}>
                {filteredSeats.length > 0 ? (
                  filteredSeats.map((seats, index) => (
                    <button
                      key={seats}
                      type="button"
                      onClick={() => handleSeatsSelect(seats)}
                      className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                        isDarkMode 
                          ? 'text-white hover:bg-gray-600' 
                          : 'text-gray-900 hover:bg-gray-100'
                      } ${
                        index % 2 === 0 
                          ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-50')
                          : (isDarkMode ? 'bg-gray-800' : 'bg-white')
                      } ${formData.seats === seats ? 'bg-[#00c9a7]/10 font-semibold' : ''}`}
                    >
                      {seats}
                    </button>
                  ))
                ) : (
                  <div className={`px-3 py-2 text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Không tìm thấy số chỗ
                  </div>
                )}
              </div>
            )}
            {validationErrors.seats && (
              <p className="mt-1 text-xs text-red-600">⚠️ {validationErrors.seats}</p>
            )}
          </div>

          <div className="relative" ref={colorDropdownRef}>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
              Màu sắc <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={showColorDropdown ? colorSearchTerm : formData.color}
                onChange={(e) => setColorSearchTerm(e.target.value)}
                onFocus={() => setShowColorDropdown(true)}
                placeholder={formData.color || "Màu sắc *"}
                className={`w-full px-3 py-2 pr-8 border-2 rounded-lg focus:outline-none transition-colors text-sm ${
                  isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                } ${
                  validationErrors.color
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-[#00c9a7]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowColorDropdown(!showColorDropdown)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
              }`}
              >
                {showColorDropdown ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>
            {showColorDropdown && (
              <div className={`absolute z-10 w-full mt-1 border-2 rounded-lg shadow-lg max-h-60 overflow-y-auto transition-colors duration-500 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-600'
                  : 'bg-white border-gray-300'
              }`}>
                {filteredColors.length > 0 ? (
                  filteredColors.map((color, index) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorSelect(color)}
                      className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                        isDarkMode 
                          ? 'text-white hover:bg-gray-600' 
                          : 'text-gray-900 hover:bg-gray-100'
                      } ${
                        index % 2 === 0 
                          ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-50')
                          : (isDarkMode ? 'bg-gray-800' : 'bg-white')
                      } ${formData.color === color ? 'bg-[#00c9a7]/10 font-semibold' : ''}`}
                    >
                      {color}
                    </button>
                  ))
                ) : (
                  <div className={`px-3 py-2 text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Không tìm thấy màu sắc
                  </div>
                )}
              </div>
            )}
            {validationErrors.color && (
              <p className="mt-1 text-xs text-red-600">⚠️ {validationErrors.color}</p>
            )}
          </div>
        </div>

        {/* Biển số xe & Số đời chủ */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
              Biển số xe <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleChange}
              placeholder="VD: 51A-12345"
              className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-colors text-sm ${
                isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
              } ${
                validationErrors.licensePlate
                  ? "border-red-500 focus:border-red-500"
                  : "focus:border-[#00c9a7]"
              }`}
            />
            {validationErrors.licensePlate && (
              <p className="mt-1 text-xs text-red-600">⚠️ {validationErrors.licensePlate}</p>
            )}
          </div>

          <div className="relative" ref={ownersDropdownRef}>
            <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
              Số đời chủ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={showOwnersDropdown ? ownersSearchTerm : formData.previousOwners}
                onChange={(e) => setOwnersSearchTerm(e.target.value)}
                onFocus={() => setShowOwnersDropdown(true)}
                placeholder={formData.previousOwners || "Số đời chủ *"}
                className={`w-full px-3 py-2 pr-8 border-2 rounded-lg focus:outline-none transition-colors text-sm ${
                  isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                } ${
                  validationErrors.previousOwners
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-[#00c9a7]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowOwnersDropdown(!showOwnersDropdown)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
              }`}
              >
                {showOwnersDropdown ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>
            {showOwnersDropdown && (
              <div className={`absolute z-10 w-full mt-1 border-2 rounded-lg shadow-lg max-h-60 overflow-y-auto transition-colors duration-500 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-600'
                  : 'bg-white border-gray-300'
              }`}>
                {filteredOwners.length > 0 ? (
                  filteredOwners.map((owner, index) => (
                    <button
                      key={owner}
                      type="button"
                      onClick={() => handleOwnersSelect(owner)}
                      className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                        isDarkMode 
                          ? 'text-white hover:bg-gray-600' 
                          : 'text-gray-900 hover:bg-gray-100'
                      } ${
                        index % 2 === 0 
                          ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-50')
                          : (isDarkMode ? 'bg-gray-800' : 'bg-white')
                      } ${formData.previousOwners === owner ? 'bg-[#00c9a7]/10 font-semibold' : ''}`}
                    >
                      {owner}
                    </button>
                  ))
                ) : (
                  <div className={`px-3 py-2 text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Không tìm thấy
                  </div>
                )}
              </div>
            )}
            {validationErrors.previousOwners && (
              <p className="mt-1 text-xs text-red-600">⚠️ {validationErrors.previousOwners}</p>
            )}
          </div>
        </div>

        {/* Có phụ kiện đi kèm */}
        <div>
          <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Có phụ kiện đi kèm <span className="text-red-500">*</span>
          </label>
          <div className={`flex gap-3 p-3 border-2 rounded-lg ${
            validationErrors.hasAccessories
              ? "border-red-500 bg-red-50"
              : "border-transparent"
          }`}>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, hasAccessories: "yes" }));
                clearFieldError('hasAccessories');
              }}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                formData.hasAccessories === "yes"
                  ? "bg-[#00c9a7]/10 border-[#00c9a7] text-[#00c9a7] font-semibold"
                  : isDarkMode 
                  ? "border-gray-600 text-gray-300 hover:border-gray-500" 
                  : "border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              Có
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, hasAccessories: "no" }));
                clearFieldError('hasAccessories');
              }}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                formData.hasAccessories === "no"
                  ? "bg-[#00c9a7]/10 border-[#00c9a7] text-[#00c9a7] font-semibold"
                  : isDarkMode 
                  ? "border-gray-600 text-gray-300 hover:border-gray-500" 
                  : "border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              Không
            </button>
          </div>
          {validationErrors.hasAccessories && (
            <p className="mt-1 text-xs text-red-600">⚠️ {validationErrors.hasAccessories}</p>
          )}
        </div>

        {/* Còn hạn đăng kiểm */}
        <div>
          <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Còn hạn đăng kiểm <span className="text-red-500">*</span>
          </label>
          <div className={`flex gap-3 p-3 border-2 rounded-lg ${
            validationErrors.hasValidInspection
              ? "border-red-500 bg-red-50"
              : "border-transparent"
          }`}>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, hasValidInspection: "yes" }));
                clearFieldError('hasValidInspection');
              }}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                formData.hasValidInspection === "yes"
                  ? "bg-[#00c9a7]/10 border-[#00c9a7] text-[#00c9a7] font-semibold"
                  : isDarkMode 
                  ? "border-gray-600 text-gray-300 hover:border-gray-500" 
                  : "border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              Có
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, hasValidInspection: "no" }));
                clearFieldError('hasValidInspection');
              }}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                formData.hasValidInspection === "no"
                  ? "bg-[#00c9a7]/10 border-[#00c9a7] text-[#00c9a7] font-semibold"
                  : isDarkMode 
                  ? "border-gray-600 text-gray-300 hover:border-gray-500" 
                  : "border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              Không
            </button>
          </div>
          {validationErrors.hasValidInspection && (
            <p className="mt-1 text-xs text-red-600">⚠️ {validationErrors.hasValidInspection}</p>
          )}
        </div>

        {/* Số Km đã đi */}
        <div>
          <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Số Km đã đi <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            placeholder="VD: 50000"
            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-colors text-sm ${
              isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
            } ${
              validationErrors.mileage
                ? "border-red-500 focus:border-red-500"
                : "focus:border-[#00c9a7]"
            }`}
          />
          {validationErrors.mileage && (
            <p className="mt-1 text-xs text-red-600">⚠️ {validationErrors.mileage}</p>
          )}
        </div>

        {/* Giá bán */}
        <div>
          <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Giá bán (VNĐ) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            name="price"
            value={formData.price}
            onChange={handleChange}
            onPaste={(e) => {
              e.preventDefault();
              const pastedText = e.clipboardData.getData('text');
              const numericValue = pastedText.replace(/[^0-9]/g, '');
              if (numericValue) {
                const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                setFormData(prev => ({ ...prev, price: formattedValue }));
              }
            }}
            placeholder="VD: 500.000.000"
            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-colors text-sm ${
              isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
            } ${
              validationErrors.price
                ? "border-red-500 focus:border-red-500"
                : "focus:border-[#00c9a7]"
            }`}
          />
          {validationErrors.price && (
            <p className="mt-1 text-xs text-red-600">⚠️ {validationErrors.price}</p>
          )}
        </div>

        <div className={`border-t-2 pt-4 transition-colors duration-500 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h3 className={`text-base font-bold mb-3 transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Tiêu đề tin đăng và Mô tả chi tiết</h3>
        </div>

        {/* Tiêu đề tin đăng */}
        <div className="w-full min-w-0">
          <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Tiêu đề tin đăng <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            onFocus={() => setShowTitleSuggestion(true)}
            placeholder="VD: Toyota Vios 2020 tự động"
            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-colors text-sm ${
              isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
            } ${
              validationErrors.title
                ? "border-red-500 focus:border-red-500"
                : "focus:border-[#00c9a7]"
            }`}
          />
          {validationErrors.title ? (
            <p className="text-xs text-red-600 mt-1">⚠️ {validationErrors.title}</p>
          ) : (
            <p className={`text-xs mt-1 transition-colors duration-500 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {titleCount > 0 ? `${titleCount}/50 kí tự` : '0/50 kí tự'}
            </p>
          )}
          
           {showTitleSuggestion && (
             <motion.div
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className={`mt-2 p-3 border rounded-lg w-full transition-colors duration-500 ${
                 isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
               }`}
             >
               <div className="space-y-2">
                 <h4 className={`text-sm font-semibold transition-colors duration-500 ${
                   isDarkMode ? 'text-blue-400' : 'text-blue-600'
                 }`}>Tiêu đề tốt nên có:</h4>
                 <ul className={`text-xs space-y-1 list-disc list-inside transition-colors duration-500 ${
                   isDarkMode ? 'text-gray-300' : 'text-gray-700'
                 }`}>
                   <li>Loại xe</li>
                   <li>Thương hiệu + Model</li>
                   <li>Năm đăng ký</li>
                   <li>Màu sắc + Tình trạng</li>
                   <li>Kích thước/Trọng lượng</li>
                 </ul>
                 <div className={`border-t pt-2 mt-2 transition-colors duration-500 ${
                   isDarkMode ? 'border-blue-700' : 'border-blue-200'
                 }`}>
                   <p className={`text-xs transition-colors duration-500 ${
                     isDarkMode ? 'text-gray-300' : 'text-gray-600'
                   }`}>
                     <span className="font-medium">Ví dụ:</span>
                   </p>
                   <p className={`text-xs mt-1 transition-colors duration-500 ${
                     isDarkMode ? 'text-gray-300' : 'text-gray-600'
                   }`}>
                     Toyota Camry 2.5Q 2020 đen đã lăn bánh 6 tháng
                   </p>
                 </div>
               </div>
             </motion.div>
           )}
        </div>

        {/* Mô tả chi tiết */}
        <div className="w-full min-w-0">
          <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Mô tả chi tiết <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            onFocus={() => setShowDescSuggestion(true)}
            rows={4}
            placeholder="Mô tả chi tiết về xe..."
            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-colors resize-none text-sm ${
              isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
            } ${
              validationErrors.description
                ? "border-red-500 focus:border-red-500"
                : "focus:border-[#00c9a7]"
            }`}
          />
          {validationErrors.description ? (
            <p className="text-xs text-red-600 mt-1">⚠️ {validationErrors.description}</p>
          ) : (
            <p className={`text-xs mt-1 transition-colors duration-500 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {descCount > 0 ? `${descCount}/1500 kí tự` : '0/1500 kí tự'}
            </p>
          )}
          
          {showDescSuggestion && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-2 p-3 border rounded-lg w-full transition-colors duration-500 ${
                isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
              }`}
            >
              {/* Mô tả chi tiết section */}
              <div>
                <h4 className={`text-sm font-semibold mb-2 transition-colors duration-500 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>Mô tả chi tiết</h4>
                <ul className={`text-xs space-y-1 list-disc list-inside transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <li>Xuất xứ, tình trạng chiếc xe</li>
                  <li>Chính sách bảo hành, bảo trì, đỗi trả xe</li>
                  <li>Địa chỉ giao nhận, đổi trả xe</li>
                  <li>Thời gian sử dụng xe</li>
                  <li>Bảo trì xe: bao lâu/ lần, tại hãng hay không?</li>
                  <li>Tình trạng giấy tờ</li>
                </ul>
              </div>
              
              {/* Không cho phép section */}
              <div className={`border-t pt-2 mt-2 transition-colors duration-500 ${
                isDarkMode ? 'border-red-700' : 'border-blue-200'
              }`}>
                <h4 className={`text-sm font-semibold mb-2 transition-colors duration-500 ${
                  isDarkMode ? 'text-red-400' : 'text-red-600'
                }`}>Không cho phép:</h4>
                <ul className={`text-xs space-y-1 list-disc list-inside transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <li>Sản phẩm cấm, hạn chế hoặc giả/nhái.</li>
                  <li>Thông tin trùng lặp với tin đăng cũ.</li>
                  <li>Chứa số điện thoại và website, các từ "nhất", "duy nhất", "tốt nhất", "số một", ...</li>
                </ul>
              </div>
            </motion.div>
          )}
        </div>

        <div className={`border-t-2 pt-4 transition-colors duration-500 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h3 className={`text-base font-bold mb-3 transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Thông tin người bán</h3>
        </div>

        {/* Bạn là */}
        <div>
          <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Bạn là <span className="text-red-500">*</span>
          </label>
          <div className={`flex gap-3 p-3 border-2 rounded-lg ${
            validationErrors.sellerType
              ? "border-red-500 bg-red-50"
              : "border-transparent"
          }`}>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, sellerType: "individual" }));
                clearFieldError('sellerType');
              }}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                formData.sellerType === "individual"
                  ? "bg-[#00c9a7]/10 border-[#00c9a7] text-[#00c9a7] font-semibold"
                  : isDarkMode 
                  ? "border-gray-600 text-gray-300 hover:border-gray-500" 
                  : "border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              Cá nhân
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, sellerType: "professional" }));
                clearFieldError('sellerType');
              }}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                formData.sellerType === "professional"
                  ? "bg-[#00c9a7]/10 border-[#00c9a7] text-[#00c9a7] font-semibold"
                  : isDarkMode 
                  ? "border-gray-600 text-gray-300 hover:border-gray-500" 
                  : "border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              Bán chuyên
            </button>
          </div>
          {validationErrors.sellerType && (
            <p className="mt-1 text-xs text-red-600">⚠️ {validationErrors.sellerType}</p>
          )}
        </div>

        {/* Địa chỉ */}
        <div>
          <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Địa chỉ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="VD: Quận 1, TP HCM"
            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-colors text-sm ${
              isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
            } ${
              validationErrors.address
                ? "border-red-500 focus:border-red-500"
                : "focus:border-[#00c9a7]"
            }`}
          />
          {validationErrors.address && (
            <p className="mt-1 text-xs text-red-600">⚠️ {validationErrors.address}</p>
          )}
        </div>

      </form>
      </motion.div>

      {/* Fixed Bottom Action Bar */}
      <PostSnackbar 
        formId="car-post-form"
        isSubmitting={isSubmitting}
        isSavingDraft={isSavingDraft}
        onSaveDraft={handleSaveDraft}
        buttonText="Đăng tin ngay"
        draftButtonText="Lưu nháp"
        showDraftButton={true}
        activePackage={activePackage}
        onPackageChange={handlePackageChange}
      />
      
      {/* Spacer for fixed bottom bar */}
      <div className="h-20"></div>

      {/* Success Modal */}
      {/* Upload Progress Modal */}
      <UploadProgressModal
        isOpen={showUploadModal}
        progress={uploadProgress}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successMessage.title}
        message={successMessage.message}
        autoRedirect={true}
        redirectUrl="/my-ads"
        redirectDelay={3000}
      />

      {/* Plans Modal */}
      <PlansModal
        isOpen={showPlansModal}
        onClose={() => setShowPlansModal(false)}
      />

      {/* Phone Update Modal */}
      <PhoneUpdateModal
        isOpen={showPhoneUpdateModal}
        onClose={() => setShowPhoneUpdateModal(false)}
        onSuccess={() => {
          console.log('✅ Phone updated successfully, user can continue posting');
          setShowPhoneUpdateModal(false);
          // The next submit will pass the phone check
        }}
      />
    </>
  );
};

export default CarPost;
