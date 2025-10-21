import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Avatar,
  Rating,
  InputAdornment,
  Slider,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
} from '@mui/material';
import {
  Hotel as HotelIcon,
  Wifi as WifiIcon,
  AcUnit as AcIcon,
  LocalBar as BarIcon,
  Tv as TvIcon,
  Bathtub as BathtubIcon,
  Pool as PoolIcon,
  FitnessCenter as GymIcon,
  Restaurant as RestaurantIcon,
  LocalTaxi as TaxiIcon,
  Spa as SpaIcon,
  RoomService as RoomServiceIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CreditCard as CreditCardIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import CustomerLayout from '../../layouts/CustomerLayout';
import { useAuth } from '../../contexts/AuthContext';
import RoomAvailabilityCalendar from '../../components/calendar/RoomAvailabilityCalendar';
import { servicesAPI, roomsAPI, bookingsAPI } from '../../services/api';

const steps = ['Chọn phòng', 'Thông tin đặt phòng', 'Dịch vụ bổ sung', 'Thanh toán', 'Xác nhận'];

const BookRoom = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roomType, setRoomType] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [amenities, setAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('price');
  
  // Booking states
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkInDate, setCheckInDate] = useState(dayjs().add(1, 'day'));
  const [checkOutDate, setCheckOutDate] = useState(dayjs().add(2, 'day'));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'calendar'
  const [selectedRoomForCalendar, setSelectedRoomForCalendar] = useState(null);
  
  // Additional services states
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceQuantities, setServiceQuantities] = useState({});
  const [availableServices, setAvailableServices] = useState([]);
  const [servicesByCategory, setServicesByCategory] = useState({});
  const [servicesLoading, setServicesLoading] = useState(false);
  
  // Amenity options for filtering
  const amenityOptions = [
    { value: 'wifi', label: 'WiFi miễn phí' },
    { value: 'pool', label: 'Hồ bơi' },
    { value: 'gym', label: 'Phòng gym' },
    { value: 'spa', label: 'Spa' },
    { value: 'restaurant', label: 'Nhà hàng' },
    { value: 'parking', label: 'Bãi đỗ xe' },
    { value: 'room_service', label: 'Dịch vụ phòng' },
    { value: 'air_conditioning', label: 'Điều hòa' },
    { value: 'balcony', label: 'Ban công' },
    { value: 'ocean_view', label: 'View biển' }
  ];
  
  // Fetch available rooms from API
  const fetchAvailableRooms = async () => {
    if (!checkInDate || !checkOutDate) return;
    
    setAvailabilityLoading(true);
    try {
      const response = await roomsAPI.getRooms({ 
        available: true,
        checkIn: checkInDate.format('YYYY-MM-DD'),
        checkOut: checkOutDate.format('YYYY-MM-DD'),
        roomType,
        amenities: amenities.join(',')
      });
      
      if (response.data.success) {
      setRooms(response.data.data.rooms);
      } else {
        console.error('Failed to fetch rooms:', response.data.message);
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // Load rooms when dates change
  useEffect(() => {
    fetchAvailableRooms();
  }, [checkInDate, checkOutDate, roomType, amenities]);

  // Fetch available services from API
  const fetchAvailableServices = async () => {
    setServicesLoading(true);
    try {
      const response = await servicesAPI.getCustomerServices();
      if (response.data.success) {
        setAvailableServices(response.data.data.services);
        setServicesByCategory(response.data.data.servicesByCategory);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setAvailableServices([]);
      setServicesByCategory({});
    } finally {
      setServicesLoading(false);
    }
  };

  // Load services when component mounts
  useEffect(() => {
    fetchAvailableServices();
  }, []);

  // Filter rooms based on search criteria
  useEffect(() => {
    let filtered = rooms.filter(room => {
      const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           room.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = room.basePrice >= priceRange[0] && room.basePrice <= priceRange[1];
      
      return matchesSearch && matchesPrice;
    });

    // Sort rooms
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.basePrice - b.basePrice;
        case 'rating':
          return b.rating - a.rating;
        case 'roomNumber':
          return a.roomNumber.localeCompare(b.roomNumber);
        default:
          return 0;
      }
    });

    setFilteredRooms(filtered);
  }, [rooms, searchTerm, priceRange, sortBy]);

  const getRoomTypeText = (type) => {
    const texts = {
      standard: 'Phòng Tiêu chuẩn',
      deluxe: 'Phòng Cao cấp',
      presidential: 'Phòng Tổng thống',
    };
    return texts[type] || type;
  };

  const getAmenityIcon = (amenity) => {
    const amenityMap = amenityOptions.find(a => a.value === amenity);
    return amenityMap ? amenityMap.icon : <HotelIcon />;
  };

  const getAmenityLabel = (amenity) => {
    const amenityMap = amenityOptions.find(a => a.value === amenity);
    return amenityMap ? amenityMap.label : amenity;
  };

  const calculateNights = () => {
    if (checkInDate && checkOutDate) {
      return checkOutDate.diff(checkInDate, 'day');
    }
    return 0;
  };

  const calculateTotalPrice = () => {
    if (selectedRoom && checkInDate && checkOutDate) {
      const nights = calculateNights();
      return selectedRoom.basePrice * nights;
    }
    return 0;
  };

  // Additional services functions
  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleServiceQuantityChange = (serviceId, quantity) => {
    setServiceQuantities(prev => ({
      ...prev,
      [serviceId]: quantity
    }));
  };

  const calculateServicesTotal = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = availableServices.find(s => s._id === serviceId);
      const quantity = serviceQuantities[serviceId] || 1;
      
      if (service) {
        if (service.unit === 'per_person') {
          return total + (service.price * quantity * (adults + children));
        } else if (service.unit === 'per_hour') {
          return total + (service.price * quantity);
        } else {
          return total + (service.price * quantity);
        }
      }
      return total;
    }, 0);
  };

  const calculateGrandTotal = () => {
    const roomTotal = calculateTotalPrice();
    const servicesTotal = calculateServicesTotal();
    const tax = Math.round((roomTotal + servicesTotal) * 0.1);
    return roomTotal + servicesTotal + tax;
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setActiveStep(1);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

              const handleBookingSubmit = async () => {
                setLoading(true);
                try {
                  const bookingData = {
                    room: selectedRoom._id,
                    checkIn: checkInDate.format('YYYY-MM-DD'),
                    checkOut: checkOutDate.format('YYYY-MM-DD'),
                    guests: {
                      adults,
                      children
                    },
                    notes: {
                      customer: specialRequests
                    },
                    additionalServices: selectedServices.map(serviceId => ({
                      service: serviceId,
                      quantity: serviceQuantities[serviceId] || 1
                    })),
                    payment: {
                      method: 'cash' // Default to cash payment
                    }
                  };

                  // Gửi booking đến API
                  const response = await bookingsAPI.createBooking(bookingData);
                  
                  if (response.data.success) {
                    setBookingSuccess(true);
                    setActiveStep(4);
                  } else {
                    throw new Error(response.data.message);
                  }
                } catch (error) {
                  console.error('Booking error:', error);
                  // Hiển thị lỗi cho user
                } finally {
                  setLoading(false);
                }
              };

              const handlePaymentSuccess = (result) => {
                setPaymentSuccess(true);
                setPaymentResult(result);
                setActiveStep(3);
              };

              const handlePaymentError = (error) => {
                console.error('Payment error:', error);
                // Payment error is handled by PaymentComponent
              };

  const handleAmenityToggle = (amenity) => {
    setAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const renderRoomSelection = () => {
    if (availabilityLoading) {
    return (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={24} />
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} />
                  <Box sx={{ mt: 2 }}>
                    <Skeleton variant="rectangular" height={36} />
      </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
    );
  }

  return (
      <Grid container spacing={3}>
        {filteredRooms.map((room) => (
          <Grid item xs={12} sm={6} md={4} key={room._id || room.id}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                opacity: room.isAvailable === false ? 0.6 : 1,
                '&:hover': { 
                  transform: 'translateY(-4px)', 
                  transition: 'all 0.3s',
                  boxShadow: 4
                }
              }}
              onClick={() => room.isAvailable !== false && handleRoomSelect(room)}
            >
              <CardMedia
                sx={{ height: 200 }}
                image={room.images?.[0] || 'https://via.placeholder.com/400x300?text=Room+Image'}
                title={`Phòng ${room.roomNumber}`}
              />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" component="div">
                  Phòng {room.roomNumber}
                </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Rating value={room.rating || 4.5} precision={0.1} size="small" readOnly />
                    <Typography variant="body2" color="text.secondary">
                      ({room.reviews || 0})
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tầng {room.floor} • {getRoomTypeText(room.roomType)} • {room.roomSize}m²
                </Typography>
                
                <Typography variant="h6" color="primary" gutterBottom>
                  {room.basePrice?.toLocaleString() || room.currentPrice?.toLocaleString()}đ/đêm
                </Typography>
                
                {room.totalPrice && (
                  <Typography variant="body2" color="success.main" gutterBottom>
                    Tổng: {room.totalPrice.toLocaleString()}đ ({room.nights} đêm)
                  </Typography>
                )}
                
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {room.description}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  {room.amenities?.slice(0, 4).map((amenity) => (
                    <Chip
                      key={amenity}
                      icon={getAmenityIcon(amenity)}
                      label={getAmenityLabel(amenity)}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PeopleIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Tối đa {room.maxOccupancy} người
                </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  variant="contained"
                  fullWidth
                    startIcon={<CalendarIcon />}
                    disabled={room.isAvailable === false}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoomSelect(room);
                    }}
                    sx={{
                      py: 1.5,
                      borderRadius: 2.5,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '0.95rem',
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
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                      '&:disabled': {
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%)',
                      },
                    }}
                  >
                    {room.isAvailable === false ? 'Không có sẵn' : 'Chọn phòng này'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRoomForCalendar(room);
                      setViewMode('calendar');
                    }}
                    sx={{
                      py: 1.5,
                      px: 2,
                      borderRadius: 2.5,
                      borderColor: '#667eea',
                      color: '#667eea',
                      fontWeight: 600,
                      textTransform: 'none',
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
                    Lịch
                </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderBookingDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Thông tin đặt phòng
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                <DatePicker
                label="Ngày check-in"
                  value={checkInDate}
                  onChange={(newValue) => setCheckInDate(newValue)}
                  minDate={dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                <DatePicker
                label="Ngày check-out"
                  value={checkOutDate}
                  onChange={(newValue) => setCheckOutDate(newValue)}
                  minDate={checkInDate?.add(1, 'day')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số người lớn"
                type="number"
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value))}
                inputProps={{ min: 1, max: selectedRoom?.maxOccupancy || 10 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PeopleIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số trẻ em"
                type="number"
                value={children}
                onChange={(e) => setChildren(parseInt(e.target.value))}
                inputProps={{ min: 0, max: 5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PeopleIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Yêu cầu đặc biệt"
                multiline
                rows={3}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Ví dụ: Phòng tầng cao, giường đôi, không hút thuốc..."
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
          <Typography variant="h6" gutterBottom>
            Tóm tắt đặt phòng
          </Typography>

          {selectedRoom && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {selectedRoom.roomNumber} - {getRoomTypeText(selectedRoom.roomType)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedRoom.description}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Check-in: {checkInDate?.format('DD/MM/YYYY')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Check-out: {checkOutDate?.format('DD/MM/YYYY')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Số đêm: {calculateNights()} đêm
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Người lớn: {adults}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Trẻ em: {children}
              </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                  {selectedRoom.basePrice.toLocaleString()}đ × {calculateNights()} đêm
              </Typography>
              <Typography variant="body2">
                  {(selectedRoom.basePrice * calculateNights()).toLocaleString()}đ
              </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Thuế (10%)</Typography>
              <Typography variant="body2">
                  {Math.round(selectedRoom.basePrice * calculateNights() * 0.1).toLocaleString()}đ
              </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Tổng cộng</Typography>
              <Typography variant="h6" color="primary">
                  {Math.round(selectedRoom.basePrice * calculateNights() * 1.1).toLocaleString()}đ
              </Typography>
            </Box>
            </>
          )}
        </Paper>
      </Grid>
    </Grid>
  );

  const renderAdditionalServices = () => (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Dịch vụ bổ sung
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Chọn các dịch vụ bổ sung cho chuyến lưu trú của bạn
      </Typography>

      {servicesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {Object.entries(servicesByCategory).map(([category, services]) => (
            <Paper key={category} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
                {category.replace('_', ' ')}
              </Typography>
              
              <Grid container spacing={2}>
                {services.map((service) => (
                  <Grid item xs={12} sm={6} md={4} key={service._id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: selectedServices.includes(service._id) ? 2 : 1,
                        borderColor: selectedServices.includes(service._id) ? 'primary.main' : 'divider',
                        '&:hover': { borderColor: 'primary.main' }
                      }}
                      onClick={() => handleServiceToggle(service._id)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                            {service.name}
                          </Typography>
                          <Chip 
                            label={selectedServices.includes(service._id) ? 'Đã chọn' : 'Chọn'}
                            color={selectedServices.includes(service._id) ? 'primary' : 'default'}
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {service.description}
                        </Typography>
                        
                        <Typography variant="h6" color="primary">
                          {service.price.toLocaleString()} VNĐ
                          {service.unit === 'per_person' && ' / người'}
                          {service.unit === 'per_hour' && ' / giờ'}
                          {service.unit === 'per_item' && ' / món'}
                          {service.unit === 'per_service' && ' / dịch vụ'}
                          {service.unit === 'per_kg' && ' / kg'}
                        </Typography>
                        
                        {selectedServices.includes(service._id) && (
                          <Box sx={{ mt: 2 }}>
                            <TextField
                              type="number"
                              label="Số lượng"
                              value={serviceQuantities[service._id] || 1}
                              onChange={(e) => handleServiceQuantityChange(service._id, parseInt(e.target.value) || 1)}
                              inputProps={{ min: 1, max: service.maxQuantity || 10 }}
                              size="small"
                              sx={{ width: 100 }}
                            />
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          ))}
          
          {availableServices.length === 0 && (
            <Alert severity="info">
              Hiện tại không có dịch vụ bổ sung nào khả dụng.
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );

              const renderPayment = () => {
                const baseAmount = selectedRoom ? selectedRoom.basePrice * calculateNights() : 0;
                const servicesAmount = calculateServicesTotal();
                const tax = Math.round((baseAmount + servicesAmount) * 0.1);
                const totalAmount = baseAmount + servicesAmount + tax;
                
                return (
                  <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                      Xác nhận thanh toán
                    </Typography>
                    
                    <Paper sx={{ p: 3, mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Tóm tắt đặt phòng
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Phòng: {selectedRoom?.name}</Typography>
                        <Typography>{selectedRoom?.basePrice?.toLocaleString()} VNĐ/đêm</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Số đêm: {calculateNights()}</Typography>
                        <Typography>{(selectedRoom?.basePrice * calculateNights())?.toLocaleString()} VNĐ</Typography>
                      </Box>
                      {servicesAmount > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography>Dịch vụ bổ sung:</Typography>
                          <Typography>{servicesAmount?.toLocaleString()} VNĐ</Typography>
            </Box>
          )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Thuế (10%):</Typography>
                        <Typography>{tax?.toLocaleString()} VNĐ</Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6">Tổng cộng:</Typography>
                        <Typography variant="h6" color="primary">
                          {totalAmount?.toLocaleString()} VNĐ
                        </Typography>
                      </Box>
                    </Paper>

                    <Alert severity="info" sx={{ mb: 3 }}>
                      Thanh toán sẽ được thực hiện tại khách sạn khi nhận phòng.
                    </Alert>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                      <Button 
                        variant="outlined" 
                        onClick={() => setActiveStep(1)}
                        size="large"
                      >
                        Quay lại
          </Button>
          <Button
            variant="contained"
            onClick={handleBookingSubmit}
                        disabled={loading}
                        size="large"
          >
            Xác nhận đặt phòng
          </Button>
                    </Box>
                  </Box>
                );
              };

              const renderConfirmation = () => (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                  <Typography variant="h4" gutterBottom>
                    Đặt phòng thành công!
                  </Typography>
                  
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Mã đặt phòng: #{Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </Typography>
                  
                  {paymentResult && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body1" gutterBottom>
                        Mã giao dịch: {paymentResult.transactionId}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Số tiền đã thanh toán: {paymentResult.totalAmount.toLocaleString()}đ
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Phương thức: {paymentResult.method}
              </Typography>
            </Box>
          )}
                  
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Chúng tôi đã gửi thông tin xác nhận và hóa đơn đến email của bạn
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/bookings')}
                    >
                      Xem lịch sử đặt phòng
          </Button>
          <Button
                      variant="outlined"
                      onClick={() => {
                        setActiveStep(0);
                        setSelectedRoom(null);
                        setBookingSuccess(false);
                        setPaymentSuccess(false);
                        setPaymentResult(null);
                      }}
                    >
                      Đặt phòng khác
          </Button>
                  </Box>
                </Box>
              );

  const renderCalendarView = () => {
    if (!selectedRoomForCalendar) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CalendarIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Chọn phòng để xem lịch khả dụng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nhấn vào một phòng để xem lịch khả dụng chi tiết
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Lịch khả dụng - Phòng {selectedRoomForCalendar.roomNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getRoomTypeText(selectedRoomForCalendar.roomType)} • Tầng {selectedRoomForCalendar.floor}
          </Typography>
        </Box>
        
        <RoomAvailabilityCalendar
          roomId={selectedRoomForCalendar._id || selectedRoomForCalendar.id}
          onDateSelect={(date) => {
            setCheckInDate(dayjs(date));
            setCheckOutDate(dayjs(date).add(1, 'day'));
            setViewMode('grid');
          }}
        />
    </Box>
    );
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return viewMode === 'grid' ? renderRoomSelection() : renderCalendarView();
      case 1:
        return renderBookingDetails();
      case 2:
        return renderAdditionalServices();
      case 3:
        return renderPayment();
      case 4:
        return renderConfirmation();
      default:
        return 'Unknown step';
    }
  };

  return (
    <CustomerLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Đặt phòng khách sạn
        </Typography>
        
        {/* Search and Filters */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Tìm kiếm và lọc phòng
            </Typography>
            {availabilityLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Đang kiểm tra tính khả dụng...
                </Typography>
              </Box>
            )}
          </Box>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Tìm kiếm phòng"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HotelIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Loại phòng</InputLabel>
                <Select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  label="Loại phòng"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="standard">Phòng Tiêu chuẩn</MenuItem>
                  <MenuItem value="deluxe">Phòng Cao cấp</MenuItem>
                  <MenuItem value="presidential">Phòng Tổng thống</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" gutterBottom>
                Khoảng giá: {priceRange[0].toLocaleString()}đ - {priceRange[1].toLocaleString()}đ
              </Typography>
              <Slider
                value={priceRange}
                onChange={(e, newValue) => setPriceRange(newValue)}
                valueLabelDisplay="auto"
                min={0}
                max={10000000}
                step={100000}
                valueLabelFormat={(value) => `${value.toLocaleString()}đ`}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sắp xếp</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sắp xếp"
                >
                  <MenuItem value="price">Giá tăng dần</MenuItem>
                  <MenuItem value="rating">Đánh giá cao nhất</MenuItem>
                  <MenuItem value="roomNumber">Số phòng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Tiện nghi:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {amenityOptions.map((amenity) => (
                <Chip
                  key={amenity.value}
                  icon={amenity.icon}
                  label={amenity.label}
                  clickable
                  color={amenities.includes(amenity.value) ? 'primary' : 'default'}
                  onClick={() => handleAmenityToggle(amenity.value)}
                />
              ))}
            </Box>
          </Box>
        </Paper>

        {/* Booking Stepper */}
        {selectedRoom && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        )}

        {/* View Mode Toggle */}
        {activeStep === 0 && (
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant={viewMode === 'grid' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('grid')}
              startIcon={<HotelIcon />}
            >
              Danh sách phòng
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('calendar')}
              startIcon={<CalendarIcon />}
            >
              Lịch khả dụng
            </Button>
          </Box>
        )}

        {/* Availability Status */}
        {!availabilityLoading && checkInDate && checkOutDate && viewMode === 'grid' && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Hiển thị {filteredRooms.length} phòng có sẵn từ {checkInDate.format('DD/MM/YYYY')} đến {checkOutDate.format('DD/MM/YYYY')} 
              ({calculateNights()} đêm)
            </Typography>
          </Alert>
        )}

        {/* Step Content */}
        <Box sx={{ mb: 4 }}>
          {getStepContent(activeStep)}
        </Box>

        {/* Navigation Buttons */}
        {selectedRoom && activeStep < 4 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                borderColor: '#667eea',
                color: '#667eea',
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                border: '2px solid',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: '#667eea',
                  backgroundColor: 'rgba(102, 126, 234, 0.08)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                },
                '&:disabled': {
                  borderColor: '#ddd',
                  color: '#999',
                },
              }}
            >
              Quay lại
            </Button>
            
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          {activeStep < 3 && (
                            <Button
                              variant="contained"
                              onClick={handleNext}
                              disabled={
                                (activeStep === 0 && !selectedRoom) ||
                                (activeStep === 1 && (!checkInDate || !checkOutDate))
                              }
                              sx={{
                                px: 4,
                                py: 1.5,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                fontSize: '1rem',
                                fontWeight: 700,
                                textTransform: 'none',
                                color: '#fff',
                                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
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
                                  transform: 'translateY(-3px) scale(1.02)',
                                  boxShadow: '0 12px 35px rgba(102, 126, 234, 0.5)',
                                  '&::before': {
                                    left: '100%',
                                  },
                                },
                                '&:active': {
                                  transform: 'translateY(-1px) scale(0.98)',
                                },
                                '&:disabled': {
                                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.5) 0%, rgba(118, 75, 162, 0.5) 100%)',
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  boxShadow: 'none',
                                },
                              }}
                            >
                              Tiếp theo
                            </Button>
                          )}
                        </Box>
          </Box>
        )}

        {/* No rooms found message */}
        {filteredRooms.length === 0 && !selectedRoom && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <HotelIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Không tìm thấy phòng phù hợp
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vui lòng thử điều chỉnh bộ lọc tìm kiếm
            </Typography>
          </Paper>
        )}
      </Container>
    </CustomerLayout>
  );
};

export default BookRoom;
