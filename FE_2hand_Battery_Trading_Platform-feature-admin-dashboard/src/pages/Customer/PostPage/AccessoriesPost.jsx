import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FiCamera, FiVideo, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";
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
  hasErrors,
  createClearError,
} from "../../../services/listings/formValidation";
import {
  autoFillFormData,
  autoFillMedia,
  clearDraftMetadata,
} from "../../../services/listings/formAutoFill";

const ACCESSORY_CATEGORIES = [
  "Phụ tùng xe máy",
  "Phụ tùng ô tô",
  "Phụ tùng xe đạp",
  "Phụ tùng xe điện",
  "Phụ tùng xe tải/xe ben",
  "Phụ tùng khác"
];

const ORIGINS = ["Việt Nam", "Ấn Độ", "Hàn Quốc", "Thái Lan", "Nhật Bản", "Trung Quốc"];

const AccessoriesPost = ({ images, itemTypeId, draftData, isEditMode}) => {
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
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", message: "" });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [titleLength, setTitleLength] = useState(0);
  const [descriptionLength, setDescriptionLength] = useState(0);
  
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [originSearchTerm, setOriginSearchTerm] = useState("");
  const [showTitleSuggestion, setShowTitleSuggestion] = useState(false);
  const [showDescSuggestion, setShowDescSuggestion] = useState(false);
  
  const categoryDropdownRef = useRef(null);
  const originDropdownRef = useRef(null);

  const filteredCategories = ACCESSORY_CATEGORIES.filter((cat) =>
    cat.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  const filteredOrigins = ORIGINS.filter((origin) =>
    origin.toLowerCase().includes(originSearchTerm.toLowerCase())
  );

  // ✅ Create clearError helper
  const clearFieldError = createClearError(setValidationErrors);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
      if (originDropdownRef.current && !originDropdownRef.current.contains(event.target)) {
        setShowOriginDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategorySelect = (category) => {
    setFormData((prev) => ({ ...prev, category }));
    setCategorySearchTerm("");
    setShowCategoryDropdown(false);
    clearFieldError('category');
  };

  const handleOriginSelect = (origin) => {
    setFormData((prev) => ({ ...prev, origin }));
    setOriginSearchTerm("");
    setShowOriginDropdown(false);
    clearFieldError('origin');
  };
  
  const [formData, setFormData] = useState({
    condition: "used",
    category: "",
    origin: "",
    price: "",
    title: "",
    description: "",
    sellerType: "individual",
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

  // ✅ Auto-fill từ draftData khi edit mode
  useEffect(() => {
    if (isEditMode && draftData) {
      const filledData = autoFillFormData(draftData, 'accessories');
      setFormData((prev) => ({ ...prev, ...filledData }));
      
      const { images, video } = autoFillMedia(draftData);
      if (images.length > 0) setUploadedImages(images);
      if (video) setUploadedVideos([video]);
    }
  }, [isEditMode, draftData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Character limit for title and description
    if (name === "title" && value.length > 50) return;
    if (name === "description" && value.length > 1500) return;
    
    // Format price with dots for display
    let processedValue = value;
    if (name === "price") {
      // Remove all non-numeric characters (allow only digits)
      const numericValue = value.replace(/[^0-9]/g, '');
      // Add dots for thousands separator
      processedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    
    // Clear validation error for this field
    clearFieldError(name);
    
    // Update character counters
    if (name === "title") setTitleLength(processedValue.length);
    if (name === "description") setDescriptionLength(processedValue.length);
  };

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
    clearFieldError('images');
  };

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
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
    setUploadedVideos((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Callback để nhận package được chọn từ PostSnackbar
  const handlePackageChange = (packageInfo) => {
    setSelectedPackage(packageInfo);
    console.log('✅ Package selected in AccessoriesPost:', {
      feeId: packageInfo.feeId,
      feeName: packageInfo.feeName,
      remainingListings: packageInfo.remainingListings
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Sử dụng selectedPackage nếu có, nếu không thì dùng activePackage
    const packageToUse = selectedPackage || activePackage;
    
    // ✅ KIỂM TRA GÓI ĐĂNG TIN - Bắt buộc phải có gói
    if (!packageToUse || !packageToUse.feeId) {
      console.log('⚠️ Không có gói đăng tin active');
      sessionStorage.setItem('postingPath', window.location.pathname);
      setShowPlansModal(true);
      return;
    }
    
    // ✅ KIỂM TRA THỜI HẠN GÓI - Kiểm tra xem gói còn hạn không
    if (packageToUse.expiredAt) {
      const now = new Date();
      const expiredDate = new Date(packageToUse.expiredAt);
      
      if (expiredDate < now) {
        console.log('⚠️ Gói đăng tin đã hết hạn:', packageToUse.expiredAt);
        sessionStorage.setItem('postingPath', window.location.pathname);
        setShowPlansModal(true);
        return;
      }
    }
    
    // ✅ KIỂM TRA SỐ TIN ĐĂNG CÒN LẠI - Phải > 0
    if (packageToUse.remainingListings !== undefined && packageToUse.remainingListings !== null) {
      if (packageToUse.remainingListings <= 0) {
        console.log('⚠️ Đã hết số tin đăng còn lại:', packageToUse.remainingListings);
        sessionStorage.setItem('postingPath', window.location.pathname);
        setShowPlansModal(true);
        return;
      }
    }
    
    // ✅ KIỂM TRA SỐ ĐIỆN THOẠI - Bắt buộc phải có phone
    if (!phoneUpdateService.hasPhoneNumber()) {
      console.log('⚠️ User does not have phone number');
      setShowPhoneUpdateModal(true);
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(0);
    setShowUploadModal(true);
    try {
      // ✅ VALIDATION - 1 dòng thay vì 50+ dòng validation code
      const errors = validateForm(formData, 'accessories', uploadedImages);
      
      if (hasErrors(errors)) {
        setValidationErrors(errors);
        setIsSubmitting(false);
        setShowUploadModal(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      setValidationErrors({});
      
      if (!itemTypeId) throw new Error('Không tìm thấy ItemTypeId cho danh mục này');
      
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      const serialNumber = `ACCESSORY_${formData.category || 'UNKNOWN'}_${randomStr}_${timestamp}`;
      
      const listingData = {
        serialNumber, itemTypeId, title: formData.title, brand: formData.brand || '',
        partType: formData.category || '', // ✅ Map category → partType
        condition: formData.condition === 'used' ? 'Đã qua sử dụng' : 'Mới',
        origin: formData.origin || '', 
        youAre: formData.sellerType === 'individual' ? 'Cá nhân' : formData.sellerType === 'professional' ? 'Bán chuyên' : '', // ✅ Map sellerType → youAre
        detail: formData.description || '', 
        address: formData.address || '', listingType: 0, // BẮT BUỘC lưu Draft trước, sau đó toggle sang Active
      };
      
      // ✅ Thêm FeeId nếu có gói đăng tin (ưu tiên selectedPackage)
      const packageToUseForListing = selectedPackage || activePackage;
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
      
      // Tự động truyền 0 nếu để trống giá bán
      // Remove dots before parsing
      const numericPriceDraft = formData.price ? formData.price.replace(/\./g, '') : '0';
      listingData.buyNowPrice = parseFloat(numericPriceDraft) || 0;
      
      console.log('=== DEBUG ACCESSORIES SUBMIT: TRẠNG THÁI ẢNH ===');
      console.log('📊 Tổng số ảnh trong uploadedImages:', uploadedImages.length);
      uploadedImages.forEach((img, index) => {
        console.log(`   [${index}] ${img.isExisting ? '🔵 ẢNH CŨ' : '🟢 ẢNH MỚI'}: ${img.preview?.substring(0, 80)}...`);
      });
      
      // BƯỚC 1: Lưu tin dạng Draft trước
      let response;
      let listingId;
      
      if (isEditMode && draftData?.item?.itemId) {
        // ===== EDIT MODE: Gửi existing URLs + new files =====
        const existingImageUrls = uploadedImages
          .filter(img => img.isExisting && img.preview)
          .map(img => img.preview);
        
        const newImageFiles = uploadedImages
          .filter(img => !img.isExisting && img.file)
          .map(img => img.file);
        
        const existingVideoUrl = uploadedVideos.length > 0 && uploadedVideos[0].isExisting 
          ? uploadedVideos[0].preview 
          : null;
        const newVideoFile = uploadedVideos.length > 0 && !uploadedVideos[0].isExisting 
          ? uploadedVideos[0].file 
          : null;
        
        console.log(`📸 existingImageUrls (${existingImageUrls.length} URLs):`, existingImageUrls);
        console.log(`📸 newImageFiles (${newImageFiles.length} Files):`, newImageFiles.map(f => f.name));
        
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
        const imageFiles = uploadedImages
          .filter(img => img.file && !img.isExisting)
          .map(img => img.file);
        const videoFile = uploadedVideos.length > 0 && !uploadedVideos[0].isExisting 
          ? uploadedVideos[0].file 
          : null;
        
        response = await itemService.createListingWithItem(
          listingData, 
          imageFiles, 
          videoFile,
          (progress) => setUploadProgress(progress)
        );
        
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
      let refreshedPackage = packageToUseForRefresh;
      try {
        const response = await userPackageService.getUserPackages();
        const packages = response?.data?.packages || response?.data;
        
        if (response?.success && Array.isArray(packages)) {
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
            
            if (selectedPackage) {
              setSelectedPackage(packageInfo);
              refreshedPackage = packageInfo;
            } else {
              setActivePackage(packageInfo);
              refreshedPackage = packageInfo;
            }
          }
        }
      } catch (error) {
        console.error('⚠️ Error refreshing package info:', error);
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
      
      // BƯỚC 2: Toggle status từ Draft → Active (CHỈ khi listing đang ở Draft)
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
      
      setShowUploadModal(false);
      
      setSuccessMessage({ title: "Đăng tin thành công!", message: "Tin của bạn đã được đăng công khai và đang chờ duyệt." });
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
      
      // Clear errors nếu validation pass
      setValidationErrors({});
      
      if (!itemTypeId) throw new Error('Không tìm thấy ItemTypeId cho danh mục này');
      
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      const serialNumber = `ACCESSORY_${formData.category || 'UNKNOWN'}_${randomStr}_${timestamp}`;
      
      const listingData = {
        serialNumber, itemTypeId, title: formData.title || '', brand: formData.brand || '',
        partType: formData.category || '', // ✅ Map category → partType
        condition: formData.condition === 'used' ? 'Đã qua sử dụng' : 'Mới',
        origin: formData.origin || '', 
        youAre: formData.sellerType === 'individual' ? 'Cá nhân' : formData.sellerType === 'professional' ? 'Bán chuyên' : '', // ✅ Map sellerType → youAre
        detail: formData.description || '', 
        address: formData.address || '', listingType: 0,
      };
      
      // ✅ Thêm FeeId nếu có gói đăng tin active (Không bắt buộc khi lưu nháp)
      // ✅ Thêm FeeId nếu có gói đăng tin (ưu tiên selectedPackage)
      const packageToUseForDraft = selectedPackage || activePackage;
      if (packageToUseForDraft && packageToUseForDraft.feeId) {
        listingData.feeId = packageToUseForDraft.feeId;
        console.log('💾 Lưu nháp với gói đăng tin:', packageToUseForDraft.feeName);
      }
      
      // Tự động truyền 0 nếu để trống giá bán
      // Remove dots before parsing
      const numericPriceDraft = formData.price ? formData.price.replace(/\./g, '') : '0';
      listingData.buyNowPrice = parseFloat(numericPriceDraft) || 0;
      
      let response;
      
      // ✅ LOGIC ĐÚNG: Check savedDraft thay vì isEditMode
      if (savedDraft.listingId && savedDraft.itemId) {
        // ===== UPDATE MODE: Đã có draft, cập nhật lại =====
        console.log('🔄 Đang CẬP NHẬT tin nháp (lần 2+)');
        console.log('   ListingId:', savedDraft.listingId);
        console.log('   ItemId:', savedDraft.itemId);
        
        console.log('=== DEBUG ACCESSORIES: TRẠNG THÁI ẢNH ===');
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
        
        // Video
        const existingVideoUrl = uploadedVideos.length > 0 && uploadedVideos[0].isExisting 
          ? uploadedVideos[0].preview 
          : null;
        const newVideoFile = uploadedVideos.length > 0 && !uploadedVideos[0].isExisting 
          ? uploadedVideos[0].file 
          : null;
        
        console.log('=== ✅ ACCESSORIES: SẼ GỬI CHO BACKEND ===');
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
          existingImageUrls,
          newImageFiles,
          existingVideoUrl,
          newVideoFile,
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
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving draft:', error);
      setShowUploadModal(false);
      alert(`Có lỗi xảy ra khi lưu nháp: ${error.response?.data?.message || error.message}`);
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
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-[#00c9a7]/20'
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
            isDraggingImage
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
                  />
                  <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <FiVideo size={12} />
                    Video
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
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-[#00c9a7]/20'
        }`}
      >
        <form id="accessories-post-form" onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Section 1: Thông tin chi tiết */}
          <div>
            <h3 className={`text-base font-bold mb-4 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Thông tin chi tiết</h3>
            
            <div className="space-y-4">
              {/* Tình trạng */}
              <div>
                <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Tình trạng <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, condition: "used" }))}
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
                    onClick={() => setFormData(prev => ({ ...prev, condition: "new" }))}
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
              </div>

              {/* Loại phụ tùng */}
              <div className="relative" ref={categoryDropdownRef}>
                <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Loại phụ tùng <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={showCategoryDropdown ? categorySearchTerm : formData.category}
                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                    onFocus={() => setShowCategoryDropdown(true)}
                    placeholder={formData.category || "Vui lòng chọn loại phụ tùng"}
                    className={`w-full px-3 py-2 pr-8 border-2 rounded-lg focus:outline-none transition-colors text-sm ${
                      isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                    } ${
                      validationErrors.category
                        ? "border-red-500 focus:border-red-500"
                        : isDarkMode ? "focus:border-[#00c9a7]" : "focus:border-[#00c9a7]"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                      isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {showCategoryDropdown ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                </div>
                
                {showCategoryDropdown && (
                  <div className={`absolute z-10 w-full mt-1 border-2 rounded-lg shadow-lg max-h-60 overflow-y-auto transition-colors duration-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}>
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((cat, index) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleCategorySelect(cat)}
                          className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                            isDarkMode
                              ? `${index % 2 === 0 ? 'bg-gray-600' : 'bg-gray-700'} hover:bg-gray-500 text-white`
                              : `${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 text-gray-900`
                          } ${formData.category === cat ? 'bg-[#00c9a7]/20 font-semibold' : ''}`}
                        >
                          {cat}
                        </button>
                      ))
                    ) : (
                      <div className={`px-3 py-2 text-sm transition-colors duration-500 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Không tìm thấy loại phụ tùng
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Xuất xứ */}
              <div className="relative" ref={originDropdownRef}>
                <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Xuất xứ
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={showOriginDropdown ? originSearchTerm : formData.origin}
                    onChange={(e) => setOriginSearchTerm(e.target.value)}
                    onFocus={() => setShowOriginDropdown(true)}
                    placeholder={formData.origin || "Chọn xuất xứ"}
                    className={`w-full px-3 py-2 pr-8 border-2 rounded-lg focus:outline-none transition-colors text-sm ${
                      isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                    } ${
                      validationErrors.origin
                        ? "border-red-500 focus:border-red-500"
                        : isDarkMode ? "focus:border-[#00c9a7]" : "focus:border-[#00c9a7]"
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
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}>
                    {filteredOrigins.length > 0 ? (
                      filteredOrigins.map((origin, index) => (
                        <button
                          key={origin}
                          type="button"
                          onClick={() => handleOriginSelect(origin)}
                          className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                            isDarkMode
                              ? `${index % 2 === 0 ? 'bg-gray-600' : 'bg-gray-700'} hover:bg-gray-500 text-white`
                              : `${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 text-gray-900`
                          } ${formData.origin === origin ? 'bg-[#00c9a7]/20 font-semibold' : ''}`}
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
                  placeholder="VD: 500.000"
                  className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-colors text-sm ${
                    isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                  } ${
                    validationErrors.price
                      ? "border-red-500 focus:border-red-500"
                      : "focus:border-[#00c9a7]"
                  }`}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Tiêu đề tin đăng và Mô tả chi tiết */}
          <div className={`pt-4 border-t-2 transition-colors duration-500 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`text-base font-bold mb-3 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Tiêu đề tin đăng và Mô tả chi tiết</h3>
            
            <div className="space-y-4">
              {/* Tiêu đề tin đăng */}
              <div>
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
                  placeholder="Vui lòng điền tiêu đề"
                  maxLength={50}
                  className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-colors text-sm ${
                    isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                  } ${
                    validationErrors.title
                      ? "border-red-500 focus:border-red-500"
                      : "focus:border-[#00c9a7]"
                  }`}
                  required
                />
                {validationErrors.title ? (
                  <p className="text-xs text-red-600 mt-1">⚠️ {validationErrors.title}</p>
                ) : (
                <p className={`text-xs mt-1 transition-colors duration-500 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {titleLength}/50 kí tự
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
                        <li>Loại phụ tùng xe + Thương hiệu + Mode + Kích thước/Trọng lượng</li>
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
                          Xe tải KIA K250L thung dài 4.5m mua tháng 3/2022
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Mô tả chi tiết */}
              <div>
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
                  maxLength={1500}
                  placeholder="Vui lòng nhập ít nhất 10 từ"
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
                  {descriptionLength}/1500 kí tự
                </p>
                )}
                
                {showDescSuggestion && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-2 p-3 border rounded-lg w-full transition-colors duration-500 ${
                      isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div>
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
            </div>
          </div>

          {/* Section 3: Thông tin người bán */}
          <div className={`pt-4 border-t-2 transition-colors duration-500 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`text-base font-bold mb-3 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Thông tin người bán</h3>
            
            <div className="space-y-4">
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
                  required
                />
              </div>
            </div>
          </div>
        </form>
      </motion.div>

      <PostSnackbar 
        formId="accessories-post-form"
        isSubmitting={isSubmitting}
        isSavingDraft={isSavingDraft}
        onSaveDraft={handleSaveDraft}
        buttonText="Đăng tin ngay"
        draftButtonText="Lưu nháp"
        showDraftButton={true}
        activePackage={activePackage}
        onPackageChange={handlePackageChange}
      />
      
      <div className="h-20"></div>

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

export default AccessoriesPost;

