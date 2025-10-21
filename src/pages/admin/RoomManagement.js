import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Fab,
  Stack,
  Alert,
  Snackbar,
  Avatar,
  Badge,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fade,
  Zoom,
  Divider,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  DialogContentText,
  FormControlLabel,
  Checkbox,
  Rating,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Hotel as HotelIcon,
  Wifi as WifiIcon,
  Tv as TvIcon,
  AcUnit as AcIcon,
  LocalBar as BarIcon,
  Balcony as BalconyIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Image as ImageIcon,
  ThreeSixty as ThreeSixtyIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
  Star as StarIcon,
  People as PeopleIcon,
  SquareFoot as SquareFootIcon,
  Bed as BedIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon,
  NavigateBefore as NavigateBeforeIcon,
  HomeRepairService as CleaningServicesIcon,
  NavigateNext as NavigateNextIcon,
  ZoomIn as ZoomInIcon,
  Fullscreen as FullscreenIcon,
  VideoLibrary as VideoLibraryIcon,
  Pool as PoolIcon,
  Kitchen as KitchenIcon,
  LocalLaundryService as LaundryIcon,
  Security as SecurityIcon,
  Phone as PhoneIcon,
  RoomService as RoomServiceIcon,
  LocalLaundryService as LaundryServiceIcon,
  Restaurant as RestaurantIcon,
  Visibility as ViewIcon,
  LocationCity as CityIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { roomsAPI, bookingsAPI } from '../../services/api';
import { uploadImages } from '../../services/uploadAPI';
import { useAuth } from '../../contexts/AuthContext';
import ResponsiveContainer from '../../components/common/ResponsiveContainer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusChip from '../../components/common/StatusChip';

const RoomManagement = () => {
  const { token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [viewingRoom, setViewingRoom] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPrice, setFilterPrice] = useState('all'); // Price range
  const [filterSize, setFilterSize] = useState('all'); // Room size range
  const [filterOccupancy, setFilterOccupancy] = useState('all'); // Max occupancy
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false); // Toggle advanced filters
  const [imageViewer, setImageViewer] = useState({ open: false, images: [], currentIndex: 0 });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [previewVideos, setPreviewVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('roomNumber');
  const [sortOrder, setSortOrder] = useState('asc');
  const [activeTab, setActiveTab] = useState('all');

  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: 1,
    roomType: 'standard',
    basePrice: 0,
    hourlyPrice: {
      firstHour: 100000,
      additionalHour: 20000
    },
    maxOccupancy: 2,
    bedType: 'single', // Changed from 'king' to 'single' to match backend enum
    roomSize: 20,
    amenities: [],
    description: '',
    status: 'available',
    cleaningStatus: 'clean',
  });

  const roomTypes = [
    { value: 'standard', label: 'Phòng Tiêu chuẩn', icon: '🏨' },
    { value: 'deluxe', label: 'Phòng Cao cấp', icon: '⭐' },
    { value: 'presidential', label: 'Phòng Tổng thống', icon: '👑' },
  ];

  const statusColors = {
    available: { color: 'success', label: 'Có sẵn' },
    occupied: { color: 'error', label: 'Đang sử dụng' },
    reserved: { color: 'warning', label: 'Đã đặt' },
    maintenance: { color: 'warning', label: 'Bảo trì' },
    cleaning: { color: 'info', label: 'Đang dọn dẹp' },
    needs_cleaning: { color: 'error', label: 'Cần dọn dẹp' },
    out_of_order: { color: 'default', label: 'Hỏng hóc' },
  };

  const cleaningStatusColors = {
    clean: { color: 'success', label: 'Sạch sẽ' },
    dirty: { color: 'warning', label: 'Cần dọn dẹp' },
    cleaning: { color: 'info', label: 'Đang dọn dẹp' },
    maintenance: { color: 'error', label: 'Bảo trì' },
  };

  const amenities = [
    { value: 'wifi', label: 'WiFi', icon: <WifiIcon /> },
    { value: 'tv', label: 'TV', icon: <TvIcon /> },
    { value: 'air_conditioning', label: 'Điều hòa', icon: <AcIcon /> },
    { value: 'minibar', label: 'Minibar', icon: <BarIcon /> },
    { value: 'balcony', label: 'Ban công', icon: <BalconyIcon /> },
    { value: 'sea_view', label: 'View biển', icon: <VisibilityIcon /> },
    { value: 'city_view', label: 'View thành phố', icon: <CityIcon /> },
    { value: 'jacuzzi', label: 'Jacuzzi', icon: <PoolIcon /> },
    { value: 'kitchen', label: 'Bếp', icon: <KitchenIcon /> },
    { value: 'washing_machine', label: 'Máy giặt', icon: <LaundryIcon /> },
    { value: 'safe', label: 'Két an toàn', icon: <SecurityIcon /> },
    { value: 'telephone', label: 'Điện thoại', icon: <PhoneIcon /> },
    { value: 'room_service', label: 'Dịch vụ phòng', icon: <RoomServiceIcon /> },
    { value: 'laundry_service', label: 'Giặt ủi', icon: <LaundryServiceIcon /> },
    { value: 'breakfast', label: 'Bữa sáng', icon: <RestaurantIcon /> },
  ];

  useEffect(() => {
    fetchRooms();
    fetchBookings();
    
    // Listen for booking status updates
    const handleBookingStatusUpdate = (event) => {
      console.log('📢 Booking status updated, refreshing rooms...', event.detail);
      setTimeout(async () => {
        console.log('🔄 Forcing room and booking refresh after booking status update...');
        await Promise.all([fetchRooms(), fetchBookings()]);
        console.log('✅ Room and booking data refreshed');
      }, 500);
    };
    
    // Listen for room updates
    const handleRoomUpdate = (event) => {
      console.log('📢 Room updated, refreshing rooms...', event.detail);
      setTimeout(async () => {
        console.log('🔄 Forcing room refresh after room update...');
        await fetchRooms();
        console.log('✅ Room data refreshed');
      }, 500);
    };
    
    // Listen for new bookings
    const handleNewBooking = (event) => {
      console.log('📢 New booking created, refreshing rooms...', event.detail);
      setTimeout(async () => {
        console.log('🔄 Forcing room and booking refresh after new booking...');
        await Promise.all([fetchRooms(), fetchBookings()]);
        console.log('✅ Room and booking data refreshed');
      }, 500);
    };
    
    // Add event listeners
    window.addEventListener('bookingStatusUpdated', handleBookingStatusUpdate);
    window.addEventListener('roomUpdated', handleRoomUpdate);
    window.addEventListener('newBookingCreated', handleNewBooking);
    
    return () => {
      window.removeEventListener('bookingStatusUpdated', handleBookingStatusUpdate);
      window.removeEventListener('roomUpdated', handleRoomUpdate);
      window.removeEventListener('newBookingCreated', handleNewBooking);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRooms = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching rooms...');
      const response = await roomsAPI.getRooms();
      const rooms = response.data?.data?.rooms || response.data || [];
      console.log('🔄 Fetched rooms:', rooms.length);
      
      
      setRooms(rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      console.error('Error details:', error.response?.data);
      showSnackbar('Lỗi khi tải danh sách phòng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      console.log('🔄 ===== FETCHING BOOKINGS =====');
      console.log('🔄 API call: bookingsAPI.getBookings()');
      console.log('🔄 Current user token:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
      console.log('🔄 Token value:', localStorage.getItem('token'));
      console.log('🔄 API base URL:', 'http://localhost:5000/api');
      console.log('🔄 Full endpoint:', 'http://localhost:5000/api/bookings');
      
      const response = await bookingsAPI.getBookings({ limit: 1000 });
      console.log('📊 ===== BOOKINGS API RESPONSE =====');
      console.log('📊 Full response:', response);
      console.log('📊 Response status:', response.status);
      console.log('📊 Response data:', response.data);
      console.log('📊 Response data type:', typeof response.data);
      console.log('📊 Response data keys:', Object.keys(response.data || {}));
      
      // Try different data paths
      const path1 = response.data?.data?.bookings;
      const path2 = response.data?.bookings;
      const path3 = response.data;
      
      console.log('📊 Path 1 (data.data.bookings):', path1);
      console.log('📊 Path 2 (data.bookings):', path2);
      console.log('📊 Path 3 (data):', path3);
      
      const bookingsData = path1 || path2 || path3 || [];
      console.log('📊 Final bookings data:', bookingsData);
      console.log('📊 Bookings count:', bookingsData.length);
      console.log('📊 Bookings type:', Array.isArray(bookingsData) ? 'ARRAY' : typeof bookingsData);
      
      // Log each booking for debugging
      if (Array.isArray(bookingsData)) {
        bookingsData.forEach((booking, index) => {
          console.log(`📊 Booking ${index}:`, {
            id: booking._id,
            room: booking.room,
            status: booking.status,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            customer: booking.customer
          });
        });
      } else {
        console.log('⚠️ Bookings data is not an array:', bookingsData);
      }
      
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      console.log('📊 ===== END BOOKINGS FETCH =====');
    } catch (error) {
      console.error('❌ ===== BOOKINGS FETCH ERROR =====');
      console.error('❌ Error:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error response status:', error.response?.status);
      console.error('❌ Error response headers:', error.response?.headers);
      console.error('❌ ===== END ERROR =====');
    }
  };

  // Tính trạng thái phòng dựa trên booking thực tế
  const getRoomStatus = (room) => {
    try {
      // Kiểm tra room có tồn tại không
      if (!room) {
        console.log('⚠️ Room is null or undefined');
        return { status: 'available', label: 'Có sẵn', color: 'success' };
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      console.log('🔍 ===== ROOM STATUS CHECK =====');
      console.log('🔍 Room:', room.roomNumber, 'ID:', room._id);
      console.log('🔍 Room full data:', room);
      console.log('📅 Today:', today.toISOString());
      console.log('📊 Bookings array length:', bookings.length);
      console.log('📊 Bookings data:', bookings);
      
      if (!bookings || bookings.length === 0) {
        console.log('⚠️ No bookings data available - returning available');
        return { status: 'available', label: 'Có sẵn', color: 'success' };
      }
      
      // Log all bookings for this room
      const roomBookings = bookings.filter(booking => {
        const bookingRoomId = booking.room?._id || booking.room;
        return bookingRoomId === room._id;
      });
      
      console.log('🔍 Bookings for this room:', roomBookings);
      
      // Tìm booking hiện tại của phòng
      const currentBooking = bookings.find(booking => {
        console.log('🔍 --- Checking booking ---');
        console.log('🔍 Booking ID:', booking._id);
        console.log('🔍 Booking room:', booking.room);
        console.log('🔍 Booking status:', booking.status);
        console.log('🔍 Booking checkIn:', booking.checkIn);
        console.log('🔍 Booking checkOut:', booking.checkOut);
        
        if (!booking || !booking.room) {
          console.log('⚠️ Invalid booking data - skipping');
          return false;
        }
        
        // So sánh room ID - kiểm tra cả object và string
        const bookingRoomId = booking.room?._id || booking.room;
        const roomMatch = bookingRoomId === room._id;
        console.log('🔍 Room ID comparison:', {
          bookingRoomId: bookingRoomId,
          roomId: room._id,
          match: roomMatch,
          bookingRoomIdType: typeof bookingRoomId,
          roomIdType: typeof room._id
        });
        
        // Nếu room ID không match, thử match theo room number
        if (!roomMatch) {
          const bookingRoomNumber = booking.room?.roomNumber;
          const roomNumberMatch = bookingRoomNumber === room.roomNumber;
          console.log('🔍 Room Number comparison:', {
            bookingRoomNumber: bookingRoomNumber,
            roomNumber: room.roomNumber,
            match: roomNumberMatch
          });
          
          if (!roomNumberMatch) {
            console.log('❌ Room ID and Number do not match - skipping');
            return false;
          } else {
            console.log('✅ Room Number matches - using this booking');
          }
        }
        
        // Loại bỏ booking đã hủy
        if (booking.status === 'cancelled' || booking.status === 'no_show') {
          console.log('❌ Booking cancelled or no-show - skipping');
          return false;
        }
        
        // Kiểm tra ngày
        if (!booking.checkIn || !booking.checkOut) {
          console.log('⚠️ Missing check-in/out dates - skipping');
          return false;
        }
        
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        
        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
          console.log('⚠️ Invalid date format - skipping');
          return false;
        }
        
        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);
        
        const isInRange = today >= checkIn && today < checkOut;
        console.log('📅 Date check:', { 
          checkIn: checkIn.toISOString(), 
          checkOut: checkOut.toISOString(), 
          today: today.toISOString(), 
          isInRange 
        });
        
        // Nếu booking đã checked_in, ưu tiên status hơn date range
        if (booking.status === 'checked_in') {
          console.log('✅ Booking is checked_in - using regardless of date range');
          return true;
        }
        
        if (isInRange) {
          console.log('✅ Booking is in date range!');
        } else {
          console.log('❌ Booking is not in date range');
        }
        
        return isInRange;
      });
      
      console.log('🎯 Found current booking:', currentBooking);
      
      if (currentBooking) {
        console.log('📊 Current booking status:', currentBooking.status);
        if (currentBooking.status === 'checked_in') {
          console.log('✅ Room is OCCUPIED (checked_in)');
          return { status: 'occupied', label: 'Đang sử dụng', color: 'error' };
        } else if (currentBooking.status === 'confirmed' || currentBooking.status === 'pending') {
          console.log('⚠️ Room is RESERVED (confirmed/pending)');
          console.log('⚠️ Current booking status:', currentBooking.status);
          console.log('⚠️ Room ID:', room._id, 'Room Number:', room.roomNumber);
          return { status: 'reserved', label: 'Đã đặt', color: 'warning' };
        } else {
          console.log('❓ Unknown booking status:', currentBooking.status);
        }
      }
      
      // Kiểm tra maintenance status
      if (room.status === 'maintenance') {
        console.log('🔧 Room is in maintenance');
        return { status: 'maintenance', label: 'Bảo trì', color: 'warning' };
      }
      
      console.log('✅ Room is AVAILABLE');
      console.log('🔍 ===== END ROOM STATUS CHECK =====');
      return { status: 'available', label: 'Có sẵn', color: 'success' };
    } catch (error) {
      console.error('❌ Error in getRoomStatus:', error);
      return { status: 'available', label: 'Có sẵn', color: 'success' };
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    console.log('showSnackbar called:', { message, severity });
    setSnackbar({ open: true, message, severity });
    console.log('Snackbar state set:', { open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleOpenDialog = (room = null) => {
    if (room) {
      setEditingRoom(room);
      
      // Validate bedType from existing data
      const validBedTypes = ['single', 'double', 'queen'];
      const safeBedType = validBedTypes.includes(room.bedType) ? room.bedType : 'single';
      
      setFormData({
        roomNumber: room.roomNumber,
        floor: room.floor,
        roomType: room.roomType,
        basePrice: room.basePrice,
        hourlyPrice: room.hourlyPrice || {
          firstHour: 100000,
          additionalHour: 20000
        },
        maxOccupancy: room.maxOccupancy,
        bedType: safeBedType, // Use validated bedType
        roomSize: room.roomSize,
        amenities: room.amenities || [],
        description: room.description || '',
        status: room.status,
        cleaningStatus: room.cleaningStatus,
        images: room.images || [],
      });
      
      // Initialize preview images with existing room images
      console.log('Loading existing images for room:', room.roomNumber, room.images);
      const existingImages = (room.images || []).map((img, index) => {
        const imageData = img.data || img.url || img;
        // Ensure imageData is a string for calculateBase64Size
        const imageDataString = typeof imageData === 'string' ? imageData : '';
        
        const processedImage = {
          id: `existing-${index}`,
          data: imageData,
          filename: img.filename || `Room_${room.roomNumber}_${index + 1}.jpg`,
          mimetype: img.mimetype || 'image/jpeg',
          size: img.size || calculateBase64Size(imageDataString),
          caption: img.caption || `Hình ảnh phòng ${room.roomNumber}`,
          isPrimary: img.isPrimary || false,
          type: img.type || 'normal',
          isExisting: true,
        };
        
        console.log('Processed existing image:', processedImage.filename, 'hasData:', !!processedImage.data);
        return processedImage;
      });
      
      setPreviewImages(existingImages);
      setUploadedImages(existingImages);
    } else {
      setEditingRoom(null);
      setFormData({
        roomNumber: '',
        floor: 1,
        roomType: 'standard',
        basePrice: 0,
        hourlyPrice: {
          firstHour: 100000,
          additionalHour: 20000
        },
        maxOccupancy: 2,
        bedType: 'single',
        roomSize: 20,
        amenities: [],
        description: '',
        status: 'available',
        cleaningStatus: 'clean',
        images: [],
      });
      
      // Reset images for new room
      setPreviewImages([]);
      setUploadedImages([]);
    }
    setOpenDialog(true);
  };

  const handleViewRoom = (room) => {
    console.log('🔍 Viewing room:', room.roomNumber);
    console.log('📸 Room images:', room.images);
    console.log('📸 First image:', room.images?.[0]);
    setViewingRoom(room);
    setViewDialog(true);
  };

  const handleImageError = (roomId, imageIndex) => {
    setImageErrors(prev => ({
      ...prev,
      [`${roomId}-${imageIndex}`]: true
    }));
  };


  // Function to calculate file size from base64 data
  const calculateBase64Size = (base64String) => {
    // Check if input is valid
    if (!base64String || typeof base64String !== 'string') {
      return 0;
    }
    
    try {
      // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.includes(',') 
        ? base64String.split(',')[1] 
        : base64String;
      
      // Validate base64 data
      if (!base64Data || base64Data.length === 0) {
        return 0;
      }
      
      // Calculate size: base64 encoding increases size by ~33%
      // Formula: (base64_length * 3) / 4 - padding
      const padding = (base64Data.match(/=/g) || []).length;
      const size = (base64Data.length * 3) / 4 - padding;
      
      return Math.max(0, Math.round(size));
    } catch (error) {
      console.warn('Error calculating base64 size:', error);
      return 0;
    }
  };

  // Function to format file size in a human-readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRoom(null);
    setUploadedImages([]);
    setPreviewImages([]);
  };

  // REMOVED: compressImage function - Cloudinary handles optimization

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) return;
    
    // Limit to 10 images per room (Cloudinary can handle more)
    const maxImages = 10;
    if (uploadedImages.length + imageFiles.length > maxImages) {
      showSnackbar(`Tối đa ${maxImages} ảnh mỗi phòng`, 'warning');
      return;
    }
    
    setUploading(true);
    showSnackbar(`🔄 Đang chuẩn bị ${imageFiles.length} ảnh...`, 'info');
    
    // SIMPLIFIED: Just convert to base64 for preview, Cloudinary handles optimization
    const newImages = [];
    
    for (const file of imageFiles) {
      try {
        // Simple file size check (Cloudinary limit is 10MB)
        if (file.size > 10 * 1024 * 1024) {
          showSnackbar(`File ${file.name} quá lớn (tối đa 10MB)`, 'error');
          continue;
        }
        
        // Convert to base64 for preview only
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = {
            id: Date.now() + Math.random(),
            data: e.target.result,
            filename: file.name,
            mimetype: file.type,
            size: file.size,
            caption: `Hình ảnh phòng ${formData.roomNumber || 'mới'}`,
            isPrimary: false,
            type: 'normal',
            file: file // Keep original file for Cloudinary upload
          };
          
          newImages.push(imageData);
          
          if (newImages.length === imageFiles.length) {
            setUploadedImages(prev => [...prev, ...newImages]);
            setPreviewImages(prev => [...prev, ...newImages]);
            
            setFormData(prev => ({
              ...prev,
              images: [...(prev.images || []), ...newImages]
            }));
            setUploading(false);
            
            showSnackbar(`✅ Đã chuẩn bị ${newImages.length} ảnh cho upload`, 'success');
          }
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error processing image:', error);
        showSnackbar('Lỗi khi xử lý ảnh', 'error');
        setUploading(false);
      }
    }
  };

  const handleVideoUpload = async (event) => {
    const files = Array.from(event.target.files);
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length === 0) return;
    
    // Limit to 5 videos per room
    const maxVideos = 5;
    if (uploadedVideos.length + videoFiles.length > maxVideos) {
      showSnackbar(`Tối đa ${maxVideos} video mỗi phòng`, 'warning');
      return;
    }
    
    setUploading(true);
    showSnackbar(`🔄 Đang chuẩn bị ${videoFiles.length} video...`, 'info');
    
    const newVideos = [];
    
    for (const file of videoFiles) {
      try {
        // Simple file size check (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
          showSnackbar(`File ${file.name} quá lớn (tối đa 50MB)`, 'error');
          continue;
        }
        
        // Convert to base64 for preview only
        const reader = new FileReader();
        reader.onload = (e) => {
          const videoData = {
            id: Date.now() + Math.random(),
            data: e.target.result,
            filename: file.name,
            mimetype: file.type,
            size: file.size,
            caption: `Video phòng ${formData.roomNumber || 'mới'}`,
            isPrimary: false,
            type: 'normal',
            file: file // Keep original file for upload
          };
          
          newVideos.push(videoData);
          
          if (newVideos.length === videoFiles.length) {
            setUploadedVideos(prev => [...prev, ...newVideos]);
            setPreviewVideos(prev => [...prev, ...newVideos]);
            
            setFormData(prev => ({
              ...prev,
              videos: [...(prev.videos || []), ...newVideos]
            }));
            setUploading(false);
            
            showSnackbar(`✅ Đã chuẩn bị ${newVideos.length} video cho upload`, 'success');
          }
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error processing video:', error);
        showSnackbar('Lỗi khi xử lý video', 'error');
        setUploading(false);
      }
    }
  };

  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    setPreviewImages(prev => prev.filter(img => img.id !== imageId));
    
    // Update formData to remove image
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter(img => img.id !== imageId)
    }));
  };

  const removeVideo = (videoId) => {
    console.log('🗑️ Removing video:', videoId, typeof videoId);
    
    // Remove from uploaded videos (new videos)
    setUploadedVideos(prev => prev.filter(video => video.id !== videoId));
    setPreviewVideos(prev => prev.filter(video => video.id !== videoId));
    
    // Also remove from existing videos if it's an existing video
    if (typeof videoId === 'string' && videoId.startsWith('existing-')) {
      const existingVideoIndex = parseInt(videoId.replace('existing-', ''));
      setFormData(prev => ({
        ...prev,
        videos: (prev.videos || []).filter((_, index) => index !== existingVideoIndex)
      }));
    } else {
      // Update formData to remove new video
      setFormData(prev => ({
        ...prev,
        videos: (prev.videos || []).filter(video => video.id !== videoId)
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('🚀 Starting simple room update...');
      
      // Basic validation
      if (!formData.roomNumber?.trim()) {
        showSnackbar('Vui lòng nhập số phòng', 'error');
        return;
      }
      if (!formData.roomType) {
        showSnackbar('Vui lòng chọn loại phòng', 'error');
        return;
      }
      if (!formData.basePrice || formData.basePrice <= 0) {
        showSnackbar('Vui lòng nhập giá phòng hợp lệ', 'error');
        return;
      }
      
      // Map roomType to backend accepted values
      const roomTypeMapping = {
        'standard': 'standard',
        'deluxe': 'deluxe',
        'suite': 'suite',
        'single': 'single',
        'presidential': 'presidential'
      };
      
      const mappedRoomType = roomTypeMapping[formData.roomType] || 'standard';
      
      // Simple room data
      const roomData = {
        roomNumber: formData.roomNumber.trim(),
        floor: parseInt(formData.floor) || 1,
        roomType: mappedRoomType,
        basePrice: parseFloat(formData.basePrice),
        hourlyPrice: {
          firstHour: parseFloat(formData.hourlyPrice.firstHour),
          additionalHour: parseFloat(formData.hourlyPrice.additionalHour)
        },
        maxOccupancy: parseInt(formData.maxOccupancy) || 2,
        bedType: formData.bedType || 'single',
        roomSize: parseFloat(formData.roomSize) || 25,
        status: formData.status || 'available',
        description: formData.description || '',
        amenities: formData.amenities || [],
        cleaningStatus: formData.cleaningStatus || 'clean'
      };
      
      console.log('🔄 Room type mapping:', formData.roomType, '->', mappedRoomType);

      // Handle image upload (Base64 MongoDB) - Keep existing + add new
      if (uploadedImages && uploadedImages.length > 0) {
        console.log('📤 Uploading images to MongoDB:', uploadedImages.length);

        const files = uploadedImages.map(img => img.file).filter(Boolean);
        if (files.length > 0) {
          try {
            console.log('🔄 Starting Base64 upload...');
            showSnackbar('🔄 Đang lưu ảnh vào MongoDB...', 'info');
            
            console.log('📋 Files to upload:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
            console.log('🔑 Token:', token ? 'Present' : 'Missing');
            
            const imageUrls = await uploadImages(files, token);
            
            // Keep existing images + add new ones
            const existingImages = editingRoom?.images || [];
            const newImages = imageUrls;
            roomData.images = [...existingImages, ...newImages];
            
            console.log('✅ Existing images:', existingImages.length);
            console.log('✅ New images:', newImages.length);
            console.log('✅ Total images:', roomData.images.length);
            showSnackbar('✅ Lưu ảnh thành công!', 'success');
          } catch (error) {
            console.error('❌ Error uploading images:', error);
            showSnackbar('Lỗi khi lưu ảnh vào MongoDB', 'error');
            return;
          }
        }
      }

      // Handle video upload (Base64 MongoDB) - Keep existing + add new
      if (uploadedVideos && uploadedVideos.length > 0) {
        console.log('🎥 Uploading videos to MongoDB:', uploadedVideos.length);

        const files = uploadedVideos.map(video => video.file).filter(Boolean);
        if (files.length > 0) {
          try {
            console.log('🔄 Starting video Base64 upload...');
            showSnackbar('🔄 Đang lưu video vào MongoDB...', 'info');
            
            // Use uploadImages for videos too (same endpoint)
            const videoUrls = await uploadImages(files, token);
            
            // Keep existing videos + add new ones
            const existingVideos = editingRoom?.videos || [];
            const newVideos = videoUrls;
            roomData.videos = [...existingVideos, ...newVideos];
            
            console.log('✅ Existing videos:', existingVideos.length);
            console.log('✅ New videos:', newVideos.length);
            console.log('✅ Total videos:', roomData.videos.length);
            showSnackbar('✅ Lưu video thành công!', 'success');
          } catch (error) {
            console.error('❌ Error uploading videos:', error);
            showSnackbar('Lỗi khi lưu video vào MongoDB', 'error');
        return;
      }
        }
      } else {
        // No new videos uploaded, use formData.videos (which may have deletions)
        roomData.videos = formData.videos || editingRoom?.videos || [];
        console.log('✅ Using formData videos:', roomData.videos.length);
      }

      console.log('📝 Room data:', roomData);
      
      // Validate required fields
      if (!roomData.roomNumber || !roomData.roomType) {
        showSnackbar('❌ Vui lòng nhập đầy đủ thông tin bắt buộc', 'error');
        return;
      }
      
      if (editingRoom) {
        console.log('🔄 Updating room:', editingRoom._id);
        console.log('📤 Sending data to backend:', JSON.stringify(roomData, null, 2));
        
        try {
          const response = await roomsAPI.updateRoom(editingRoom._id, roomData);
          console.log('✅ Update successful:', response.data);
        } catch (error) {
          console.error('❌ Update failed:', error);
          console.error('❌ Error response:', error.response?.data);
          console.error('❌ Error status:', error.response?.status);
          showSnackbar(`❌ Lỗi cập nhật phòng: ${error.response?.data?.message || error.message}`, 'error');
          return;
        }
          
          showSnackbar('🎉 Cập nhật phòng thành công!', 'success');
        
        // Refresh rooms and bookings
        await Promise.all([fetchRooms(), fetchBookings()]);
        
        // Dispatch event for auto-refresh
        window.dispatchEvent(new CustomEvent('roomUpdated', { 
          detail: { roomId: editingRoom._id, action: 'updated' } 
        }));
        
        // Force refresh the viewing room if it's the same room
        if (viewingRoom && viewingRoom._id === editingRoom._id) {
          console.log('🔄 Refreshing viewing room data...');
          // Get the updated room from the refreshed rooms list
          const updatedRooms = await roomsAPI.getRooms();
          const updatedRoom = updatedRooms.data?.data?.rooms?.find(room => room._id === editingRoom._id);
          if (updatedRoom) {
            console.log('✅ Updated room found:', updatedRoom.roomNumber, updatedRoom.images?.length);
            setViewingRoom(updatedRoom);
          }
        }
        
        // Close dialog
        setOpenDialog(false);
        setEditingRoom(null);
        setUploadedImages([]);
        setPreviewImages([]);
      } else {
        console.log('➕ Creating new room');
        
        const response = await roomsAPI.createRoom(roomData);
        console.log('✅ Create successful:', response.data);
        
        showSnackbar('🎉 Tạo phòng mới thành công!', 'success');
        
        // Refresh rooms
      await fetchRooms();
      
        // Dispatch event for auto-refresh
        window.dispatchEvent(new CustomEvent('roomUpdated', { 
          detail: { roomId: response.data?.data?._id, action: 'created' } 
        }));
      
        // Close dialog
      setOpenDialog(false);
      setEditingRoom(null);
      setUploadedImages([]);
      setPreviewImages([]);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      showSnackbar('❌ Lỗi khi lưu phòng: ' + (error.message || 'Unknown error'), 'error');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      try {
        await roomsAPI.deleteRoom(roomId);
        showSnackbar('Xóa phòng thành công!');
        fetchRooms();
        
        // Dispatch event for auto-refresh
        window.dispatchEvent(new CustomEvent('roomUpdated', { 
          detail: { roomId, action: 'deleted' } 
        }));
      } catch (error) {
        console.error('Error deleting room:', error);
        showSnackbar('Lỗi khi xóa phòng', 'error');
      }
    }
  };

  const filteredRooms = rooms.filter(room => {
    // Kiểm tra room có tồn tại không
    if (!room) {
      console.log('⚠️ Found null/undefined room in rooms array');
      return false;
    }
    
    // Filter by active tab
    if (activeTab === 'all') {
      return true;
    }
    
    if (activeTab === 'available') {
      // Ưu tiên trạng thái thực tế của phòng
      if (room.status === 'maintenance' || 
          room.cleaningStatus === 'dirty' || 
          room.cleaningStatus === 'cleaning' || 
          room.cleaningStatus === 'maintenance_required') {
        return false;
      }
      
      // Kiểm tra trạng thái available
      const isAvailable = getRoomStatus(room).status === 'available';
      if (!isAvailable) return false;
      
      // Lọc theo loại phòng nếu được chọn
      if (filterType !== 'all') {
        return room.roomType === filterType;
      }
      
      return true;
    }
    
    if (activeTab === 'occupied') {
      // Ưu tiên trạng thái thực tế của phòng
      if (room.status === 'maintenance' || 
          room.cleaningStatus === 'dirty' || 
          room.cleaningStatus === 'cleaning' || 
          room.cleaningStatus === 'maintenance_required') {
        return false;
      }
      // Nếu không có trạng thái đặc biệt, sử dụng getRoomStatus
      return getRoomStatus(room).status === 'occupied';
    }
    
    if (activeTab === 'cleaning') {
      return room.cleaningStatus === 'dirty' || room.cleaningStatus === 'cleaning';
    }
    
    if (activeTab === 'maintenance') {
      return room.status === 'maintenance' || room.cleaningStatus === 'maintenance_required';
    }
    
    return true;
  });

  const getRoomTypeIcon = (type) => {
    const roomType = roomTypes.find(rt => rt.value === type);
    return roomType ? roomType.icon : '🏨';
  };

  const getRoomTypeLabel = (type) => {
    const roomType = roomTypes.find(rt => rt.value === type);
    return roomType ? roomType.label : type;
  };

  const getAmenityLabel = (amenity) => {
    const amenityTranslations = {
      'wifi': 'WiFi',
      'tv': 'TV',
      'air_conditioning': 'Điều hòa',
      'minibar': 'Minibar',
      'balcony': 'Ban công',
      'safe': 'Két an toàn',
      'fridge': 'Tủ lạnh',
      'coffee_maker': 'Máy pha cà phê',
      'iron': 'Bàn ủi',
      'hair_dryer': 'Máy sấy tóc',
      'bathroom': 'Phòng tắm riêng',
      'bathtub': 'Bồn tắm',
      'shower': 'Vòi sen',
      'desk': 'Bàn làm việc',
      'chair': 'Ghế',
      'sofa': 'Ghế sofa',
      'wardrobe': 'Tủ quần áo',
      'window': 'Cửa sổ',
      'view': 'View đẹp',
      'parking': 'Bãi đỗ xe',
      'breakfast': 'Bữa sáng',
      'room_service': 'Dịch vụ phòng',
      'laundry': 'Giặt ủi',
      'gym': 'Phòng gym',
      'pool': 'Hồ bơi',
      'spa': 'Spa',
      'restaurant': 'Nhà hàng',
      'bar': 'Quầy bar',
      'concierge': 'Lễ tân 24/7',
      'business_center': 'Trung tâm kinh doanh',
      'meeting_room': 'Phòng họp',
      'wedding_hall': 'Sảnh cưới',
      'kids_club': 'Câu lạc bộ trẻ em',
      'playground': 'Sân chơi',
      'garden': 'Vườn',
      'terrace': 'Sân thượng',
      'rooftop': 'Sân thượng',
      'fireplace': 'Lò sưởi',
      'jacuzzi': 'Bồn tắm nước nóng',
      'sauna': 'Phòng xông hơi',
      'steam_room': 'Phòng xông hơi ướt',
      'massage': 'Massage',
      'beauty_salon': 'Thẩm mỹ viện',
    };
    return amenityTranslations[amenity] || amenity;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <LoadingSpinner 
        message="Đang tải danh sách phòng..." 
        size={60} 
        fullScreen={false}
      />
    );
  }

  return (
    <ResponsiveContainer>
      {/* Header */}
      <Fade in={true}>
        <Box sx={{ mb: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
            <Box sx={{ position: 'relative' }}>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom 
                sx={{
                  color: '#374151',
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '3rem' },
                  mb: 2,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-8px',
                    left: 0,
                    width: '60px',
                    height: '3px',
                    background: 'linear-gradient(90deg, #d97706 0%, #f59e0b 100%)',
                    borderRadius: '2px',
                  }
                }}
              >
                Quản lý Phòng
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ 
                fontWeight: 500,
                opacity: 0.8,
                ml: 1,
              }}>
                Quản lý thông tin phòng, giá cả và trạng thái
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Lưới">
                <IconButton 
                  onClick={() => setViewMode('grid')}
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                  sx={{
                    background: viewMode === 'grid' ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' : 'transparent',
                    color: viewMode === 'grid' ? 'white' : 'inherit',
                  }}
                >
                  <GridIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Danh sách">
                <IconButton 
                  onClick={() => setViewMode('list')}
                  color={viewMode === 'list' ? 'primary' : 'default'}
                  sx={{
                    background: viewMode === 'list' ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' : 'transparent',
                    color: viewMode === 'list' ? 'white' : 'inherit',
                  }}
                >
                  <ListIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Làm mới dữ liệu">
                <IconButton 
                  onClick={async () => {
                    console.log('🔄 Manual refresh triggered');
                    await Promise.all([fetchRooms(), fetchBookings()]);
                    showSnackbar('Đã làm mới dữ liệu!', 'success');
                  }}
                  sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
          
          {/* Enhanced Quick Stats */}
          <Paper sx={{ 
            p: 4, 
            mb: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: 4,
            boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)',
            }
          }}>
            <Stack direction="row" spacing={4} justifyContent="center" flexWrap="wrap">
              <Box textAlign="center" sx={{
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.04) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.15)',
                transition: 'all 0.3s ease',
                minWidth: '120px',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 30px rgba(34, 197, 94, 0.15)',
                }
              }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 'bold', 
                  mb: 1,
                  color: '#059669',
                }}>
                  {filteredRooms.filter(room => {
                    // Ưu tiên trạng thái thực tế của phòng
                    if (room.status === 'maintenance' || 
                        room.cleaningStatus === 'dirty' || 
                        room.cleaningStatus === 'cleaning' || 
                        room.cleaningStatus === 'maintenance_required') {
                      return false;
                    }
                    // Nếu không có trạng thái đặc biệt, sử dụng getRoomStatus
                    return getRoomStatus(room).status === 'available';
                  }).length}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  ✓ Có sẵn
                </Typography>
              </Box>
              
              <Box textAlign="center" sx={{
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.04) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                transition: 'all 0.3s ease',
                minWidth: '120px',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 30px rgba(239, 68, 68, 0.15)',
                }
              }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 'bold', 
                  mb: 1,
                  color: '#dc2626',
                }}>
                  {filteredRooms.filter(room => {
                    // Ưu tiên trạng thái thực tế của phòng
                    if (room.status === 'maintenance' || 
                        room.cleaningStatus === 'dirty' || 
                        room.cleaningStatus === 'cleaning' || 
                        room.cleaningStatus === 'maintenance_required') {
                      return false;
                    }
                    // Nếu không có trạng thái đặc biệt, sử dụng getRoomStatus
                    return getRoomStatus(room).status === 'occupied';
                  }).length}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  ● Đang sử dụng
                </Typography>
              </Box>
              
              <Box textAlign="center" sx={{
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.04) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.15)',
                transition: 'all 0.3s ease',
                minWidth: '120px',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 30px rgba(245, 158, 11, 0.15)',
                }
              }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 'bold', 
                  mb: 1,
                  color: '#d97706',
                }}>
                  {filteredRooms.filter(room => 
                    room.status === 'maintenance' || 
                    room.cleaningStatus === 'maintenance_required'
                  ).length}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  ⚠ Bảo trì
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Fade>

      {/* Tab Navigation */}
      <Fade in={true} style={{ transitionDelay: '200ms' }}>
        <Paper sx={{ 
          p: 2, 
          mb: 4, 
          borderRadius: 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
                sx={{
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: '2px 2px 0 0',
                background: 'linear-gradient(90deg, #d97706 0%, #f59e0b 100%)',
              },
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                    color: '#6b7280',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                  color: '#d97706',
                  backgroundColor: 'rgba(217, 119, 6, 0.05)',
                },
                '&.Mui-selected': {
                  color: '#d97706',
                  backgroundColor: 'rgba(217, 119, 6, 0.08)',
                },
                    },
                  }}
                >
            <Tab
              icon={<HotelIcon sx={{ fontSize: 20 }} />}
              label="Tất cả"
              value="all"
            />
            <Tab
              icon={<CheckCircleIcon sx={{ fontSize: 20 }} />}
              label="Có sẵn"
              value="available"
            />
            <Tab
              icon={<PersonIcon sx={{ fontSize: 20 }} />}
              label="Đang sử dụng"
              value="occupied"
            />
            <Tab
              icon={<CleaningServicesIcon sx={{ fontSize: 20 }} />}
              label="Cần dọn dẹp"
              value="cleaning"
            />
            <Tab
              icon={<BuildIcon sx={{ fontSize: 20 }} />}
              label="Bảo trì"
              value="maintenance"
            />
          </Tabs>
          
          {/* Room Type Filter - Only show when "Có sẵn" tab is selected */}
          {activeTab === 'available' && (
            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151' }}>
                Lọc theo loại phòng:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Loại phòng</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Loại phòng"
                >
                  <MenuItem value="all">Tất cả loại</MenuItem>
                  {roomTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Chip
                label={`${filteredRooms.length} phòng có sẵn`}
                color="success"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          )}
        </Paper>
      </Fade>

      {/* Room Display */}
      {viewMode === 'grid' && (
        <Grid container spacing={3} sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)', // 3 columns exactly
          gap: 3,
        }}>
          {filteredRooms.map((room, index) => (
          <Box key={room._id}>
            <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
              <Card sx={{ 
                height: '600px', // Fixed height for all cards
                width: '100%', // Full width of grid cell
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                // Làm mờ khi phòng đang bảo trì hoặc cần/đang dọn dẹp
                opacity: (() => {
                  const shouldDim = room.status === 'maintenance' || 
                                   room.cleaningStatus === 'cleaning' || 
                                   room.cleaningStatus === 'dirty' ||
                                   room.cleaningStatus === 'maintenance_required';
                  if (shouldDim) {
                    console.log('🔍 Room dimmed:', room.roomNumber, 'status:', room.status, 'cleaningStatus:', room.cleaningStatus);
                  }
                  return shouldDim ? 0.6 : 1;
                })(),
                filter: (() => {
                  const shouldFilter = room.status === 'maintenance' || 
                                      room.cleaningStatus === 'cleaning' || 
                                      room.cleaningStatus === 'dirty' ||
                                      room.cleaningStatus === 'maintenance_required';
                  return shouldFilter ? 'grayscale(0.3) saturate(0.8)' : 'none';
                })(),
                // Debug: Thêm border đỏ cho phòng maintenance để dễ nhận biết
                border: room.status === 'maintenance' ? '3px solid #dc2626' : '1px solid #e2e8f0',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #d97706 0%, #f59e0b 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
                '&:hover': {
                  transform: 'translateY(-12px) scale(1.02)',
                  boxShadow: '0 25px 50px rgba(217, 119, 6, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1)',
                  borderColor: '#d97706',
                  // Khôi phục opacity và filter khi hover
                  opacity: 1,
                  filter: 'none',
                  '&::before': {
                    opacity: 1,
                  },
                },
              }}>
                {/* Enhanced Room Image */}
                <CardMedia
                  component="div"
                  sx={{
                    height: '180px', // Fixed height for image
                    flexShrink: 0, // Prevent shrinking
                    background: room.images && room.images.length > 0 
                      ? `url(${typeof room.images[0] === 'string' ? room.images[0] : (room.images[0].url || room.images[0].data || room.images[0])})` 
                      : 'linear-gradient(135deg, #374151 0%, #4b5563 50%, #6b7280 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    borderRadius: '12px 12px 0 0',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: room.images && room.images.length > 0 
                        ? 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)'
                        : 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: room.images && room.images.length > 0 
                        ? 'linear-gradient(45deg, rgba(0,0,0,0.2) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)'
                        : 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
                    }
                  }}
                >
                  {/* Room Image or Fallback */}
                  {room.images && room.images.length > 0 && !imageErrors[`${room._id}-0`] ? (
                    <Box sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `url(${typeof room.images[0] === 'string' ? room.images[0] : (room.images[0].url || room.images[0].data || room.images[0])})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)',
                      }
                    }} />
                  ) : null}
                  
                  {/* Room Info Overlay */}
                  <Box sx={{ 
                    textAlign: 'center', 
                    color: 'white',
                    position: 'relative',
                    zIndex: 2,
                  }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ 
                      mb: 1,
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    }}>
                      Phòng {room.roomNumber}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      opacity: 0.9,
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    }}>
                      Tầng {room.floor}
                    </Typography>
                  </Box>
                  
                  {/* Status Badge */}
                  <Chip
                    label={(() => {
                      // Ưu tiên hiển thị trạng thái thực tế của phòng
                      if (room.status === 'maintenance') {
                        return 'Bảo trì';
                      }
                      if (room.cleaningStatus === 'dirty') {
                        return 'Cần dọn dẹp';
                      }
                      if (room.cleaningStatus === 'cleaning') {
                        return 'Đang dọn dẹp';
                      }
                      if (room.cleaningStatus === 'maintenance_required') {
                        return 'Cần bảo trì';
                      }
                      // Nếu không có trạng thái đặc biệt, sử dụng getRoomStatus
                      return getRoomStatus(room).label;
                    })()}
                    color={(() => {
                      // Ưu tiên màu sắc theo trạng thái thực tế
                      if (room.status === 'maintenance' || room.cleaningStatus === 'maintenance_required') {
                        return 'error';
                      }
                      if (room.cleaningStatus === 'dirty') {
                        return 'warning';
                      }
                      if (room.cleaningStatus === 'cleaning') {
                        return 'info';
                      }
                      // Nếu không có trạng thái đặc biệt, sử dụng getRoomStatus
                      return getRoomStatus(room).color;
                    })()}
                    size="medium"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      minWidth: '90px',
                      height: '36px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      zIndex: 2,
                      // Tùy chỉnh màu sắc cho từng trạng thái
                      ...(room.status === 'maintenance' && {
                        backgroundColor: '#f97316',
                        color: 'white',
                        border: '2px solid #ea580c',
                        '&:hover': {
                          backgroundColor: '#ea580c',
                        }
                      }),
                      ...(room.cleaningStatus === 'dirty' && {
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: '2px solid #d97706',
                        '&:hover': {
                          backgroundColor: '#d97706',
                        }
                      }),
                      ...(room.cleaningStatus === 'cleaning' && {
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: '2px solid #2563eb',
                        '&:hover': {
                          backgroundColor: '#2563eb',
                        }
                      }),
                      ...(room.cleaningStatus === 'maintenance_required' && {
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: '2px solid #b91c1c',
                        '&:hover': {
                          backgroundColor: '#b91c1c',
                        }
                      }),
                      // Fallback cho getRoomStatus
                      ...(room.status !== 'maintenance' && 
                          room.cleaningStatus !== 'dirty' && 
                          room.cleaningStatus !== 'cleaning' && 
                          room.cleaningStatus !== 'maintenance_required' && {
                        ...(getRoomStatus(room).status === 'occupied' && {
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: '2px solid #b91c1c',
                          '&:hover': {
                            backgroundColor: '#b91c1c',
                          }
                        }),
                        ...(getRoomStatus(room).status === 'reserved' && {
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          border: '2px solid #d97706',
                          '&:hover': {
                            backgroundColor: '#d97706',
                          }
                        }),
                        ...(getRoomStatus(room).status === 'available' && {
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: '2px solid #059669',
                          '&:hover': {
                            backgroundColor: '#059669',
                          }
                        }),
                      }),
                    }}
                  />
                  
                  {/* Favorite Button */}
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.3)',
                      },
                    }}
                  >
                    <FavoriteBorderIcon />
                  </IconButton>
                </CardMedia>

                <CardContent sx={{ 
                  flex: 1, 
                  p: 2.5,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                }}>
                  <Stack spacing={1.5}>
                    {/* Enhanced Room Type */}
                    <Box sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: 'rgba(217, 119, 6, 0.05)',
                      border: '1px solid rgba(217, 119, 6, 0.1)',
                    }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 0.5,
                      }}>
                        {getRoomTypeIcon(room.roomType)} {getRoomTypeLabel(room.roomType)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ 
                        fontWeight: 500,
                        lineHeight: 1.4,
                        height: '32px', // Compact description height
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {room.description || 'Phòng tiện nghi hiện đại với đầy đủ trang thiết bị'}
                      </Typography>
                    </Box>

                    {/* Room Details */}
                    <Box>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={`${room.maxOccupancy} người`}
                          size="small"
                          sx={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                        <Chip
                          label={`${room.roomSize}m²`}
                          size="small"
                          sx={{
                            background: 'linear-gradient(135deg, #fbbf24 0%, #7c3aed 100%)',
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </Stack>
                    </Box>

                    {/* Price */}
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        {formatPrice(room.basePrice)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        / đêm
                      </Typography>
                    </Box>

                    {/* Amenities */}
                    <Box sx={{ height: '50px', overflow: 'hidden' }}>
                      {room.amenities && room.amenities.length > 0 ? (
                        <>
                          <Typography variant="caption" color="text.secondary" gutterBottom fontWeight="600" sx={{ mb: 0.5 }}>
                            ✨ Tiện nghi:
                          </Typography>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ maxHeight: '40px', overflow: 'hidden' }}>
                            {room.amenities.slice(0, 2).map((amenity) => {
                              const amenityData = amenities.find(a => a.value === amenity);
                              return (
                                <Chip
                                  key={amenity}
                                  label={amenityData?.label || amenity}
                                  size="small"
                                  sx={{
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    color: 'white',
                                    fontWeight: 600,
                                  }}
                                  icon={amenityData?.icon}
                                />
                              );
                            })}
                            {room.amenities.length > 2 && (
                              <Chip
                                label={`+${room.amenities.length - 2}`}
                                size="small"
                                sx={{
                                  background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                                  color: 'white',
                                  fontWeight: 600,
                                }}
                              />
                            )}
                          </Stack>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          fontStyle: 'italic',
                          opacity: 0.7,
                          height: '50px',
                          display: 'flex',
                          alignItems: 'center',
                        }}>
                          Chưa có tiện nghi
                        </Typography>
                      )}
                    </Box>

                  {/* Images Count */}
                  {room.images && room.images.length > 0 && (
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ImageIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {room.images.length} hình ảnh
                        </Typography>
                        {room.images.some(img => img.type === '360') && (
                          <>
                            <ThreeSixtyIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              360°
                            </Typography>
                          </>
                        )}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </CardContent>

                <CardActions sx={{ 
                  p: 2.5, 
                  pt: 2,
                  background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                  borderTop: '1px solid #e2e8f0',
                  borderRadius: '0 0 12px 12px',
                  height: '80px', // Fixed height for button area
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0, // Prevent shrinking
                }}>
                  <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                    <Tooltip title="Xem chi tiết">
                      <Button
                        size="medium"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewRoom(room)}
                        sx={{ 
                          flex: 1,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          borderRadius: 3,
                          fontWeight: 700,
                          textTransform: 'none',
                          fontSize: '0.875rem',
                          py: 1.5,
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                          border: '2px solid transparent',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                            transition: 'left 0.5s',
                          },
                          '&:hover': {
                            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                            transform: 'translateY(-2px)',
                            border: '2px solid rgba(102, 126, 234, 0.5)',
                            '&::before': {
                              left: '100%',
                            },
                          },
                        }}
                      >
                        Xem
                      </Button>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                      <Button
                        size="medium"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(room)}
                        sx={{ 
                          flex: 1,
                          borderColor: '#667eea',
                          color: '#667eea',
                          borderRadius: 3,
                          fontWeight: 700,
                          textTransform: 'none',
                          fontSize: '0.875rem',
                          py: 1.5,
                          border: '2px solid',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            borderColor: '#667eea',
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                          },
                        }}
                      >
                        Sửa
                      </Button>
                    </Tooltip>
                    <Tooltip title="Xóa phòng">
                      <IconButton
                        size="medium"
                        onClick={() => handleDeleteRoom(room._id)}
                        sx={{ 
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          borderRadius: 3,
                          width: '48px',
                          height: '48px',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                          border: '2px solid transparent',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                            boxShadow: '0 6px 16px rgba(239, 68, 68, 0.5)',
                            transform: 'translateY(-2px)',
                            border: '2px solid #ef4444',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="medium" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardActions>
              </Card>
            </Zoom>
          </Box>
        ))}
      </Grid>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Paper sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
        }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ 
                background: 'linear-gradient(135deg, #374151 0%, #6b7280 100%)',
              }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Phòng</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Loại</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Giá</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sức chứa</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dọn dẹp</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow 
                    key={room._id}
                    onClick={() => handleViewRoom(room)}
                    sx={{
                      cursor: 'pointer',
                      // Làm mờ khi phòng đang bảo trì hoặc cần/đang dọn dẹp
                      opacity: (() => {
                        const shouldDim = room.status === 'maintenance' || 
                                         room.cleaningStatus === 'cleaning' || 
                                         room.cleaningStatus === 'dirty' ||
                                         room.cleaningStatus === 'maintenance_required';
                        if (shouldDim) {
                          console.log('🔍 Table row dimmed:', room.roomNumber, 'status:', room.status, 'cleaningStatus:', room.cleaningStatus);
                        }
                        return shouldDim ? 0.6 : 1;
                      })(),
                      filter: (() => {
                        const shouldFilter = room.status === 'maintenance' || 
                                            room.cleaningStatus === 'cleaning' || 
                                            room.cleaningStatus === 'dirty' ||
                                            room.cleaningStatus === 'maintenance_required';
                        return shouldFilter ? 'grayscale(0.3) saturate(0.8)' : 'none';
                      })(),
                      '&:hover': {
                        backgroundColor: 'rgba(217, 119, 6, 0.05)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(217, 119, 6, 0.15)',
                        // Khôi phục opacity và filter khi hover
                        opacity: 1,
                        filter: 'none',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Box sx={{
                          width: 60,
                          height: 40,
                          borderRadius: 2,
                          background: room.images && room.images.length > 0 
                            ? `url(${typeof room.images[0] === 'string' ? room.images[0] : (room.images[0].url || room.images[0].data || room.images[0])}) center/cover`
                            : 'linear-gradient(135deg, #374151 0%, #6b7280 100%)',
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.875rem',
                        }}>
                          {room.images && room.images.length > 0 ? '' : ''}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="700">
                            Phòng {room.roomNumber}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tầng {room.floor}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRoomTypeLabel(room.roomType)}
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="700" color="#d97706">
                        {room.basePrice.toLocaleString('vi-VN')}₫
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {room.maxOccupancy} người
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={(() => {
                          // Ưu tiên hiển thị trạng thái thực tế của phòng
                          if (room.status === 'maintenance') {
                            return 'Bảo trì';
                          }
                          if (room.cleaningStatus === 'dirty') {
                            return 'Cần dọn dẹp';
                          }
                          if (room.cleaningStatus === 'cleaning') {
                            return 'Đang dọn dẹp';
                          }
                          if (room.cleaningStatus === 'maintenance_required') {
                            return 'Cần bảo trì';
                          }
                          // Nếu không có trạng thái đặc biệt, sử dụng getRoomStatus
                          return getRoomStatus(room).label;
                        })()}
                        color={(() => {
                          // Ưu tiên màu sắc theo trạng thái thực tế
                          if (room.status === 'maintenance' || room.cleaningStatus === 'maintenance_required') {
                            return 'error';
                          }
                          if (room.cleaningStatus === 'dirty') {
                            return 'warning';
                          }
                          if (room.cleaningStatus === 'cleaning') {
                            return 'info';
                          }
                          // Nếu không có trạng thái đặc biệt, sử dụng getRoomStatus
                          return getRoomStatus(room).color;
                        })()}
                        size="medium"
                        sx={{ 
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          minWidth: '90px',
                          height: '32px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          // Tùy chỉnh màu sắc cho từng trạng thái
                          ...(room.status === 'maintenance' && {
                            backgroundColor: '#f97316',
                            color: 'white',
                            border: '2px solid #ea580c',
                          }),
                          ...(room.cleaningStatus === 'dirty' && {
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            border: '2px solid #d97706',
                          }),
                          ...(room.cleaningStatus === 'cleaning' && {
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: '2px solid #2563eb',
                          }),
                          ...(room.cleaningStatus === 'maintenance_required' && {
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: '2px solid #b91c1c',
                          }),
                          // Fallback cho getRoomStatus
                          ...(room.status !== 'maintenance' && 
                              room.cleaningStatus !== 'dirty' && 
                              room.cleaningStatus !== 'cleaning' && 
                              room.cleaningStatus !== 'maintenance_required' && {
                            ...(getRoomStatus(room).status === 'occupied' && {
                              backgroundColor: '#dc2626',
                              color: 'white',
                              border: '2px solid #b91c1c',
                            }),
                            ...(getRoomStatus(room).status === 'reserved' && {
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              border: '2px solid #d97706',
                            }),
                            ...(getRoomStatus(room).status === 'available' && {
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: '2px solid #059669',
                            }),
                          }),
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={cleaningStatusColors[room.cleaningStatus]?.label || room.cleaningStatus}
                        color={cleaningStatusColors[room.cleaningStatus]?.color || 'default'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            size="small"
                            onClick={() => handleViewRoom(room)}
                            sx={{
                              background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
                              },
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(room)}
                            sx={{
                              background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
                              },
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteRoom(room._id)}
                            sx={{
                              background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                              },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Empty State */}
      {filteredRooms.length === 0 && !loading && (
        <Paper sx={{ p: 6, textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Không tìm thấy phòng nào
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thử thay đổi bộ lọc hoặc tìm kiếm khác
          </Typography>
        </Paper>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add room"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 64,
          height: 64,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            transform: 'scale(1.1) rotate(90deg)',
            boxShadow: '0 12px 40px rgba(102, 126, 234, 0.5)',
          },
        }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon sx={{ fontSize: 32 }} />
      </Fab>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="lg" 
        fullWidth
        disableScrollLock
        sx={{
          zIndex: 9999,
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
          '& .MuiDialog-paper': {
            margin: '10px',
            maxHeight: 'calc(100vh - 20px)',
            position: 'relative',
            top: '0',
            left: '0',
            transform: 'none',
          }
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            maxHeight: 'calc(100vh - 20px)',
            display: 'flex',
            flexDirection: 'column',
            margin: '10px',
            zIndex: 9999,
            position: 'relative',
            overflow: 'visible',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #374151 0%, #d97706 100%)',
          color: 'white',
          textAlign: 'center',
          py: 3,
          borderRadius: '12px 12px 0 0',
        }}>
          <Typography variant="h6" fontWeight="bold" component="div">
            {editingRoom ? '✏️ Chỉnh sửa phòng' : '➕ Thêm phòng mới'}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
            {editingRoom ? 'Cập nhật thông tin phòng' : 'Tạo phòng mới cho khách sạn'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ 
          p: 4, 
          flex: 1,
          overflow: 'auto',
          minHeight: '500px',
          maxHeight: 'calc(100vh - 200px)',
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          position: 'relative',
          zIndex: 1,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
            borderRadius: '4px',
            '&:hover': {
              background: 'linear-gradient(135deg, #f59e0b 0%, #f59e0b 100%)',
            },
          },
        }}>
          {/* Progress Steps */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              color: '#374151', 
              mb: 2,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #374151 0%, #d97706 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Thông tin phòng
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: 2,
              mb: 3,
            }}>
              <Box sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
              }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Bước 1: Thông tin cơ bản
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={4}>
            {/* Image Upload Section */}
            <Grid item xs={12}>
              <Card sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(-2px)',
                },
              }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontWeight: 700,
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 2,
                  }}>
                    📸 Hình ảnh phòng
                    <Chip 
                      label="Tùy chọn" 
                      size="small" 
                      sx={{ 
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: 'white',
                        fontWeight: 600,
                      }} 
                    />
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Tải lên hình ảnh chất lượng cao để khách hàng có thể xem trước phòng
                  </Typography>
                </Box>
              
                {/* Upload Area */}
                <Box
                  sx={{
                    border: '2px dashed #d97706',
                    borderRadius: 3,
                    p: 4,
                    textAlign: 'center',
                    mb: 3,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      borderColor: '#f59e0b',
                      background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                      transform: 'scale(1.02)',
                      boxShadow: '0 8px 25px -5px rgba(217, 119, 6, 0.3)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                      transition: 'left 0.5s',
                    },
                    '&:hover::before': {
                      left: '100%',
                    },
                  }}
                  onClick={() => document.getElementById('image-upload').click()}
                >
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  {uploading ? (
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <CircularProgress 
                        size={50} 
                        sx={{ 
                          color: '#d97706', 
                          mb: 2,
                          '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                          },
                        }} 
                      />
                      <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                        Đang tải lên...
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Vui lòng chờ trong giây lát
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Box sx={{ 
                        mb: 3,
                        p: 2,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(217, 119, 6, 0.3)',
                      }}>
                        <UploadIcon sx={{ fontSize: 30, color: 'white' }} />
                      </Box>
                      <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 700 }}>
                        Nhấp để tải lên hình ảnh
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Hỗ trợ JPG, PNG, GIF (tối đa 10MB mỗi ảnh)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        💡 Khuyến nghị: Tải lên ít nhất 3-5 ảnh để khách hàng có cái nhìn toàn diện
                      </Typography>
                    </Box>
                  )}
                </Box>
              
                {/* Preview Images */}
                {previewImages.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: 2,
                    }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#374151' }}>
                        📷 Hình ảnh đã tải lên ({previewImages.length})
                      </Typography>
                      <Chip 
                        label={`${previewImages.length}/10`} 
                        size="small" 
                        sx={{ 
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          fontWeight: 600,
                        }} 
                      />
                    </Box>
                    <ImageList 
                      cols={4} 
                      rowHeight={120}
                      sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        '& .MuiImageListItem-root': {
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                          },
                        },
                      }}
                    >
                      {previewImages.map((image) => (
                        <ImageListItem key={image.id}>
                          <img
                            src={image.data || image.url}
                            alt={image.filename || image.name || 'Room image'}
                            style={{ 
                              borderRadius: 8,
                              objectFit: 'cover',
                              backgroundColor: '#f8fafc',
                              border: '2px solid #e2e8f0',
                            }}
                            onError={(e) => {
                              console.warn('Image load error:', image.filename);
                              e.target.style.display = 'none';
                            }}
                          />
                          <ImageListItemBar
                            title={image.filename || image.name || 'Room image'}
                            subtitle={formatFileSize(image.size || calculateBase64Size(typeof image.data === 'string' ? image.data : ''))}
                            sx={{
                              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                            }}
                            actionIcon={
                              <IconButton
                                sx={{ 
                                  color: 'white',
                                  background: 'rgba(239, 68, 68, 0.8)',
                                  '&:hover': {
                                    background: 'rgba(239, 68, 68, 1)',
                                  },
                                }}
                                onClick={() => removeImage(image.id)}
                              >
                                <CloseIcon />
                              </IconButton>
                            }
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </Box>
                )}
              </Card>
            </Grid>

            {/* Video Upload Section */}
            <Grid item xs={12}>
              <Card sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                mb: 3,
              }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    color: '#374151', 
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}>
                    🎥 Video phòng
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Tải lên video để khách hàng có thể xem tour ảo phòng
                  </Typography>
                </Box>
              
                {/* Video Upload Area */}
                <Box
                  sx={{
                    border: '2px dashed #7c3aed',
                    borderRadius: 3,
                    p: 4,
                    textAlign: 'center',
                    mb: 3,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      borderColor: '#8b5cf6',
                      background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                      transform: 'scale(1.02)',
                      boxShadow: '0 8px 25px -5px rgba(124, 58, 237, 0.3)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                      transition: 'left 0.5s',
                    },
                    '&:hover::before': {
                      left: '100%',
                    },
                  }}
                  onClick={() => document.getElementById('video-upload').click()}
                >
                  <input
                    id="video-upload"
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={handleVideoUpload}
                    style={{ display: 'none' }}
                  />
                  {uploading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={40} sx={{ color: '#8b5cf6' }} />
                      <Typography variant="body1" color="primary">
                        Đang xử lý video...
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Box sx={{ 
                        width: 60, 
                        height: 60, 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)',
                      }}>
                        <VideoLibraryIcon sx={{ fontSize: 30, color: 'white' }} />
                      </Box>
                      <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 700 }}>
                        Nhấp để tải lên video
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Hỗ trợ MP4, MOV, AVI (tối đa 50MB mỗi video)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        💡 Khuyến nghị: Tải lên video ngắn (30-60 giây) để tải nhanh
                      </Typography>
                    </Box>
                  )}
                </Box>
              
                {/* Preview Videos */}
                {previewVideos.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: 2,
                    }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#374151' }}>
                        🎥 Video đã tải lên ({previewVideos.length})
                      </Typography>
                      <Chip 
                        label={`${previewVideos.length}/5`} 
                        size="small" 
                        sx={{ 
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                          color: 'white',
                          fontWeight: 600,
                        }} 
                      />
                    </Box>
                    <Grid container spacing={2}>
                      {previewVideos.map((video) => (
                        <Grid item xs={12} sm={6} md={4} key={video.id}>
                          <Box sx={{ position: 'relative' }}>
                            <video
                              src={video.preview}
                              controls
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '2px solid #e2e8f0',
                              }}
                            />
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                background: 'rgba(239, 68, 68, 0.8)',
                                color: 'white',
                                '&:hover': {
                                  background: 'rgba(239, 68, 68, 1)',
                                },
                              }}
                              onClick={() => removeVideo(video.id)}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Card>
            </Grid>
            
            {/* Basic Information Section */}
            <Grid item xs={12}>
              <Card sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                mb: 3,
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  color: '#374151', 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  🏷️ Thông tin cơ bản
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số phòng"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      required
                      placeholder="VD: 101, 201, 301..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: 'rgba(255, 255, 255, 0.8)',
                          '&:hover fieldset': {
                            borderColor: '#d97706',
                            borderWidth: 2,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#d97706',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontWeight: 600,
                          color: '#374151',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Tầng"
                      type="number"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                      required
                      placeholder="VD: 1, 2, 3..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: 'rgba(255, 255, 255, 0.8)',
                          '&:hover fieldset': {
                            borderColor: '#d97706',
                            borderWidth: 2,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#d97706',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontWeight: 600,
                          color: '#374151',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Loại phòng"
                      value={formData.roomType}
                      onChange={(e) => {
                        const selectedRoomType = e.target.value;
                        // Set default hourly prices based on room type
                        const defaultHourlyPrices = {
                          'standard': { firstHour: 100000, additionalHour: 20000 },
                          'deluxe': { firstHour: 150000, additionalHour: 30000 },
                          'suite': { firstHour: 200000, additionalHour: 40000 },
                          'single': { firstHour: 80000, additionalHour: 15000 },
                          'presidential': { firstHour: 250000, additionalHour: 50000 }
                        };
                        
                        setFormData({ 
                          ...formData, 
                          roomType: selectedRoomType,
                          hourlyPrice: defaultHourlyPrices[selectedRoomType] || { firstHour: 100000, additionalHour: 20000 }
                        });
                      }}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      {roomTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Giá cơ bản (VNĐ)"
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: parseInt(e.target.value) })}
                      required
                      placeholder="VD: 500000, 1000000..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: 'rgba(255, 255, 255, 0.8)',
                          '&:hover fieldset': {
                            borderColor: '#d97706',
                            borderWidth: 2,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#d97706',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontWeight: 600,
                          color: '#374151',
                        },
                      }}
                    />
                  </Grid>
                  
                  {/* Giá theo giờ */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      color: '#d97706',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      🕐 Giá theo giờ (Sử dụng trong ngày)
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Giá giờ đầu (VNĐ)"
                      type="number"
                      value={formData.hourlyPrice.firstHour}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        hourlyPrice: { 
                          ...formData.hourlyPrice, 
                          firstHour: parseInt(e.target.value) 
                        } 
                      })}
                      required
                      placeholder="VD: 100000, 150000..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: 'rgba(255, 255, 255, 0.8)',
                          '&:hover fieldset': {
                            borderColor: '#d97706',
                            borderWidth: 2,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#d97706',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontWeight: 600,
                          color: '#374151',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Giá mỗi giờ tiếp theo (VNĐ)"
                      type="number"
                      value={formData.hourlyPrice.additionalHour}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        hourlyPrice: { 
                          ...formData.hourlyPrice, 
                          additionalHour: parseInt(e.target.value) 
                        } 
                      })}
                      required
                      placeholder="VD: 20000, 30000..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: 'rgba(255, 255, 255, 0.8)',
                          '&:hover fieldset': {
                            borderColor: '#d97706',
                            borderWidth: 2,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#d97706',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontWeight: 600,
                          color: '#374151',
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Số người tối đa"
                      type="number"
                      value={formData.maxOccupancy}
                      onChange={(e) => setFormData({ ...formData, maxOccupancy: parseInt(e.target.value) })}
                      required
                      placeholder="VD: 2, 4, 6..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: 'rgba(255, 255, 255, 0.8)',
                          '&:hover fieldset': {
                            borderColor: '#d97706',
                            borderWidth: 2,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#d97706',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontWeight: 600,
                          color: '#374151',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      select
                      label="Loại giường"
                      value={formData.bedType}
                      onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="single">🛏️ Giường Đơn</option>
                      <option value="double">🛏️ Giường Đôi</option>
                      <option value="queen">🛏️ Giường Queen</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Diện tích (m²)"
                      type="number"
                      value={formData.roomSize}
                      onChange={(e) => setFormData({ ...formData, roomSize: parseInt(e.target.value) })}
                      required
                      placeholder="VD: 25, 35, 50..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: 'rgba(255, 255, 255, 0.8)',
                          '&:hover fieldset': {
                            borderColor: '#d97706',
                            borderWidth: 2,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#d97706',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontWeight: 600,
                          color: '#374151',
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Description Section */}
            <Grid item xs={12}>
              <Card sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                mb: 3,
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  color: '#374151', 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  📝 Mô tả phòng
                </Typography>
                <TextField
                  fullWidth
                  label="Mô tả chi tiết về phòng"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả chi tiết về phòng, view, không gian, đặc điểm nổi bật..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.8)',
                      '&:hover fieldset': {
                        borderColor: '#d97706',
                        borderWidth: 2,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#d97706',
                        borderWidth: 2,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontWeight: 600,
                      color: '#374151',
                    },
                  }}
                />
              </Card>
            </Grid>

            {/* Amenities Section */}
            <Grid item xs={12}>
              <Card sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                mb: 3,
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  color: '#374151', 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  🛎️ Tiện nghi phòng
                  <Chip 
                    label={`${formData.amenities.length} đã chọn`} 
                    size="small" 
                    sx={{ 
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      fontWeight: 600,
                    }} 
                  />
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  background: 'rgba(248, 250, 252, 0.5)',
                  border: '1px dashed #e2e8f0',
                }}>
                  {amenities.map((amenity) => (
                    <Chip
                      key={amenity.value}
                      label={amenity.label}
                      icon={amenity.icon}
                      clickable
                      sx={{
                        background: formData.amenities.includes(amenity.value) 
                          ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'
                          : 'rgba(255, 255, 255, 0.8)',
                        color: formData.amenities.includes(amenity.value) ? 'white' : '#374151',
                        fontWeight: 600,
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)',
                        },
                      }}
                      onClick={() => {
                        const newAmenities = formData.amenities.includes(amenity.value)
                          ? formData.amenities.filter(a => a !== amenity.value)
                          : [...formData.amenities, amenity.value];
                        setFormData({ ...formData, amenities: newAmenities });
                      }}
                    />
                  ))}
                </Box>
              </Card>
            </Grid>

            {/* Status Section */}
            <Grid item xs={12}>
              <Card sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                mb: 3,
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  color: '#374151', 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  ⚙️ Trạng thái phòng
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Trạng thái"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      {Object.entries(statusColors).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value.label}
                        </option>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Trạng thái dọn dẹp"
                      value={formData.cleaningStatus}
                      onChange={(e) => setFormData({ ...formData, cleaningStatus: e.target.value })}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="clean">🧹 Sạch sẽ</option>
                      <option value="dirty">🗑️ Cần dọn dẹp</option>
                      <option value="cleaning">🔄 Đang dọn dẹp</option>
                      <option value="maintenance_required">🔧 Cần bảo trì</option>
                    </TextField>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          borderRadius: '0 0 12px 12px',
          position: 'sticky',
          bottom: 0,
          zIndex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              💡 Tip: Kiểm tra kỹ thông tin trước khi lưu
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              onClick={handleCloseDialog} 
              variant="outlined"
              sx={{ 
                borderRadius: 3,
                minWidth: 120,
                py: 1.5,
                fontWeight: 600,
                borderColor: '#6b7280',
                color: '#6b7280',
                '&:hover': {
                  borderColor: '#374151',
                  color: '#374151',
                  background: 'rgba(107, 114, 128, 0.1)',
                },
              }}
            >
              ❌ Hủy
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 3,
                minWidth: 140,
                py: 1.5,
                fontWeight: 700,
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  transition: 'left 0.6s',
                },
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                  transform: 'translateY(-2px)',
                  '&::before': {
                    left: '100%',
                  },
                },
              }}
            >
              {editingRoom ? '✅ Cập nhật' : '✨ Tạo mới'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* View Room Dialog */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '2px solid #e2e8f0',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxHeight: '95vh',
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1f2937 0%, #d97706 50%, #f59e0b 100%)',
          color: 'white',
          textAlign: 'center',
          py: 4,
          borderRadius: '16px 16px 0 0',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
            animation: 'shimmer 3s ease-in-out infinite',
          },
          '@keyframes shimmer': {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(100%)' },
          },
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" fontWeight="bold" sx={{ 
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              mb: 1,
            }}>
              Chi tiết phòng
            </Typography>
            <Typography variant="h6" sx={{ 
              opacity: 0.95, 
              fontWeight: 500,
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}>
              Phòng {viewingRoom?.roomNumber} • {getRoomTypeLabel(viewingRoom?.roomType)}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 2, 
              mt: 2,
              flexWrap: 'wrap',
            }}>
              <Chip 
                label={getRoomStatus(viewingRoom).label} 
                color={getRoomStatus(viewingRoom).color}
                sx={{ 
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }} 
              />
              <Chip 
                label={`${viewingRoom?.maxOccupancy} người`}
                sx={{ 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }} 
              />
              <Chip 
                label={`${viewingRoom?.roomSize}m²`}
                sx={{ 
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: 'white',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }} 
              />
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ 
          p: 0,
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          overflow: 'auto',
          maxHeight: 'calc(95vh - 200px)',
        }}>
          {viewingRoom && (
            <Box sx={{ p: 4 }}>
              <Grid container spacing={4}>
                {/* Top Section: Images and Basic Info */}
                <Grid item xs={12}>
                  <Grid container spacing={3}>
                    {/* Room Images */}
                    <Grid item xs={12} md={6}>
                      <Card sx={{ 
                        p: 3,
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        border: '2px solid #e2e8f0',
                        boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          boxShadow: '0 20px 40px -4px rgba(0, 0, 0, 0.15), 0 8px 16px -4px rgba(0, 0, 0, 0.1)',
                          transform: 'translateY(-4px) scale(1.02)',
                        },
                        height: '100%',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: 'linear-gradient(90deg, #d97706 0%, #f59e0b 50%, #10b981 100%)',
                        },
                      }}>
                      <Typography variant="h5" gutterBottom sx={{ 
                        fontWeight: 800,
                        color: '#1f2937',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 3,
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      }}>
                        <Box sx={{
                          p: 1,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          📸
                        </Box>
                        Hình ảnh phòng
                        <Chip 
                          label={`${viewingRoom.images?.length || 0} ảnh`} 
                          size="small" 
                          sx={{ 
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            fontWeight: 700,
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                            '&:hover': {
                              transform: 'scale(1.05)',
                            },
                            transition: 'all 0.2s ease',
                          }} 
                        />
                      </Typography>
                      
                      
                      {viewingRoom.images && viewingRoom.images.length > 0 ? (
                        <Box sx={{ 
                          position: 'relative',
                          height: 300,
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {viewingRoom.images.map((image, index) => (
                            <Box
                              key={index}
                          sx={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                            borderRadius: 3,
                            overflow: 'hidden',
                                boxShadow: `0 ${8 + index * 2}px ${25 + index * 5}px -5px rgba(0,0,0,${0.1 + index * 0.05}), 0 ${4 + index}px ${6 + index * 2}px -2px rgba(0,0,0,${0.05 + index * 0.02})`,
                                transform: `translate(${index * 8}px, ${index * 8}px) rotate(${index * 2}deg)`,
                              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'pointer',
                                zIndex: viewingRoom.images.length - index,
                              '&:hover': {
                                  transform: `translate(${index * 8}px, ${index * 8 - 10}px) rotate(${index * 2}deg) scale(1.05)`,
                                  zIndex: 10,
                                  boxShadow: `0 ${20 + index * 5}px ${40 + index * 10}px -4px rgba(0,0,0,0.2), 0 ${8 + index * 2}px ${16 + index * 4}px -4px rgba(0,0,0,0.1)`,
                                },
                              }}
                              onClick={() => setImageViewer({ 
                                open: true, 
                                images: viewingRoom.images, 
                                currentIndex: index 
                              })}
                            >
                              <img
                                src={typeof image === 'string' ? image : (image.url || image.data || image)} 
                                alt={`Phòng ${viewingRoom.roomNumber} - Ảnh ${index + 1}`}
                                style={{ 
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  filter: 'brightness(1.05) contrast(1.02)',
                                  backgroundColor: '#f8fafc',
                                  border: '2px solid #e2e8f0',
                                }}
                                onError={(e) => {
                                  console.error('Image load error:', image);
                                  e.target.style.display = 'none';
                                }}
                              />
                              {index === 0 && viewingRoom.images.length > 1 && (
                              <Box sx={{
                                position: 'absolute',
                                  top: 12,
                                  right: 12,
                                  background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                                  color: 'white',
                                  px: 2,
                                  py: 1,
                                  borderRadius: 3,
                                  fontSize: '0.875rem',
                                  fontWeight: 700,
                                  zIndex: 2,
                                  boxShadow: '0 4px 12px rgba(217, 119, 6, 0.4)',
                                  border: '2px solid rgba(255,255,255,0.2)',
                                }}>
                                  +{viewingRoom.images.length - 1} ảnh
                                </Box>
                              )}
                              </Box>
                          ))}
                        </Box>
                      ) : (
                        <Box sx={{ 
                          border: '3px dashed #cbd5e1',
                          borderRadius: 4,
                          p: 6,
                          textAlign: 'center',
                          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                          minHeight: 250,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(45deg, rgba(217, 119, 6, 0.05) 0%, transparent 50%, rgba(16, 185, 129, 0.05) 100%)',
                            animation: 'shimmer 2s ease-in-out infinite',
                          },
                          '@keyframes shimmer': {
                            '0%': { transform: 'translateX(-100%)' },
                            '100%': { transform: 'translateX(100%)' },
                          },
                        }}>
                          <Box sx={{
                            p: 4,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                            mb: 3,
                            boxShadow: '0 8px 25px -5px rgba(0,0,0,0.1)',
                            position: 'relative',
                            zIndex: 1,
                          }}>
                          </Box>
                          <Typography variant="h5" color="text.secondary" gutterBottom sx={{ 
                            fontWeight: 700,
                            position: 'relative',
                            zIndex: 1,
                          }}>
                            Chưa có hình ảnh
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ 
                            mb: 3,
                            position: 'relative',
                            zIndex: 1,
                          }}>
                            Phòng này chưa được tải lên hình ảnh nào
                          </Typography>
                          <Button
                            variant="contained"
                            size="large"
                            startIcon={<UploadIcon />}
                            sx={{
                              borderRadius: 3,
                              background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                              color: 'white',
                              fontWeight: 700,
                              px: 4,
                              py: 1.5,
                              boxShadow: '0 8px 25px -5px rgba(217, 119, 6, 0.4)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 12px 35px -5px rgba(217, 119, 6, 0.5)',
                              },
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              position: 'relative',
                              zIndex: 1,
                            }}
                            onClick={() => {
                              // Close view dialog and open edit dialog
                              setViewDialog(false);
                              handleOpenDialog(viewingRoom);
                            }}
                          >
                            Thêm hình ảnh
                          </Button>
                        </Box>
                      )}
                    </Card>
                  </Grid>

                  {/* Videos Section */}
                  <Grid item xs={12}>
                    <Card sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mb: 3,
                      }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: '#374151',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}>
                          🎥 Video phòng
                        </Typography>
                        <Chip 
                          label={`${viewingRoom.videos?.length || 0} video`} 
                          size="small" 
                          sx={{ 
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                            color: 'white',
                            fontWeight: 600,
                          }} 
                        />
                      </Box>
                      
                      {viewingRoom.videos && viewingRoom.videos.length > 0 ? (
                        <Grid container spacing={2}>
                          {viewingRoom.videos.map((video, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                              <Box sx={{ position: 'relative' }}>
                                <video
                                  src={video}
                                  controls
                                  style={{
                                    width: '100%',
                                    height: '200px',
                                    objectFit: 'cover',
                                    borderRadius: '12px',
                                    border: '2px solid #e2e8f0',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                  }}
                                />
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Box sx={{ 
                          border: '3px dashed #cbd5e1',
                          borderRadius: 4,
                          p: 6,
                          textAlign: 'center',
                          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                          minHeight: 200,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Box sx={{
                            p: 3,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                            mb: 2,
                          }}>
                          </Box>
                          <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 700 }}>
                            Chưa có video
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Phòng này chưa được tải lên video nào
                          </Typography>
                        </Box>
                      )}
                    </Card>
                  </Grid>

                  {/* Room Information */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      p: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
                        transform: 'translateY(-2px)',
                      },
                      height: '100%',
                    }}>
                      <Typography variant="h6" gutterBottom sx={{ 
                        fontWeight: 700,
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 3,
                      }}>
                        🏷️ Thông tin cơ bản
                      </Typography>
                      <Stack spacing={2}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 2,
                          borderRadius: 2,
                          background: 'rgba(248, 250, 252, 0.5)',
                          border: '1px solid #e2e8f0',
                        }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Số phòng:
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="primary.main">
                            {viewingRoom.roomNumber}
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 2,
                          borderRadius: 2,
                          background: 'rgba(248, 250, 252, 0.5)',
                          border: '1px solid #e2e8f0',
                        }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Tầng:
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            Tầng {viewingRoom.floor}
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 2,
                          borderRadius: 2,
                          background: 'rgba(248, 250, 252, 0.5)',
                          border: '1px solid #e2e8f0',
                        }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Loại phòng:
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {getRoomTypeLabel(viewingRoom.roomType)}
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 2,
                          borderRadius: 2,
                          background: 'rgba(248, 250, 252, 0.5)',
                          border: '1px solid #e2e8f0',
                        }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Diện tích:
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {viewingRoom.roomSize}m²
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 2,
                          borderRadius: 2,
                          background: 'rgba(248, 250, 252, 0.5)',
                          border: '1px solid #e2e8f0',
                        }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Sức chứa:
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {viewingRoom.maxOccupancy} người
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>

              {/* Bottom Section: Price/Status and Amenities */}
              <Grid item xs={12}>
                <Grid container spacing={3}>
                  {/* Price and Status Info */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      p: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
                        transform: 'translateY(-2px)',
                      },
                      height: '100%',
                    }}>
                      <Typography variant="h6" gutterBottom sx={{ 
                        fontWeight: 700,
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 3,
                      }}>
                        Thông tin giá & Trạng thái
                      </Typography>
                      <Stack spacing={2}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 2,
                      background: 'rgba(248, 250, 252, 0.5)',
                      border: '1px solid #e2e8f0',
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Giá cơ bản:
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" color="success.main">
                        {formatPrice(viewingRoom.basePrice)}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 2,
                      background: 'rgba(248, 250, 252, 0.5)',
                      border: '1px solid #e2e8f0',
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Trạng thái:
                      </Typography>
                      <Chip
                        label={statusColors[viewingRoom.status]?.label}
                        color={statusColors[viewingRoom.status]?.color}
                        size="medium"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 2,
                      background: 'rgba(248, 250, 252, 0.5)',
                      border: '1px solid #e2e8f0',
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Tình trạng dọn dẹp:
                      </Typography>
                      <Chip
                        label={cleaningStatusColors[viewingRoom.cleaningStatus]?.label}
                        color={cleaningStatusColors[viewingRoom.cleaningStatus]?.color}
                        size="medium"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                      </Stack>
                    </Card>
                  </Grid>

                  {/* Amenities */}
                  <Grid item xs={12} md={6}>
                <Card sx={{ 
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                  height: '100%',
                }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontWeight: 700,
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 3,
                  }}>
                    🛎️ Tiện nghi phòng
                    <Chip 
                      label={`${viewingRoom.amenities?.length || 0} tiện nghi`} 
                      size="small" 
                      sx={{ 
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        fontWeight: 600,
                      }} 
                    />
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(248, 250, 252, 0.5)',
                    border: '1px dashed #e2e8f0',
                    minHeight: 60,
                    alignItems: 'center',
                    justifyContent: viewingRoom.amenities?.length ? 'flex-start' : 'center',
                  }}>
                    {viewingRoom.amenities?.length > 0 ? (
                      viewingRoom.amenities.map((amenity, index) => (
                        <Chip
                          key={index}
                          label={getAmenityLabel(amenity)}
                          sx={{
                            background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                            color: 'white',
                            fontWeight: 600,
                            border: '1px solid #e2e8f0',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)',
                            },
                          }}
                        />
                      ))
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: 'text.secondary',
                        fontStyle: 'italic',
                      }}>
                        <Typography variant="body2">
                          📝 Chưa có tiện nghi nào được thêm
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Card>
                  </Grid>
                </Grid>
              </Grid>

              {/* Description */}
              {viewingRoom.description && (
                <Grid item xs={12}>
                  <Card sx={{ 
                    p: 3,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    border: '1px solid #e2e8f0',
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      📝 Mô tả
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {viewingRoom.description}
                    </Typography>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setViewDialog(false)} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Đóng
          </Button>
          <Button 
            onClick={() => {
              setViewDialog(false);
              handleOpenDialog(viewingRoom);
            }}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                transition: 'left 0.5s',
              },
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                '&::before': {
                  left: '100%',
                },
              },
            }}
          >
            Chỉnh sửa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      {console.log('Snackbar render state:', snackbar)}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Image Viewer Dialog */}
      <Dialog
        open={imageViewer.open}
        onClose={() => setImageViewer({ open: false, images: [], currentIndex: 0 })}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #000000 0%, #1f2937 100%)',
            border: '2px solid #374151',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
            maxHeight: '95vh',
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
          color: 'white',
          textAlign: 'center',
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Typography variant="h6" fontWeight="bold">
            🖼️ Xem hình ảnh phòng
          </Typography>
          <IconButton
            onClick={() => setImageViewer({ open: false, images: [], currentIndex: 0 })}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {imageViewer.images.length > 0 && (
            <Box sx={{ position: 'relative', height: '70vh' }}>
              <img
                src={imageViewer.images[imageViewer.currentIndex]} // Now just URL string
                alt={`Phòng ${viewingRoom?.roomNumber} - Ảnh ${imageViewer.currentIndex + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: 8,
                }}
                onError={(e) => {
                  console.warn('Image load error in viewer:', imageViewer.currentIndex);
                  e.target.style.display = 'none';
                }}
              />
              
              {/* Navigation Arrows */}
              {imageViewer.images.length > 1 && (
                <>
                  <IconButton
                    onClick={() => setImageViewer(prev => ({
                      ...prev,
                      currentIndex: prev.currentIndex > 0 ? prev.currentIndex - 1 : prev.images.length - 1
                    }))}
                    sx={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      '&:hover': {
                        background: 'rgba(0, 0, 0, 0.9)',
                        transform: 'translateY(-50%) scale(1.1)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <NavigateBeforeIcon />
                  </IconButton>
                  
                  <IconButton
                    onClick={() => setImageViewer(prev => ({
                      ...prev,
                      currentIndex: prev.currentIndex < prev.images.length - 1 ? prev.currentIndex + 1 : 0
                    }))}
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      '&:hover': {
                        background: 'rgba(0, 0, 0, 0.9)',
                        transform: 'translateY(-50%) scale(1.1)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <NavigateNextIcon />
                  </IconButton>
                </>
              )}
              
              {/* Image Counter */}
              <Box sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                px: 3,
                py: 1,
                borderRadius: 20,
                fontSize: '0.875rem',
                fontWeight: 600,
              }}>
                {imageViewer.currentIndex + 1} / {imageViewer.images.length}
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
          p: 2,
          justifyContent: 'center',
        }}>
          <Button
            onClick={() => setImageViewer({ open: false, images: [], currentIndex: 0 })}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
              color: 'white',
              fontWeight: 600,
              px: 4,
              py: 1,
              borderRadius: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </ResponsiveContainer>
  );
};

export default RoomManagement;