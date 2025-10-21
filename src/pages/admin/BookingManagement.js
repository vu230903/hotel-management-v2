import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
  Badge,
  Tooltip,
  Fade,
  Zoom,
  Tabs,
  Tab,
  LinearProgress,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Login as CheckInIcon,
  Logout as CheckOutIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Hotel as HotelIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Room as RoomIcon,
  Event as EventIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon,
  CalendarMonth as CalendarMonthIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Star as StarIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
  DateRange as DateRangeIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { bookingsAPI, roomsAPI, usersAPI } from '../../services/api';
import ResponsiveContainer from '../../components/common/ResponsiveContainer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusChip from '../../components/common/StatusChip';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table', 'calendar', 'timeline'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month'); // 'month', 'week', 'day'
  const [sortBy, setSortBy] = useState('checkIn');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const [viewDialog, setViewDialog] = useState({ open: false, booking: null });
  const [customerDialog, setCustomerDialog] = useState({ open: false, customer: null });
  const [customerFormData, setCustomerFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'male',
    notes: ''
  });
  
  // Dialog states for actions
  const [checkInDialog, setCheckInDialog] = useState({ open: false, booking: null, roomKey: '', checkInTime: '13:00' });
  const [checkOutDialog, setCheckOutDialog] = useState({ open: false, booking: null, roomCondition: 'good', checkOutTime: '12:00' });
  
  // Selected bookings for bulk actions
  const [selectedBookings, setSelectedBookings] = useState([]);
  

  const [formData, setFormData] = useState({
    customer: '',
    room: '',
    checkIn: '',
    checkOut: '',
    checkInTime: '13:00',
    checkOutTime: '12:00',
    guests: {
      adults: 1,
      children: 0
    },
    roomPrice: 0,
    totalAmount: 0,
    payment: {
      method: 'cash',
      status: 'pending'
    },
    notes: '',
    status: 'pending'
  });

  const statusColors = {
    pending: { color: 'warning', label: 'Chờ xử lý' },
    confirmed: { color: 'info', label: 'Đã xác nhận' },
    checked_in: { color: 'success', label: 'Đã check-in' },
    checked_out: { color: 'default', label: 'Đã check-out' },
    cancelled: { color: 'error', label: 'Đã hủy' },
    no_show: { color: 'secondary', label: 'Không đến' },
  };

  const paymentMethods = [
    { value: 'cash', label: 'Tiền mặt' },
    { value: 'card', label: 'Thẻ' },
    { value: 'bank_transfer', label: 'Chuyển khoản' },
    { value: 'online', label: 'Online' },
  ];

  const paymentStatusColors = {
    pending: { color: 'warning', label: 'Chờ thanh toán' },
    paid: { color: 'success', label: 'Đã thanh toán' },
    failed: { color: 'error', label: 'Thanh toán thất bại' },
    refunded: { color: 'info', label: 'Đã hoàn tiền' },
  };

  useEffect(() => {
    fetchData();
    
    // Listen for room updates
    const handleRoomUpdate = (event) => {
      console.log('📢 Room updated, refreshing bookings...', event.detail);
      setTimeout(async () => {
        console.log('🔄 Forcing booking refresh after room update...');
        await fetchData();
        console.log('✅ Booking data refreshed');
      }, 500);
    };
    
    // Listen for new bookings
    const handleNewBooking = (event) => {
      console.log('📢 New booking created, refreshing bookings...', event.detail);
      setTimeout(async () => {
        console.log('🔄 Forcing booking refresh after new booking...');
        await fetchData();
        console.log('✅ Booking data refreshed');
      }, 500);
    };
    
    // Add event listeners
    window.addEventListener('roomUpdated', handleRoomUpdate);
    window.addEventListener('newBookingCreated', handleNewBooking);
    
    return () => {
      window.removeEventListener('roomUpdated', handleRoomUpdate);
      window.removeEventListener('newBookingCreated', handleNewBooking);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [bookingsRes, roomsRes, customersRes] = await Promise.all([
        bookingsAPI.getBookings({ limit: 1000 }),
        roomsAPI.getRooms({ limit: 100 }),
        usersAPI.getUsers({ role: 'customer', limit: 1000 })
      ]);
      
      const bookings = bookingsRes.data?.data?.bookings || [];
      const rooms = roomsRes.data?.data?.rooms || [];
      const customers = customersRes.data?.data?.users || [];
      
      setBookings(bookings);
      setRooms(rooms);
      setCustomers(customers);
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Lỗi khi tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (booking = null) => {
    if (booking) {
      setEditingBooking(booking);
      // Kiểm tra customer có tồn tại trong danh sách không
      const customerId = booking.customer?._id || booking.customer || '';
      const customerExists = customers.find(c => c._id === customerId);
      
      const formDataToSet = {
        customer: customerExists ? customerId : '', // Reset nếu không tồn tại
        room: booking.room?._id || booking.room,
        checkIn: booking.checkIn ? new Date(booking.checkIn).toISOString().split('T')[0] : '',
        checkOut: booking.checkOut ? new Date(booking.checkOut).toISOString().split('T')[0] : '',
        checkInTime: '13:00', // Cố định 13:00
        checkOutTime: booking.checkOutTime || '12:00',
        guests: booking.guests || { adults: 1, children: 0 },
        roomPrice: booking.roomPrice || 0,
        totalAmount: booking.totalAmount || 0,
        payment: booking.payment || { method: 'cash', status: 'pending' },
        notes: booking.notes || '',
        status: booking.status || 'pending'
      };
      setFormData(formDataToSet);
    } else {
      setEditingBooking(null);
      const formDataToSet = {
        customer: '',
        room: '',
        checkIn: '',
        checkOut: '',
        checkInTime: '13:00',
        checkOutTime: '12:00',
        guests: { adults: 1, children: 0 },
        roomPrice: 0,
        totalAmount: 0,
        payment: { method: 'cash', status: 'pending' },
        notes: '',
        status: 'pending'
      };
      setFormData(formDataToSet);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBooking(null);
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.customer) {
        showSnackbar('Vui lòng chọn khách hàng', 'error');
        return;
      }
      if (!formData.room) {
        showSnackbar('Vui lòng chọn phòng', 'error');
        return;
      }
      if (!formData.checkIn) {
        showSnackbar('Vui lòng chọn ngày nhận phòng', 'error');
        return;
      }
      if (!formData.checkOut) {
        showSnackbar('Vui lòng chọn ngày trả phòng', 'error');
        return;
      }
      if (new Date(formData.checkIn) > new Date(formData.checkOut)) {
        showSnackbar('Ngày trả phòng không thể trước ngày nhận phòng', 'error');
        return;
      }
      
      // Cho phép đặt phòng cùng ngày bất kể giờ nào
      // Giờ check-in sẽ được điều chỉnh khi thực hiện check-in

      // Calculate total amount
      const selectedRoom = rooms.find(r => r._id === formData.room);
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      const timeDiff = checkOutDate - checkInDate;
      const nights = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24))); // Có thể 0 đêm (sử dụng trong ngày)
      
      let totalAmount = 0;
      if (selectedRoom) {
        if (nights === 0) {
          // Sử dụng trong ngày - tính theo giờ với giá cố định
          const checkInTime = new Date(`${formData.checkIn}T${formData.checkInTime || '13:00'}`);
          const checkOutTime = new Date(`${formData.checkOut}T${formData.checkOutTime || '12:00'}`);
          const hoursDiff = Math.max(1, Math.ceil((checkOutTime - checkInTime) / (1000 * 60 * 60))); // Tối thiểu 1 giờ
          
          // Sử dụng giá theo giờ từ room data
          const rates = selectedRoom.hourlyPrice || {
            firstHour: 100000,
            additionalHour: 20000
          };
          
          if (hoursDiff === 1) {
            totalAmount = rates.firstHour;
          } else {
            totalAmount = rates.firstHour + (rates.additionalHour * (hoursDiff - 1));
          }
        } else {
          // Qua đêm - tính theo đêm
          totalAmount = selectedRoom.basePrice * nights;
        }
      }

      // Tạo mã đặt phòng tự động chỉ khi tạo mới
      const bookingNumber = editingBooking ? editingBooking.bookingNumber : `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const bookingData = {
        ...formData,
        bookingNumber,
        totalAmount,
        guestCount: formData.guests.adults + formData.guests.children,
        checkIn: formData.checkIn, // Sửa từ checkInDate thành checkIn
        checkOut: formData.checkOut, // Sửa từ checkOutDate thành checkOut
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime,
        paymentMethod: formData.payment.method,
        'payment.status': formData.payment.status,
      };

      console.log('Frontend sending bookingData:', bookingData);
      console.log('Frontend guests object:', bookingData.guests);

      if (editingBooking) {
        const response = await bookingsAPI.updateBookingStatus(editingBooking._id, bookingData);
        
        // Cập nhật local state thay vì fetchData
        if (response.data && response.data.booking) {
          setBookings(prevBookings => 
            prevBookings.map(b => 
              b._id === editingBooking._id 
                ? { ...b, ...response.data.booking }
                : b
            )
          );
          
          // Dispatch event for auto-refresh
          window.dispatchEvent(new CustomEvent('bookingStatusUpdated', { 
            detail: { bookingId: editingBooking._id, action: 'updated' } 
          }));
        } else {
          // Fallback: fetch data nếu response không có data
          console.log('No booking data in response, fetching data...');
          // Không gọi fetchData() để tránh infinite loop
          showSnackbar('Cập nhật đặt phòng thành công!');
          
          // Dispatch event for auto-refresh
          window.dispatchEvent(new CustomEvent('bookingStatusUpdated', { 
            detail: { bookingId: editingBooking._id, action: 'updated' } 
          }));
        }
        
        showSnackbar('Cập nhật đặt phòng thành công!');
      } else {
        const response = await bookingsAPI.createBooking(bookingData);
        
        console.log('Create booking response:', response);
        
        // Cập nhật local state thay vì fetchData
        if (response.data && response.data.booking) {
          setBookings(prevBookings => [response.data.booking, ...prevBookings]);
          showSnackbar(`Tạo đặt phòng ${response.data.booking.bookingNumber || 'mới'} thành công!`);
          
          // Dispatch event for auto-refresh
          window.dispatchEvent(new CustomEvent('newBookingCreated', { 
            detail: { bookingId: response.data.booking._id, action: 'created' } 
          }));
        } else {
          // Fallback: fetch data nếu response không có data
          console.log('No booking data in response, fetching data...');
          // Không gọi fetchData() để tránh infinite loop
          showSnackbar('Tạo đặt phòng mới thành công!');
          
          // Dispatch event for auto-refresh
          window.dispatchEvent(new CustomEvent('newBookingCreated', { 
            detail: { action: 'created' } 
          }));
        }
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving booking:', error);
      const errorMessage = error.response?.data?.message || 'Lỗi khi lưu đặt phòng';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleDelete = async (bookingId) => {
    const booking = bookings.find(b => b._id === bookingId);
    if (!booking) {
      showSnackbar('Không tìm thấy đặt phòng', 'error');
      return;
    }

    // Phân biệt giữa "Hủy" và "Xóa"
    if (booking.status === 'pending' || booking.status === 'confirmed') {
      // Hủy đặt phòng
      const confirmMessage = `Bạn có chắc chắn muốn hủy đặt phòng ${booking.bookingNumber}?\n\nKhách hàng: ${booking.customer?.fullName || 'N/A'}\nPhòng: ${booking.room?.roomNumber || 'N/A'}\nTrạng thái: ${booking.status}`;
      
      if (window.confirm(confirmMessage)) {
        try {
          await bookingsAPI.cancelBooking(bookingId);
          
          // Cập nhật local state thay vì fetchData
          setBookings(prevBookings => 
            prevBookings.map(b => 
              b._id === bookingId 
                ? { ...b, status: 'cancelled' }
                : b
            )
          );
          
          showSnackbar(`Hủy đặt phòng ${booking.bookingNumber} thành công!`);
        } catch (error) {
          console.error('Error cancelling booking:', error);
          const errorMessage = error.response?.data?.message || 'Lỗi khi hủy đặt phòng';
          showSnackbar(errorMessage, 'error');
        }
      }
    } else if (booking.status === 'cancelled' || booking.status === 'checked_out') {
      // Xóa đặt phòng
      const confirmMessage = `Bạn có chắc chắn muốn XÓA VĨNH VIỄN đặt phòng ${booking.bookingNumber}?\n\nKhách hàng: ${booking.customer?.fullName || 'N/A'}\nPhòng: ${booking.room?.roomNumber || 'N/A'}\nTrạng thái: ${booking.status}\n\n⚠️ Hành động này không thể hoàn tác!`;
      
      if (window.confirm(confirmMessage)) {
        try {
          await bookingsAPI.deleteBooking(bookingId);
          
          // Cập nhật local state thay vì fetchData
          setBookings(prevBookings => 
            prevBookings.filter(b => b._id !== bookingId)
          );
          
          showSnackbar(`Xóa đặt phòng ${booking.bookingNumber} thành công!`);
        } catch (error) {
          console.error('Error deleting booking:', error);
          const errorMessage = error.response?.data?.message || 'Lỗi khi xóa đặt phòng';
          showSnackbar(errorMessage, 'error');
        }
      }
    } else {
      showSnackbar('Không thể thực hiện hành động này với trạng thái hiện tại', 'error');
    }
  };

  const handleCheckIn = (bookingId) => {
    const booking = bookings.find(b => b._id === bookingId);
    if (!booking) {
      showSnackbar('Không tìm thấy đặt phòng', 'error');
      return;
    }
    
    // Tự động lấy thời gian hiện tại
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    setCheckInDialog({
      open: true, 
      booking, 
      roomKey: booking.room?.roomNumber || '',
      checkInTime: currentTime // Tự động lấy giờ hiện tại
    });
  };

  const handleConfirmCheckIn = async () => {
    try {
      const { booking, roomKey, checkInTime } = checkInDialog;
      if (!roomKey.trim()) {
        showSnackbar('Mã phòng không được để trống', 'error');
        return;
      }

      const additionalGuests = []; // Có thể thêm logic để nhập khách bổ sung
      
      const response = await bookingsAPI.checkIn(booking._id, { 
        roomKey: roomKey.trim(),
        additionalGuests,
        checkInTime: checkInTime.trim()
      });
      
      // Cập nhật local state thay vì fetchData
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b._id === booking._id 
            ? { ...b, status: 'checked_in', checkInInfo: response.data?.checkInInfo }
            : b
        )
      );
      
      showSnackbar(`Check-in thành công cho phòng ${roomKey} lúc ${checkInTime}!`);
      setCheckInDialog({ open: false, booking: null, roomKey: '', checkInTime: '13:00' });
    } catch (error) {
      console.error('Error checking in:', error);
      const errorMessage = error.response?.data?.message || 'Lỗi khi check-in';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleCheckOut = (bookingId) => {
    const booking = bookings.find(b => b._id === bookingId);
    if (!booking) {
      showSnackbar('Không tìm thấy đặt phòng', 'error');
      return;
    }
    
    // Tự động lấy thời gian hiện tại
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    setCheckOutDialog({ 
      open: true, 
      booking, 
      roomCondition: 'good',
      checkOutTime: currentTime // Tự động lấy giờ hiện tại
    });
  };

  const handleConfirmCheckOut = async () => {
    try {
      const { booking, roomCondition, checkOutTime } = checkOutDialog;
      if (!roomCondition || !['good', 'damaged', 'needs_cleaning', 'needs_maintenance'].includes(roomCondition)) {
        showSnackbar('Tình trạng phòng không hợp lệ', 'error');
        return;
      }

      const damages = []; // Có thể thêm logic để nhập danh sách hư hỏng
      
      const response = await bookingsAPI.checkOut(booking._id, { 
        roomCondition: roomCondition.trim(),
        damages,
        checkOutTime: checkOutTime.trim()
      });
      
      // Cập nhật local state thay vì fetchData
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b._id === booking._id 
            ? { 
                ...b, 
                status: 'checked_out', 
                checkOutInfo: response.data?.checkOutInfo,
                totalAmount: response.data?.totalAmount || b.totalAmount, // Cập nhật tổng tiền mới
                payment: {
                  ...b.payment,
                  amount: response.data?.totalAmount || b.totalAmount
                }
              }
            : b
        )
      );
      
      // Dispatch event để RoomManagement refresh
      window.dispatchEvent(new CustomEvent('bookingStatusUpdated', { 
        detail: { bookingId: booking._id, newStatus: 'checked_out' } 
      }));
      
      showSnackbar(`Check-out thành công! Phòng ${booking.room?.roomNumber} lúc ${checkOutTime} - Tình trạng: ${roomCondition}`);
      setCheckOutDialog({ open: false, booking: null, roomCondition: 'good', checkOutTime: '12:00' });
    } catch (error) {
      console.error('Error checking out:', error);
      const errorMessage = error.response?.data?.message || 'Lỗi khi check-out';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    const booking = bookings.find(b => b._id === bookingId);
    if (!booking) {
      showSnackbar('Không tìm thấy đặt phòng', 'error');
      return;
    }

    const confirmMessage = `Xác nhận đặt phòng ${booking.bookingNumber}?\n\nKhách hàng: ${booking.customer?.fullName || 'N/A'}\nPhòng: ${booking.room?.roomNumber || 'N/A'}\nTổng tiền: ${booking.totalAmount?.toLocaleString()}đ`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await bookingsAPI.updateBookingStatus(bookingId, { status: 'confirmed' });
        
        // Cập nhật local state thay vì fetchData
        setBookings(prevBookings => 
          prevBookings.map(b => 
            b._id === bookingId 
              ? { ...b, status: 'confirmed' }
              : b
          )
        );
        
        // Trigger refresh cho Room Management nếu đang mở
        window.dispatchEvent(new CustomEvent('bookingStatusUpdated', { 
          detail: { bookingId, newStatus: 'confirmed' } 
        }));
        
        showSnackbar(`Xác nhận đặt phòng ${booking.bookingNumber} thành công!`);
      } catch (error) {
        console.error('Error confirming booking:', error);
        const errorMessage = error.response?.data?.message || 'Lỗi khi xác nhận đặt phòng';
        showSnackbar(errorMessage, 'error');
      }
    }
  };

  // Selection handlers
  const handleSelectBooking = (bookingId) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBookings.length === sortedBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(sortedBookings.map(booking => booking._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBookings.length === 0) {
      showSnackbar('Vui lòng chọn ít nhất một đặt phòng để xóa', 'error');
      return;
    }

    const confirmMessage = `Bạn có chắc chắn muốn xóa ${selectedBookings.length} đặt phòng đã chọn?\n\n⚠️ Hành động này không thể hoàn tác!`;
    if (window.confirm(confirmMessage)) {
      try {
        // Xóa từng booking
        for (const bookingId of selectedBookings) {
          await bookingsAPI.deleteBooking(bookingId);
        }
        showSnackbar(`Đã xóa thành công ${selectedBookings.length} đặt phòng!`);
        setSelectedBookings([]);
        // Không gọi fetchData() để tránh infinite loop
      } catch (error) {
        console.error('Error bulk deleting bookings:', error);
        showSnackbar('Lỗi khi xóa đặt phòng', 'error');
      }
    }
  };


  const handleDeleteAll = async () => {
    if (sortedBookings.length === 0) {
      showSnackbar('Không có đặt phòng nào để xóa', 'error');
      return;
    }

    const confirmMessage = `Bạn có chắc chắn muốn XÓA VĨNH VIỄN TẤT CẢ ${sortedBookings.length} đặt phòng?\n\n⚠️ Hành động này không thể hoàn tác!`;
    if (window.confirm(confirmMessage)) {
      try {
        // Xóa tất cả bookings
        for (const booking of sortedBookings) {
          await bookingsAPI.deleteBooking(booking._id);
        }
        showSnackbar(`Đã xóa thành công tất cả ${sortedBookings.length} đặt phòng!`);
        setSelectedBookings([]);
        // Không gọi fetchData() để tránh infinite loop
      } catch (error) {
        console.error('Error deleting all bookings:', error);
        showSnackbar('Lỗi khi xóa tất cả đặt phòng', 'error');
      }
    }
  };

  const handleTogglePaymentStatus = async (bookingId) => {
    const booking = bookings.find(b => b._id === bookingId);
    if (!booking) {
      showSnackbar('Không tìm thấy đặt phòng', 'error');
      return;
    }

    const currentStatus = booking.payment?.status || 'pending';
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    
    try {
      await bookingsAPI.updatePaymentStatus(bookingId, newStatus);
      
      // Cập nhật local state thay vì fetchData
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b._id === bookingId 
            ? { ...b, payment: { ...b.payment, status: newStatus } }
            : b
        )
      );
      
      showSnackbar(`Đã ${newStatus === 'paid' ? 'xác nhận' : 'hủy'} thanh toán cho đặt phòng ${booking.bookingNumber}!`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      const errorMessage = error.response?.data?.message || 'Lỗi khi cập nhật trạng thái thanh toán';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleViewBooking = (booking) => {
    setViewDialog({ open: true, booking });
  };

  const handleCloseViewDialog = () => {
    setViewDialog({ open: false, booking: null });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };


  const handleOpenCustomerDialog = () => {
    setCustomerFormData({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      gender: 'male',
      notes: ''
    });
    setCustomerDialog({ open: true, customer: null });
  };

  const handleCloseCustomerDialog = () => {
    setCustomerDialog({ open: false, customer: null });
  };

  const handleCreateCustomer = async () => {
    try {
      // Validation
      if (!customerFormData.fullName.trim()) {
        showSnackbar('Vui lòng nhập họ và tên', 'error');
        return;
      }
      if (!customerFormData.email.trim()) {
        showSnackbar('Vui lòng nhập email', 'error');
        return;
      }
      if (!customerFormData.phone.trim()) {
        showSnackbar('Vui lòng nhập số điện thoại', 'error');
        return;
      }

      // Check if email already exists
      const existingCustomer = customers.find(c => c.email === customerFormData.email);
      if (existingCustomer) {
        showSnackbar('Email này đã tồn tại trong hệ thống', 'error');
        return;
      }

      const customerData = {
        ...customerFormData,
        role: 'customer',
        status: 'active',
        isActive: true,
        password: '123456', // Default password
      };

      const response = await usersAPI.createUser(customerData);
      const newCustomer = response.data;
      
      // Add to customers list
      setCustomers([...customers, newCustomer]);
      
      // Set as selected customer in booking form
      setFormData({ ...formData, customer: newCustomer._id });
      
      showSnackbar('Tạo khách hàng mới thành công!');
      handleCloseCustomerDialog();
    } catch (error) {
      console.error('Error creating customer:', error);
      const errorMessage = error.response?.data?.message || 'Lỗi khi tạo khách hàng mới';
      showSnackbar(errorMessage, 'error');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    // Basic search
    const matchesSearch = !searchTerm || 
      booking.bookingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.room?.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    
    let matchesDate = true;
    if (filterDate !== 'all') {
      const today = new Date();
      const checkInDate = new Date(booking.checkInDate || booking.checkIn);
      const checkOutDate = new Date(booking.checkOutDate || booking.checkOut);
      
      switch (filterDate) {
        case 'today':
          matchesDate = checkInDate.toDateString() === today.toDateString();
          break;
        case 'this_week':
          const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
          matchesDate = checkInDate >= weekStart;
          break;
        case 'this_month':
          matchesDate = checkInDate.getMonth() === today.getMonth() && 
                       checkInDate.getFullYear() === today.getFullYear();
          break;
        default:
          matchesDate = true;
      }
    }

    const result = matchesSearch && matchesStatus && matchesDate;
    
    return result;
  });
  
  console.log('📊 Total bookings:', bookings.length);
  console.log('🔍 Filtered bookings:', filteredBookings.length);
  console.log('📋 Filtered bookings data:', filteredBookings);
  
  const sortedBookings = filteredBookings.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'checkIn':
        aValue = new Date(a.checkInDate || a.checkIn);
        bValue = new Date(b.checkInDate || b.checkIn);
        break;
      case 'checkOut':
        aValue = new Date(a.checkOutDate || a.checkOut);
        bValue = new Date(b.checkOutDate || b.checkOut);
        break;
      case 'totalAmount':
        aValue = a.totalAmount || 0;
        bValue = b.totalAmount || 0;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'customer':
        aValue = a.customer?.fullName || '';
        bValue = b.customer?.fullName || '';
        break;
      default:
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };



  const getCustomerName = (customer) => {
    if (customer && typeof customer === 'object' && customer.fullName) {
      return customer.fullName;
    }
    return 'N/A';
  };

  const getRoomNumber = (room) => {
    if (room && typeof room === 'object' && room.roomNumber) {
      return room.roomNumber;
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3,
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
    }}>
      {/* Header */}
      <Fade in={true}>
        <Box sx={{ mb: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Box>
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
                Quản lý Đặt phòng
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Quản lý đặt phòng, check-in/out và thanh toán
              </Typography>
            </Box>
            
            {/* Action Buttons */}
            <Stack direction="row" spacing={1}>
            </Stack>
            
            {/* View Mode Toggle */}
            <Stack direction="row" spacing={1}>
              <Tooltip title="Bảng">
                <IconButton 
                  onClick={() => setViewMode('table')}
                  sx={{
                    background: viewMode === 'table' ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' : 'transparent',
                    color: viewMode === 'table' ? 'white' : 'inherit',
                  }}
                >
                  <ListIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Lịch">
                <IconButton 
                  onClick={() => setViewMode('calendar')}
                  sx={{
                    background: viewMode === 'calendar' ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' : 'transparent',
                    color: viewMode === 'calendar' ? 'white' : 'inherit',
                  }}
                >
                  <CalendarMonthIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Timeline">
                <IconButton 
                  onClick={() => setViewMode('timeline')}
                  sx={{
                    background: viewMode === 'timeline' ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' : 'transparent',
                    color: viewMode === 'timeline' ? 'white' : 'inherit',
                  }}
                >
                  <TimelineIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
          
        </Box>
      </Fade>

      {/* Quick Stats */}
      <Fade in={true} style={{ transitionDelay: '100ms' }}>
        <Paper sx={{ 
          p: 4, 
          mb: 4,
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
          },
        }}>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ 
                p: 3, 
                borderRadius: 3, 
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                border: '2px solid rgba(16, 185, 129, 0.2)',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(16, 185, 129, 0.2)',
                },
              }}>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {bookings.filter(booking => booking.status === 'checked_in').length}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="600">
                  Đang ở
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ 
                p: 3, 
                borderRadius: 3, 
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.1) 100%)',
                border: '2px solid rgba(59, 130, 246, 0.2)',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.2)',
                },
              }}>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {bookings.filter(booking => booking.status === 'pending').length}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="600">
                  ⏳ Chờ xử lý
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ 
                p: 3, 
                borderRadius: 3, 
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
                border: '2px solid rgba(245, 158, 11, 0.2)',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(245, 158, 11, 0.2)',
                },
              }}>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {bookings.filter(booking => booking.status === 'confirmed').length}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="600">
                  Đã xác nhận
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ 
                p: 3, 
                borderRadius: 3, 
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                border: '2px solid rgba(239, 68, 68, 0.2)',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(239, 68, 68, 0.2)',
                },
              }}>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {bookings.filter(booking => booking.status === 'cancelled').length}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="600">
                  Đã hủy
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Fade>



      {/* Filters */}
      <Fade in={true} style={{ transitionDelay: '200ms' }}>
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
        }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm đặt phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#3b82f6',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: '#3b82f6' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Trạng thái"
                  sx={{
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6',
                    },
                  }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  {Object.entries(statusColors).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {value.icon} {value.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Thời gian</InputLabel>
                <Select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  label="Thời gian"
                  sx={{
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6',
                    },
                  }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="today">Hôm nay</MenuItem>
                  <MenuItem value="this_week">Tuần này</MenuItem>
                  <MenuItem value="this_month">Tháng này</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={fetchData}
                  sx={{
                    background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                    borderRadius: 2,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
                    },
                  }}
                >
                  Làm mới
                </Button>
                
                {/* Bulk Actions */}
                {selectedBookings.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', ml: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Đã chọn: {selectedBookings.length}
                    </Typography>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={handleBulkDelete}
                      sx={{
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        fontWeight: 600,
                      }}
                    >
                      Xóa đã chọn
                    </Button>
                  </Box>
                )}
                
                {sortedBookings.length > 0 && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={handleDeleteAll}
                    sx={{
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      fontWeight: 600,
                      borderColor: '#ef4444',
                      color: '#ef4444',
                      ml: 2,
                      '&:hover': {
                        borderColor: '#dc2626',
                        color: '#dc2626',
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                      },
                    }}
                  >
                    Xóa tất cả
                  </Button>
                )}
                
              </Stack>
            </Grid>
          </Grid>
          
          {/* Quick Stats */}
          <Paper sx={{ 
            p: 2, 
            mb: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: 2,
          }}>
            <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap">
              <Box textAlign="center">
                <Typography variant="h6" color="warning.main" fontWeight="bold">
                  {sortedBookings.filter(booking => booking.status === 'pending').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Chờ xử lý
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box textAlign="center">
                <Typography variant="h6" color="info.main" fontWeight="bold">
                  {sortedBookings.filter(booking => booking.status === 'confirmed').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Đã xác nhận
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box textAlign="center">
                <Typography variant="h6" color="success.main" fontWeight="bold">
                  {sortedBookings.filter(booking => booking.status === 'checked_in').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Đang ở
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box textAlign="center">
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {sortedBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0).toLocaleString()}đ
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tổng doanh thu
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Paper>
      </Fade>

      {/* Bookings Table */}
      <Fade in={true} style={{ transitionDelay: '400ms' }}>
        <Paper sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
        }}>
          {/* Table View */}
          {viewMode === 'table' && (
            <TableContainer>
              <Table>
              <TableHead sx={{ 
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '50px' }}>
                    <Checkbox
                      checked={selectedBookings.length === sortedBookings.length && sortedBookings.length > 0}
                      indeterminate={selectedBookings.length > 0 && selectedBookings.length < sortedBookings.length}
                      onChange={handleSelectAll}
                      sx={{ color: 'white' }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Mã đặt phòng</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Khách hàng</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Phòng</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Check-in</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Check-out</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Số khách</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tổng tiền</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Thanh toán</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
            <TableBody>
              {sortedBookings.map((booking) => (
                <TableRow 
                  key={booking._id} 
                  hover
                  onClick={() => handleViewBooking(booking)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(217, 119, 6, 0.05)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(217, 119, 6, 0.15)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedBookings.includes(booking._id)}
                      onChange={() => handleSelectBooking(booking._id)}
                      sx={{ color: '#3b82f6' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {booking.bookingNumber || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {getCustomerName(booking.customer)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {booking.customer?.phone || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <RoomIcon color="action" fontSize="small" />
                      <Typography variant="body2">
                        Phòng {getRoomNumber(booking.room)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon color="action" fontSize="small" />
                      <Typography variant="body2">
                        {formatDate(booking.checkIn)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon color="action" fontSize="small" />
                      <Typography variant="body2">
                        {formatDate(booking.checkOut)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {booking.guests?.adults || 0} người lớn
                      {booking.guests?.children > 0 && `, ${booking.guests.children} trẻ em`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {formatPrice(booking.totalAmount || 0)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusColors[booking.status]?.label || booking.status}
                      color={statusColors[booking.status]?.color || 'default'}
                      size="small"
                      icon={<span>{statusColors[booking.status]?.icon}</span>}
                    />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Tooltip title={`Nhấn để ${booking.payment?.status === 'paid' ? 'hủy' : 'xác nhận'} thanh toán`}>
                      <Chip
                        label={paymentStatusColors[booking.payment?.status]?.label || 'N/A'}
                        color={paymentStatusColors[booking.payment?.status]?.color || 'default'}
                        size="small"
                        clickable
                        onClick={() => handleTogglePaymentStatus(booking._id)}
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          }
                        }}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton size="small" onClick={() => handleOpenDialog(booking)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {/* Nút Xác nhận cho bookings pending */}
                      {booking.status === 'pending' && (
                        <Tooltip title="Xác nhận đặt phòng">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleConfirmBooking(booking._id)}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {/* Nút Check-in cho bookings đã xác nhận */}
                      {booking.status === 'confirmed' && (
                        <Tooltip title="Check-in">
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleCheckIn(booking._id)}
                          >
                            <CheckInIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {/* Nút Check-out cho bookings đã check-in */}
                      {booking.status === 'checked_in' && (
                        <Tooltip title="Check-out">
                          <IconButton 
                            size="small" 
                            color="warning"
                            onClick={() => handleCheckOut(booking._id)}
                          >
                            <CheckOutIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {/* Nút Hủy cho bookings chưa check-in */}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <Tooltip title="Hủy đặt phòng">
                          <IconButton 
                            size="small" 
                            color="warning"
                            onClick={() => handleDelete(booking._id)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {/* Nút Xóa cho bookings đã hoàn thành */}
                      {(booking.status === 'checked_out' || booking.status === 'cancelled') && (
                        <Tooltip title="Xóa vĩnh viễn">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDelete(booking._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
          )}

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
                Lịch đặt phòng
              </Typography>
              <Grid container spacing={2}>
                {sortedBookings.map((booking) => (
                  <Grid item xs={12} sm={6} md={4} key={booking._id}>
                    <Card sx={{
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                      },
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            mr: 2,
                          }}>
                          </Box>
                          <Box flex={1}>
                            <Typography variant="subtitle1" fontWeight="700">
                              {booking.bookingNumber || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {booking.customer?.fullName || 'Khách hàng'}
                            </Typography>
                          </Box>
                        </Box>

                        <Box mb={2}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Ngày nhận phòng: {new Date(booking.checkInDate).toLocaleDateString('vi-VN')} lúc {booking.checkInInfo?.actualCheckIn 
                            ? new Date(booking.checkInInfo.actualCheckIn).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                            : (booking.checkInTime || '13:00')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Ngày trả phòng: {new Date(booking.checkOutDate).toLocaleDateString('vi-VN')} lúc {booking.checkOutInfo?.actualCheckOut 
                            ? new Date(booking.checkOutInfo.actualCheckOut).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                            : (booking.checkOutTime || '12:00')}
                          {booking.checkInDate === booking.checkOutDate && (
                            <Chip 
                              label="Cùng ngày" 
                              size="small" 
                              sx={{ 
                                ml: 1, 
                                backgroundColor: '#10b981', 
                                color: 'white',
                                fontSize: '0.75rem'
                              }} 
                            />
                          )}
                        </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Phòng: {booking.room?.roomNumber || 'N/A'}
                          </Typography>
                        </Box>

                        <Box display="flex" gap={1} mb={2}>
                          <Chip
                            label={booking.status === 'confirmed' ? 'Đã xác nhận' : 
                                   booking.status === 'pending' ? 'Chờ xác nhận' :
                                   booking.status === 'checked_in' ? 'Đã nhận phòng' :
                                   booking.status === 'checked_out' ? 'Đã trả phòng' : booking.status}
                            color={booking.status === 'confirmed' ? 'success' : 
                                   booking.status === 'pending' ? 'warning' :
                                   booking.status === 'checked_in' ? 'info' : 'default'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>

                        <Typography variant="h6" fontWeight="700" color="#3b82f6">
                          {booking.totalAmount?.toLocaleString('vi-VN')}₫
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
                ⏰ Timeline đặt phòng
              </Typography>
              <Box sx={{ position: 'relative' }}>
                {filteredBookings.map((booking, index) => (
                  <Box key={booking._id} sx={{ mb: 4 }}>
                    <Box display="flex" alignItems="flex-start">
                      {/* Timeline dot */}
                      <Box sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        mt: 1,
                        mr: 3,
                        flexShrink: 0,
                      }} />
                      
                      {/* Timeline content */}
                      <Box flex={1}>
                        <Card sx={{
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(8px)',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                          },
                        }}>
                          <CardContent sx={{ p: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                              <Box>
                                <Typography variant="h6" fontWeight="700">
                                  {booking.bookingNumber || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {booking.customer?.fullName || 'Khách hàng'}
                                </Typography>
                              </Box>
                              <Chip
                                label={booking.status === 'confirmed' ? 'Đã xác nhận' : 
                                       booking.status === 'pending' ? 'Chờ xác nhận' :
                                       booking.status === 'checked_in' ? 'Đã nhận phòng' :
                                       booking.status === 'checked_out' ? 'Đã trả phòng' : booking.status}
                                color={booking.status === 'confirmed' ? 'success' : 
                                       booking.status === 'pending' ? 'warning' :
                                       booking.status === 'checked_in' ? 'info' : 'default'}
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </Box>

                            <Grid container spacing={2} mb={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
 Nhận phòng: {new Date(booking.checkInDate).toLocaleDateString('vi-VN')} lúc {booking.checkInInfo?.actualCheckIn 
                                    ? new Date(booking.checkInInfo.actualCheckIn).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                                    : (booking.checkInTime || '13:00')}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
 Trả phòng: {new Date(booking.checkOutDate).toLocaleDateString('vi-VN')} lúc {booking.checkOutTime || '12:00'}
                                  {booking.checkInDate === booking.checkOutDate && (
                                    <Chip 
                                      label="Cùng ngày" 
                                      size="small" 
                                      sx={{ 
                                        ml: 1, 
                                        backgroundColor: '#10b981', 
                                        color: 'white',
                                        fontSize: '0.75rem'
                                      }} 
                                    />
                                  )}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                  Phòng: {booking.room?.roomNumber || 'N/A'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                  👥 Khách: {booking.guestCount || 1} người
                                </Typography>
                              </Grid>
                            </Grid>

                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="h6" fontWeight="700" color="#3b82f6">
                                {booking.totalAmount?.toLocaleString('vi-VN')}₫
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
 {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    </Box>
                    
                    {/* Timeline line */}
                    {index < sortedBookings.length - 1 && (
                      <Box sx={{
                        position: 'absolute',
                        left: 7,
                        top: 32,
                        width: 2,
                        height: 40,
                        background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                      }} />
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      </Fade>

      {/* Empty State */}
      {sortedBookings.length === 0 && !loading && (
        <Paper sx={{ p: 6, textAlign: 'center', mt: 4 }}>
          <CalendarIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Không tìm thấy đặt phòng nào
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thử thay đổi bộ lọc hoặc tìm kiếm khác
          </Typography>
        </Paper>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add booking"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
          boxShadow: '0 8px 25px rgba(217, 119, 6, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 35px rgba(217, 119, 6, 0.4)',
          },
          transition: 'all 0.3s ease',
        }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="lg" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            margin: '20px',
            maxHeight: 'calc(100vh - 40px)',
          }
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            maxHeight: 'calc(100vh - 40px)',
            display: 'flex',
            flexDirection: 'column',
            margin: '20px',
            zIndex: 1300,
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
          color: 'white',
          textAlign: 'center',
          py: 4,
          borderRadius: '12px 12px 0 0',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.3) 100%)',
          }
        }}>
          <Typography variant="h5" fontWeight="bold" component="div" sx={{ mb: 1 }}>
            {editingBooking ? '✏️ Chỉnh sửa đặt phòng' : '➕ Thêm đặt phòng mới'}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, fontSize: '1rem' }} component="div">
            {editingBooking ? 'Cập nhật thông tin đặt phòng' : 'Tạo đặt phòng mới cho khách hàng'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ 
          p: 3, 
          flex: 1,
          overflow: 'auto',
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#3b82f6',
            borderRadius: '3px',
            '&:hover': {
              background: '#1d4ed8',
            },
          },
        }}>
          <Grid container spacing={3}>
            {/* Thông tin khách hàng */}
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)',
                border: '2px solid rgba(217, 119, 6, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 20px rgba(217, 119, 6, 0.15)',
                  transform: 'translateY(-2px)',
                },
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  fontWeight: 700, 
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 3,
                  fontSize: '1.1rem',
                }}>
                  👤 Thông tin khách hàng
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ 
                          color: '#3b82f6',
                          fontWeight: 600,
                        }}>Khách hàng *</InputLabel>
                        <Select
                          value={formData.customer || ''}
                          onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                          label="Khách hàng *"
                          sx={{
                            borderRadius: 3,
                            background: 'rgba(255, 255, 255, 0.9)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#3b82f6',
                                borderWidth: 2,
                              },
                            },
                            '&.Mui-focused': {
                              background: 'white',
                              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#3b82f6',
                                borderWidth: 2,
                              },
                            },
                          }}
                        >
                          {/* Kiểm tra nếu customer hiện tại không tồn tại trong danh sách */}
                          {formData.customer && !customers.find(c => c._id === formData.customer) && (
                            <MenuItem value="" disabled>
                              <Typography variant="body2" color="error">
                                ⚠️ Khách hàng không tồn tại - Vui lòng chọn lại
                              </Typography>
                            </MenuItem>
                          )}
                          
                          {customers.map((customer) => (
                            <MenuItem key={customer._id} value={customer._id}>
                              <Box display="flex" alignItems="center" sx={{ width: '100%' }}>
                                <Avatar sx={{ 
                                  mr: 2, 
                                  width: 32, 
                                  height: 32,
                                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                }}>
                                  {customer?.fullName?.charAt(0)?.toUpperCase() || '?'}
                                </Avatar>
                                <Box flex={1}>
                                  <Typography variant="body2" fontWeight="600">
                                    {customer?.fullName || 'N/A'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {customer?.email || 'N/A'} • {customer?.phone || 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button
                        variant="contained"
                        onClick={handleOpenCustomerDialog}
                        sx={{
                          borderRadius: 3,
                          px: 3,
                          py: 1.5,
                          fontWeight: 600,
                          background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                          boxShadow: '0 4px 15px rgba(217, 119, 6, 0.3)',
                          minWidth: 'auto',
                          whiteSpace: 'nowrap',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(217, 119, 6, 0.4)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        ➕ Tạo mới
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      background: 'rgba(59, 130, 246, 0.05)',
                      border: '1px solid rgba(59, 130, 246, 0.1)',
                    }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Thông tin khách hàng
                      </Typography>
                      {formData.customer ? (
                        (() => {
                          const selectedCustomer = customers.find(c => c._id === formData.customer);
                          return selectedCustomer ? (
                            <Box>
                              <Typography variant="body2" fontWeight="600">
                                {selectedCustomer?.fullName || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {selectedCustomer?.email || 'N/A'}
                              </Typography>
                            </Box>
                          ) : null;
                        })()
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Chọn khách hàng để xem thông tin
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            {/* Thông tin phòng */}
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 4, 
                borderRadius: 4,
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
                border: '2px solid rgba(16, 185, 129, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(16, 185, 129, 0.15)',
                },
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  fontWeight: 700, 
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 3,
                }}>
                  🏨 Thông tin phòng
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ 
                        color: '#10b981',
                        fontWeight: 600,
                      }}>Phòng *</InputLabel>
                      <Select
                        value={formData.room}
                        onChange={(e) => {
                          const selectedRoom = rooms.find(r => r._id === e.target.value);
                          setFormData({ 
                            ...formData, 
                            room: e.target.value,
                            roomPrice: selectedRoom?.basePrice || 0
                          });
                        }}
                        label="Phòng *"
                        sx={{
                          borderRadius: 3,
                          background: 'rgba(255, 255, 255, 0.9)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#10b981',
                              borderWidth: 2,
                            },
                          },
                          '&.Mui-focused': {
                            background: 'white',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#10b981',
                              borderWidth: 2,
                            },
                          },
                        }}
                      >
                        {(() => {
                          const availableRooms = rooms.filter(room => editingBooking ? true : room.status === 'available');
                          
                          if (!editingBooking && availableRooms.length === 0) {
                            return (
                              <MenuItem disabled>
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', width: '100%' }}>
                                  ❌ Không có phòng trống - Vui lòng thử lại sau
                                </Typography>
                              </MenuItem>
                            );
                          }
                          
                          return availableRooms.map((room) => (
                          <MenuItem key={room._id} value={room._id}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                              <Box display="flex" alignItems="center">
                                <HotelIcon sx={{ mr: 2, color: room.status === 'available' ? '#10b981' : '#ef4444' }} />
                                <Box>
                                  <Typography variant="body2" fontWeight="600">
                                    Phòng {room.roomNumber}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {room.roomType} • Tầng {room.floor}
                                    {room.status !== 'available' && ` • ${
                                      room.status === 'occupied' ? 'Đang sử dụng' :
                                      room.status === 'reserved' ? 'Đã đặt' :
                                      room.status === 'cleaning' ? 'Đang dọn dẹp' :
                                      room.status === 'needs_cleaning' ? 'Cần dọn dẹp' :
                                      room.status === 'maintenance' ? 'Bảo trì' :
                                      room.status === 'out_of_order' ? 'Hỏng hóc' :
                                      room.status
                                    }`}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body2" fontWeight="bold" color="#10b981">
                                  {formatPrice(room.basePrice)}
                                </Typography>
                                {room.status !== 'available' && (
                                  <Typography variant="caption" sx={{
                                    px: 1,
                                    py: 0.3,
                                    borderRadius: 1,
                                    backgroundColor: '#ef444420',
                                    color: '#ef4444',
                                    fontSize: '0.7rem'
                                  }}>
                                    Không khả dụng
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </MenuItem>
                        ));
                        })()}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      background: 'rgba(16, 185, 129, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.1)',
                    }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Thông tin phòng
                      </Typography>
                      {formData.room ? (
                        (() => {
                          const selectedRoom = rooms.find(r => r._id === formData.room);
                          return selectedRoom ? (
                            <Box>
                              <Typography variant="body2" fontWeight="600">
                                Phòng {selectedRoom.roomNumber} • {selectedRoom.roomType}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Tầng {selectedRoom.floor} • {selectedRoom.maxOccupancy} người
                              </Typography>
                              <Typography variant="body2" fontWeight="600" color="#10b981" sx={{ mt: 1 }}>
                                {formatPrice(selectedRoom.basePrice)}/đêm
                              </Typography>
                            </Box>
                          ) : null;
                        })()
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Chọn phòng để xem thông tin
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            {/* Thông tin đặt phòng */}
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 2.5, 
                borderRadius: 2,
                background: 'rgba(245, 158, 11, 0.02)',
                border: '1px solid rgba(245, 158, 11, 0.08)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.1)',
                },
              }}>
                <Typography variant="subtitle1" gutterBottom sx={{ 
                  fontWeight: 600, 
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2,
                  fontSize: '1rem',
                }}>
                  📅 Thông tin đặt phòng
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Ngày nhận phòng *"
                      type="date"
                      value={formData.checkIn}
                      onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ 
                        min: new Date().toISOString().split('T')[0]
                      }}
                      required
                      sx={{
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#f59e0b',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#f59e0b',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Ngày trả phòng *"
                      type="date"
                      value={formData.checkOut}
                      onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      required
                      sx={{
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#f59e0b',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#f59e0b',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Số người lớn *"
                      type="number"
                      value={formData.guests.adults}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        guests: { ...formData.guests, adults: parseInt(e.target.value) || 1 }
                      })}
                      required
                      inputProps={{ min: 1, max: 10 }}
                      sx={{
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#f59e0b',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#f59e0b',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Số trẻ em"
                      type="number"
                      value={formData.guests.children}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        guests: { ...formData.guests, children: parseInt(e.target.value) || 0 }
                      })}
                      inputProps={{ min: 0, max: 10 }}
                      sx={{
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#f59e0b',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#f59e0b',
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            {/* Thông tin thanh toán */}
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 2.5, 
                borderRadius: 2,
                background: 'rgba(139, 92, 246, 0.02)',
                border: '1px solid rgba(139, 92, 246, 0.08)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.1)',
                },
              }}>
                <Typography variant="subtitle1" gutterBottom sx={{ 
                  fontWeight: 600, 
                  color: '#8b5cf6',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2,
                  fontSize: '1rem',
                }}>
                  💳 Thông tin thanh toán
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ 
                        color: '#8b5cf6',
                        fontWeight: 600,
                      }}>Phương thức thanh toán</InputLabel>
                      <Select
                        value={formData.payment.method}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          payment: { ...formData.payment, method: e.target.value }
                        })}
                        label="Phương thức thanh toán"
                        sx={{
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6',
                          },
                        }}
                      >
                        {paymentMethods.map((method) => (
                          <MenuItem key={method.value} value={method.value}>
                            {method.icon} {method.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ 
                        color: '#8b5cf6',
                        fontWeight: 600,
                      }}>Trạng thái thanh toán</InputLabel>
                      <Select
                        value={formData.payment.status}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          payment: { ...formData.payment, status: e.target.value }
                        })}
                        label="Trạng thái thanh toán"
                        sx={{
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8b5cf6',
                          },
                        }}
                      >
                        {Object.entries(paymentStatusColors).map(([key, value]) => (
                          <MenuItem key={key} value={key}>
                            {value.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      background: 'rgba(139, 92, 246, 0.03)',
                      border: '1px solid rgba(139, 92, 246, 0.1)',
                      textAlign: 'center',
                    }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Tổng tiền
                      </Typography>
                      <Typography variant="h5" fontWeight="700" color="#8b5cf6">
                        {(() => {
                          if (formData.checkIn && formData.checkOut && formData.roomPrice) {
                            const checkInDate = new Date(formData.checkIn);
                            const checkOutDate = new Date(formData.checkOut);
                            const timeDiff = checkOutDate - checkInDate;
                            const nights = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
                            
                            if (nights === 0) {
                              // Sử dụng trong ngày - tính theo giờ với giá cố định
                              const checkInTime = new Date(`${formData.checkIn}T${formData.checkInTime || '13:00'}`);
                              const checkOutTime = new Date(`${formData.checkOut}T${formData.checkOutTime || '12:00'}`);
                              const hoursDiff = Math.max(1, Math.ceil((checkOutTime - checkInTime) / (1000 * 60 * 60)));
                              
                              // Sử dụng giá theo giờ từ room data
                              const selectedRoom = rooms.find(r => r._id === formData.room);
                              const rates = selectedRoom?.hourlyPrice || {
                                firstHour: 100000,
                                additionalHour: 20000
                              };
                              
                              let hourlyAmount = 0;
                              if (hoursDiff === 1) {
                                hourlyAmount = rates.firstHour;
                              } else {
                                hourlyAmount = rates.firstHour + (rates.additionalHour * (hoursDiff - 1));
                              }
                              
                              return formatPrice(hourlyAmount);
                            } else {
                              // Qua đêm - tính theo đêm
                              return formatPrice(formData.roomPrice * nights);
                            }
                          }
                          return formatPrice(0);
                        })()}
                      </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formData.checkIn && formData.checkOut ? 
                           (() => {
                             const nights = Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24));
                             return nights === 0 ? 'Sử dụng trong ngày' : `${nights} đêm`;
                           })() : 
                            'Chọn ngày để tính'
                          }
                        {formData.checkIn && formData.checkOut && formData.checkIn === formData.checkOut && (
                          <Chip 
                            label="Sử dụng trong ngày" 
                            size="small" 
                            sx={{ 
                              ml: 1, 
                              backgroundColor: '#3b82f6', 
                              color: 'white',
                              fontSize: '0.75rem'
                            }} 
                          />
                        )}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Ghi chú */}
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 2.5, 
                borderRadius: 2,
                background: 'rgba(107, 114, 128, 0.02)',
                border: '1px solid rgba(107, 114, 128, 0.08)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(107, 114, 128, 0.1)',
                },
              }}>
                <Typography variant="subtitle1" gutterBottom sx={{ 
                  fontWeight: 600, 
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2,
                  fontSize: '1rem',
                }}>
                  📝 Ghi chú
                </Typography>
                <TextField
                  fullWidth
                  label="Ghi chú thêm"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Nhập ghi chú về đặt phòng (tùy chọn)..."
                  sx={{
                    borderRadius: 3,
                    background: 'rgba(255, 255, 255, 0.9)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(107, 114, 128, 0.2)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6b7280',
                        borderWidth: 2,
                      },
                    },
                    '&.Mui-focused': {
                      background: 'white',
                      boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6b7280',
                        borderWidth: 2,
                      },
                    },
                  }}
                />
              </Paper>
            </Grid>
            {/* Trạng thái đặt phòng */}
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 4, 
                borderRadius: 4,
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)',
                border: '2px solid rgba(239, 68, 68, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(239, 68, 68, 0.15)',
                },
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  fontWeight: 700, 
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 3,
                }}>
                  ⚡ Trạng thái đặt phòng
                </Typography>
                <FormControl fullWidth>
                  <InputLabel sx={{ 
                    color: '#ef4444',
                    fontWeight: 600,
                  }}>Trạng thái</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Trạng thái"
                    sx={{
                      borderRadius: 3,
                      background: 'rgba(255, 255, 255, 0.9)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ef4444',
                          borderWidth: 2,
                        },
                      },
                      '&.Mui-focused': {
                        background: 'white',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ef4444',
                          borderWidth: 2,
                        },
                      },
                    }}
                  >
                    {Object.entries(statusColors).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value.icon} {value.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #e2e8f0',
          background: 'rgba(248, 250, 252, 0.8)',
          borderRadius: '0 0 8px 8px',
          gap: 2,
        }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 500,
              borderColor: '#6b7280',
              color: '#6b7280',
              '&:hover': {
                borderColor: '#4b5563',
                color: '#4b5563',
                backgroundColor: 'rgba(107, 114, 128, 0.05)',
              },
            }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
              boxShadow: '0 4px 15px rgba(217, 119, 6, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(217, 119, 6, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {editingBooking ? '✏️ Cập nhật' : '➕ Tạo mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

      {/* View Booking Dialog */}
      <Dialog
        open={viewDialog.open}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            maxHeight: '90vh',
          },
        }}
      >
        {viewDialog.booking && (
          <>
            <DialogTitle sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              py: 3,
              borderRadius: '16px 16px 0 0',
            }}>
              <Box>
                <Typography variant="h6" fontWeight="700" component="div">
                  📋 Chi tiết đặt phòng
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {viewDialog.booking.bookingNumber || 'N/A'}
                </Typography>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                {/* Thông tin cơ bản */}
                <Grid item xs={12}>
                  <Paper sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(29, 78, 216, 0.05) 100%)',
                    border: '2px solid rgba(59, 130, 246, 0.1)',
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ 
                      fontWeight: 700, 
                      color: '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}>
                      👤 Thông tin khách hàng
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Họ và tên
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {viewDialog.booking.customer?.fullName || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Email
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {viewDialog.booking.customer?.email || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Số điện thoại
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {viewDialog.booking.customer?.phone || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Số khách
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {viewDialog.booking.guests ? (
                            <>
                              {viewDialog.booking.guests.adults || 0} người lớn
                              {viewDialog.booking.guests.children > 0 && (
                                <>, {viewDialog.booking.guests.children} trẻ em</>
                              )}
                              <br />
                              <Typography variant="caption" color="text.secondary">
                                Tổng: {viewDialog.booking.guests.adults + viewDialog.booking.guests.children} người
                              </Typography>
                            </>
                          ) : (
                            `${viewDialog.booking.guestCount || viewDialog.booking.numberOfGuests || 1} người`
                          )}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Thông tin phòng */}
                <Grid item xs={12}>
                  <Paper sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
                    border: '2px solid rgba(16, 185, 129, 0.1)',
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ 
                      fontWeight: 700, 
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}>
                      🏨 Thông tin phòng
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Số phòng
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {viewDialog.booking.room?.roomNumber || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Loại phòng
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {viewDialog.booking.room?.roomType || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Tầng
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {viewDialog.booking.room?.floor || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Giá phòng/đêm
                        </Typography>
                        <Typography variant="body1" fontWeight="600" color="#10b981">
                          {formatPrice(viewDialog.booking.room?.basePrice || 0)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Thông tin đặt phòng */}
                <Grid item xs={12}>
                  <Paper sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%)',
                    border: '2px solid rgba(245, 158, 11, 0.1)',
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ 
                      fontWeight: 700, 
                      color: '#f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}>
                      📅 Thông tin đặt phòng
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Ngày nhận phòng
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {new Date(viewDialog.booking.checkInDate || viewDialog.booking.checkIn).toLocaleDateString('vi-VN')}
                        </Typography>
                        {viewDialog.booking.checkInInfo?.actualCheckIn ? (
                          <Box>
                            <Typography variant="caption" color="success.main" display="block">
                              ✅ Check-in: {new Date(viewDialog.booking.checkInInfo.actualCheckIn).toLocaleString('vi-VN')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Phòng: {viewDialog.booking.checkInInfo.roomKey || 'N/A'}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Giờ dự kiến: {viewDialog.booking.checkInTime || '13:00'}
                          </Typography>
                        )}
                        {(viewDialog.booking.checkInDate || viewDialog.booking.checkIn) === (viewDialog.booking.checkOutDate || viewDialog.booking.checkOut) && (
                          <Chip 
                            label="Cùng ngày" 
                            size="small" 
                            sx={{ 
                              ml: 1, 
                              backgroundColor: '#10b981', 
                              color: 'white',
                              fontSize: '0.75rem'
                            }} 
                          />
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Ngày trả phòng
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {new Date(viewDialog.booking.checkOutDate || viewDialog.booking.checkOut).toLocaleDateString('vi-VN')}
                        </Typography>
                        {viewDialog.booking.checkOutInfo?.actualCheckOut ? (
                          <Box>
                            <Typography variant="caption" color="success.main" display="block">
                              ✅ Check-out: {new Date(viewDialog.booking.checkOutInfo.actualCheckOut).toLocaleString('vi-VN')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              🏨 Tình trạng: {
                                viewDialog.booking.checkOutInfo.roomCondition === 'good' ? '✅ Tốt' :
                                viewDialog.booking.checkOutInfo.roomCondition === 'damaged' ? '⚠️ Hư hỏng' :
                                viewDialog.booking.checkOutInfo.roomCondition === 'needs_cleaning' ? '🧹 Cần dọn dẹp' :
                                viewDialog.booking.checkOutInfo.roomCondition === 'needs_maintenance' ? '🔧 Cần bảo trì' :
                                viewDialog.booking.checkOutInfo.roomCondition
                              }
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Giờ dự kiến: {viewDialog.booking.checkOutTime || '12:00'}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Số đêm
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" fontWeight="600">
                            {(() => {
                              const nights = Math.ceil((new Date(viewDialog.booking.checkOutDate || viewDialog.booking.checkOut) - 
                                       new Date(viewDialog.booking.checkInDate || viewDialog.booking.checkIn)) / 
                                       (1000 * 60 * 60 * 24));
                              return nights === 0 ? 'Sử dụng trong ngày' : `${nights} đêm`;
                            })()}
                          </Typography>
                          {(viewDialog.booking.checkInDate || viewDialog.booking.checkIn) === (viewDialog.booking.checkOutDate || viewDialog.booking.checkOut) && (
                            <Chip 
                              label="Sử dụng trong ngày" 
                              size="small" 
                              sx={{ 
                                backgroundColor: '#3b82f6', 
                                color: 'white',
                                fontSize: '0.75rem'
                              }} 
                            />
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Trạng thái
                        </Typography>
                        <Chip
                          label={statusColors[viewDialog.booking.status]?.label || viewDialog.booking.status}
                          color={statusColors[viewDialog.booking.status]?.color || 'default'}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Thông tin thanh toán */}
                <Grid item xs={12}>
                  <Paper sx={{ 
                    p: 2.5, 
                    borderRadius: 2,
                    background: 'rgba(139, 92, 246, 0.02)',
                    border: '1px solid rgba(139, 92, 246, 0.08)',
                  }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ 
                      fontWeight: 600, 
                      color: '#8b5cf6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2,
                      fontSize: '1rem',
                    }}>
                      💳 Thông tin thanh toán
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Tổng tiền
                        </Typography>
                        <Typography variant="h5" fontWeight="700" color="#8b5cf6">
                          {(() => {
                            const booking = viewDialog.booking;
                            if (booking.totalAmount && booking.totalAmount > 0) {
                              return formatPrice(booking.totalAmount);
                            }
                            
                            // Tính lại nếu không có totalAmount
                            if (booking.room?.basePrice) {
                              const checkInDate = new Date(booking.checkInDate || booking.checkIn);
                              const checkOutDate = new Date(booking.checkOutDate || booking.checkOut);
                              const timeDiff = checkOutDate - checkInDate;
                              const nights = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
                              
                              if (nights === 0) {
                                // Sử dụng trong ngày - tính theo giờ với giá cố định
                                const checkInTime = new Date(`${booking.checkIn}T${booking.checkInTime || '13:00'}`);
                                const checkOutTime = new Date(`${booking.checkOut}T${booking.checkOutTime || '12:00'}`);
                                const hoursDiff = Math.max(1, Math.ceil((checkOutTime - checkInTime) / (1000 * 60 * 60)));
                                
                                // Sử dụng giá theo giờ từ room data
                                const rates = booking.room?.hourlyPrice || {
                                  firstHour: 100000,
                                  additionalHour: 20000
                                };
                                
                                let hourlyAmount = 0;
                                if (hoursDiff === 1) {
                                  hourlyAmount = rates.firstHour;
                                } else {
                                  hourlyAmount = rates.firstHour + (rates.additionalHour * (hoursDiff - 1));
                                }
                                
                                return formatPrice(hourlyAmount);
                              } else {
                                // Qua đêm - tính theo đêm
                                return formatPrice(booking.room.basePrice * nights);
                              }
                            }
                            
                            return formatPrice(0);
                          })()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Phương thức thanh toán
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {viewDialog.booking.payment?.method === 'cash' ? 'Tiền mặt' :
                           viewDialog.booking.payment?.method === 'card' ? 'Thẻ' :
                           viewDialog.booking.payment?.method === 'bank_transfer' ? 'Chuyển khoản' :
                           viewDialog.booking.payment?.method === 'online' ? 'Online' :
                           viewDialog.booking.payment?.method || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Trạng thái thanh toán
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {viewDialog.booking.payment?.status === 'pending' ? 'Chờ thanh toán' :
                           viewDialog.booking.payment?.status === 'paid' ? 'Đã thanh toán' :
                           viewDialog.booking.payment?.status === 'refunded' ? 'Đã hoàn tiền' :
                           viewDialog.booking.payment?.status === 'failed' ? 'Thanh toán thất bại' :
                           viewDialog.booking.payment?.status || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Ngày tạo
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {new Date(viewDialog.booking.createdAt).toLocaleDateString('vi-VN')}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Ghi chú */}
                {viewDialog.booking.notes && (
                  <Grid item xs={12}>
                    <Paper sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.05) 0%, rgba(75, 85, 99, 0.05) 100%)',
                      border: '2px solid rgba(107, 114, 128, 0.1)',
                    }}>
                      <Typography variant="h6" gutterBottom sx={{ 
                        fontWeight: 700, 
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}>
                        📝 Ghi chú
                      </Typography>
                      <Typography variant="body1">
                        {viewDialog.booking.notes}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ 
              p: 3, 
              borderTop: '1px solid #e2e8f0',
              background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
              borderRadius: '0 0 16px 16px',
            }}>
              <Button 
                onClick={handleCloseViewDialog}
                variant="outlined"
                sx={{ 
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                }}
              >
                Đóng
              </Button>
              <Button 
                onClick={() => {
                  handleCloseViewDialog();
                  handleOpenDialog(viewDialog.booking);
                }}
                variant="contained"
                sx={{ 
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                  },
                }}
              >
                Chỉnh sửa
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Customer Dialog */}
      <Dialog
        open={customerDialog.open}
        onClose={handleCloseCustomerDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
          color: 'white',
          py: 4,
          borderRadius: '16px 16px 0 0',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.3) 100%)',
          }
        }}>
          <Typography variant="h5" fontWeight="700" sx={{ mb: 1 }}>
            👤 Tạo khách hàng mới
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, fontSize: '1rem' }}>
            Thêm thông tin khách hàng để đặt phòng
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3, pt: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Họ và tên *"
                value={customerFormData.fullName}
                onChange={(e) => setCustomerFormData({ ...customerFormData, fullName: e.target.value })}
                required
                sx={{
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.9)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 3px 8px rgba(59, 130, 246, 0.15)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6',
                    },
                  },
                  '&.Mui-focused': {
                    background: 'white',
                    boxShadow: '0 3px 8px rgba(59, 130, 246, 0.2)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={customerFormData.email}
                onChange={(e) => setCustomerFormData({ ...customerFormData, email: e.target.value })}
                required
                sx={{
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.9)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 3px 8px rgba(59, 130, 246, 0.15)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6',
                    },
                  },
                  '&.Mui-focused': {
                    background: 'white',
                    boxShadow: '0 3px 8px rgba(59, 130, 246, 0.2)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại *"
                value={customerFormData.phone}
                onChange={(e) => setCustomerFormData({ ...customerFormData, phone: e.target.value })}
                required
                sx={{
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.9)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 3px 8px rgba(59, 130, 246, 0.15)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6',
                    },
                  },
                  '&.Mui-focused': {
                    background: 'white',
                    boxShadow: '0 3px 8px rgba(59, 130, 246, 0.2)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Địa chỉ"
                multiline
                rows={2}
                value={customerFormData.address}
                onChange={(e) => setCustomerFormData({ ...customerFormData, address: e.target.value })}
                sx={{
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.9)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 3px 8px rgba(59, 130, 246, 0.15)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6',
                    },
                  },
                  '&.Mui-focused': {
                    background: 'white',
                    boxShadow: '0 3px 8px rgba(59, 130, 246, 0.2)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ngày sinh"
                type="date"
                value={customerFormData.dateOfBirth}
                onChange={(e) => setCustomerFormData({ ...customerFormData, dateOfBirth: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.9)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 3px 8px rgba(59, 130, 246, 0.15)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6',
                    },
                  },
                  '&.Mui-focused': {
                    background: 'white',
                    boxShadow: '0 3px 8px rgba(59, 130, 246, 0.2)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ 
                  color: '#3b82f6',
                  fontWeight: 600,
                }}>Giới tính</InputLabel>
                <Select
                  value={customerFormData.gender}
                  onChange={(e) => setCustomerFormData({ ...customerFormData, gender: e.target.value })}
                  label="Giới tính"
                  sx={{
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.9)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 3px 8px rgba(59, 130, 246, 0.15)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                      },
                    },
                    '&.Mui-focused': {
                      background: 'white',
                      boxShadow: '0 3px 8px rgba(59, 130, 246, 0.2)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                      },
                    },
                  }}
                >
                  <MenuItem value="male">Nam</MenuItem>
                  <MenuItem value="female">Nữ</MenuItem>
                  <MenuItem value="other">Khác</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ghi chú"
                multiline
                rows={2}
                value={customerFormData.notes}
                onChange={(e) => setCustomerFormData({ ...customerFormData, notes: e.target.value })}
                placeholder="Ghi chú về khách hàng (tùy chọn)..."
                sx={{
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.9)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 3px 8px rgba(59, 130, 246, 0.15)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6',
                    },
                  },
                  '&.Mui-focused': {
                    background: 'white',
                    boxShadow: '0 3px 8px rgba(59, 130, 246, 0.2)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6',
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 4, 
          borderTop: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          borderRadius: '0 0 16px 16px',
        }}>
          <Button 
            onClick={handleCloseCustomerDialog}
            variant="outlined"
            sx={{ 
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              borderColor: '#6b7280',
              color: '#6b7280',
              '&:hover': {
                borderColor: '#4b5563',
                color: '#4b5563',
                backgroundColor: 'rgba(107, 114, 128, 0.05)',
              },
            }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleCreateCustomer}
            variant="contained"
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            ➕ Tạo khách hàng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Check-in Dialog */}
      <Dialog 
        open={checkInDialog.open} 
        onClose={() => {
          const now = new Date();
          const currentTime = now.toTimeString().slice(0, 5);
          setCheckInDialog({ open: false, booking: null, roomKey: '', checkInTime: currentTime });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '16px 16px 0 0'
        }}>
          🏨 Check-in Khách
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {checkInDialog.booking && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Đặt phòng: {checkInDialog.booking.bookingNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Khách hàng: {checkInDialog.booking.customer?.fullName || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Phòng: {checkInDialog.booking.room?.roomNumber || 'N/A'}
              </Typography>
              
              <TextField
                fullWidth
                label="Mã phòng"
                value={checkInDialog.roomKey}
                onChange={(e) => setCheckInDialog({ ...checkInDialog, roomKey: e.target.value })}
                margin="normal"
                required
                helperText="Nhập mã phòng để xác nhận check-in"
              />
              
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <TextField
                    fullWidth
                    label="Giờ check-in"
                    type="time"
                    value={checkInDialog.checkInTime}
                    onChange={(e) => setCheckInDialog({ ...checkInDialog, checkInTime: e.target.value })}
                    margin="normal"
                    required
                    helperText="Giờ thực tế khách check-in (tự động lấy giờ hiện tại)"
                    InputLabelProps={{ shrink: true }}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => {
                      const now = new Date();
                      const currentTime = now.toTimeString().slice(0, 5);
                      setCheckInDialog({ ...checkInDialog, checkInTime: currentTime });
                    }}
                    sx={{
                      mt: 2,
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      fontWeight: 600,
                      borderColor: '#10b981',
                      color: '#10b981',
                      minWidth: 'auto',
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        borderColor: '#059669',
                        color: '#059669',
                        backgroundColor: 'rgba(16, 185, 129, 0.05)',
                      },
                    }}
                  >
                    🕐 Giờ hiện tại
                  </Button>
                </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => {
              const now = new Date();
              const currentTime = now.toTimeString().slice(0, 5);
              setCheckInDialog({ open: false, booking: null, roomKey: '', checkInTime: currentTime });
            }}
            color="inherit"
          >
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmCheckIn}
            variant="contained"
            sx={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }
            }}
          >
            Xác nhận Check-in
          </Button>
        </DialogActions>
      </Dialog>

      {/* Check-out Dialog */}
      <Dialog 
        open={checkOutDialog.open} 
        onClose={() => {
          const now = new Date();
          const currentTime = now.toTimeString().slice(0, 5);
          setCheckOutDialog({ open: false, booking: null, roomCondition: 'good', checkOutTime: currentTime });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '16px 16px 0 0'
        }}>
          🚪 Check-out Khách
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {checkOutDialog.booking && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Đặt phòng: {checkOutDialog.booking.bookingNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Khách hàng: {checkOutDialog.booking.customer?.fullName || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Phòng: {checkOutDialog.booking.room?.roomNumber || 'N/A'}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  label="Giờ check-out"
                  type="time"
                  value={checkOutDialog.checkOutTime}
                  onChange={(e) => setCheckOutDialog({ ...checkOutDialog, checkOutTime: e.target.value })}
                  margin="normal"
                  required
                  helperText="Giờ thực tế khách check-out (tự động lấy giờ hiện tại)"
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    const now = new Date();
                    const currentTime = now.toTimeString().slice(0, 5);
                    setCheckOutDialog({ ...checkOutDialog, checkOutTime: currentTime });
                  }}
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    fontWeight: 600,
                    borderColor: '#f59e0b',
                    color: '#f59e0b',
                    minWidth: 'auto',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      borderColor: '#d97706',
                      color: '#d97706',
                      backgroundColor: 'rgba(245, 158, 11, 0.05)',
                    },
                  }}
                >
                  🕐 Giờ hiện tại
                </Button>
              </Box>

              <FormControl fullWidth margin="normal">
                <InputLabel>Tình trạng phòng</InputLabel>
                <Select
                  value={checkOutDialog.roomCondition}
                  onChange={(e) => setCheckOutDialog({ ...checkOutDialog, roomCondition: e.target.value })}
                  label="Tình trạng phòng"
                >
                  <MenuItem value="good">✅ Tốt</MenuItem>
                  <MenuItem value="damaged">⚠️ Hư hỏng</MenuItem>
                  <MenuItem value="needs_cleaning">🧹 Cần dọn dẹp</MenuItem>
                  <MenuItem value="needs_maintenance">🔧 Cần bảo trì</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => {
              const now = new Date();
              const currentTime = now.toTimeString().slice(0, 5);
              setCheckOutDialog({ open: false, booking: null, roomCondition: 'good', checkOutTime: currentTime });
            }}
            color="inherit"
          >
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmCheckOut}
            variant="contained"
            sx={{ 
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }
            }}
          >
            Xác nhận Check-out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingManagement;
