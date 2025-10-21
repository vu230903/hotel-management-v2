import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Divider,
  Alert,
  Skeleton,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
  CircularProgress
} from '@mui/material';
import {
  CalendarToday,
  People,
  AttachMoney,
  Wifi,
  Restaurant,
  Tv,
  AcUnit,
  Bathtub,
  Hotel,
  Star,
  ArrowBack,
  CheckCircle,
  Close,
  Add
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import CustomerLayout from '../../layouts/CustomerLayout';
import { roomsAPI, bookingsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    checkIn: searchParams.get('checkIn') ? dayjs(searchParams.get('checkIn')) : dayjs().add(1, 'day'),
    checkOut: searchParams.get('checkOut') ? dayjs(searchParams.get('checkOut')) : dayjs().add(2, 'day'),
    guests: parseInt(searchParams.get('guests')) || 2
  });

  // Calculate pricing
  const calculatePricing = () => {
    if (!room) return { roomPrice: 0, serviceFee: 0, total: 0 };
    
    const nights = bookingForm.checkOut.diff(bookingForm.checkIn, 'day');
    const roomPrice = room.basePrice * nights;
    const serviceFee = roomPrice * 0.05; // 5% service fee
    const total = roomPrice + serviceFee;
    
    return { roomPrice, serviceFee, total };
  };

  // Get amenity info
  const getAmenityInfo = (amenity) => {
    const amenityMap = {
      'wifi': { icon: <Wifi fontSize="small" color="primary" />, label: 'WIFI tốc độ cao' },
      'tv': { icon: <Tv fontSize="small" color="primary" />, label: 'TV màn hình phẳng' },
      'ac': { icon: <AcUnit fontSize="small" color="primary" />, label: 'Điều hòa' },
      'bathtub': { icon: <Bathtub fontSize="small" color="primary" />, label: 'Vòi sen & bồn tắm' },
      'bed': { icon: <Hotel fontSize="small" color="primary" />, label: 'Giường cao cấp' },
      'breakfast': { icon: <Restaurant fontSize="small" color="primary" />, label: 'Bữa sáng miễn phí' },
      'minibar': { icon: <Restaurant fontSize="small" color="primary" />, label: 'Minibar' },
      'safe': { icon: <Hotel fontSize="small" color="primary" />, label: 'Két an toàn' },
      'balcony': { icon: <Hotel fontSize="small" color="primary" />, label: 'Ban công' },
      'city_view': { icon: <Hotel fontSize="small" color="primary" />, label: 'View thành phố' }
    };
    
    return amenityMap[amenity] || { 
      icon: <Hotel fontSize="small" color="primary" />, 
      label: amenity.charAt(0).toUpperCase() + amenity.slice(1) 
    };
  };

  useEffect(() => {
    fetchRoomDetails();
  }, [id]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await roomsAPI.getRoom(id);
      
      if (response.data.success) {
        const roomData = response.data.data.room;
        // Map MongoDB data to display format
        const mappedRoom = {
          ...roomData,
          maxOccupancy: roomData.maxOccupancy || 2,
          roomSize: roomData.roomSize || 25,
          amenities: roomData.amenities || [],
          images: roomData.images || ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop'],
          description: roomData.description || 'Phòng đẹp với tiện nghi hiện đại'
        };
        setRoom(mappedRoom);
      } else {
        setError('Không tìm thấy phòng');
      }
    } catch (error) {
      console.error('Error fetching room details:', error);
        setError('Không thể tải thông tin phòng');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/login', { 
        state: { 
          from: { pathname: '/book-room' },
          roomData: room,
          searchParams: bookingForm
        }
      });
      return;
    }

    try {
      setBookingLoading(true);
      
      const bookingData = {
        roomId: room._id,
        checkIn: bookingForm.checkIn.format('YYYY-MM-DD'),
        checkOut: bookingForm.checkOut.format('YYYY-MM-DD'),
        guests: bookingForm.guests,
        totalAmount: calculatePricing().total
      };

      const response = await bookingsAPI.createBooking(bookingData);
      
      if (response.data.success) {
        setBookingSuccess(true);
        // Redirect to booking confirmation or booking history
        setTimeout(() => {
          navigate('/bookings');
        }, 2000);
      } else {
        setError('Không thể đặt phòng. Vui lòng thử lại.');
      }

    } catch (error) {
      console.error('Booking error:', error);
      setError('Lỗi khi đặt phòng. Vui lòng thử lại.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBackToRooms = () => {
    navigate('/rooms');
  };

  if (loading) {
    return (
      <CustomerLayout>
        <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ ml: 2 }}>
                Đang tải thông tin phòng...
              </Typography>
            </Box>
        </Container>
        </Box>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout>
        <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={handleBackToRooms}>
            Quay lại danh sách phòng
          </Button>
        </Container>
        </Box>
      </CustomerLayout>
    );
  }

  if (!room) {
    return (
      <CustomerLayout>
        <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Không tìm thấy phòng
          </Alert>
          <Button variant="contained" onClick={handleBackToRooms}>
            Quay lại danh sách phòng
          </Button>
        </Container>
        </Box>
      </CustomerLayout>
    );
  }

  return (
        <CustomerLayout>
      <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Back Button */}
              <Button
                startIcon={<ArrowBack />}
                onClick={handleBackToRooms}
            sx={{ mb: 3 }}
              >
                Quay lại danh sách phòng
              </Button>

          {/* Main Layout - Flexbox */}
          <Box sx={{ 
            display: 'flex', 
            gap: 4, 
            alignItems: 'flex-start',
            flexDirection: { xs: 'column', lg: 'row' }
          }}>
            {/* Left Side - Room Content (60%) */}
            <Box sx={{ 
              flex: { xs: '1 1 100%', lg: '0 0 60%' }, 
              minWidth: 0 
            }}>
              {/* Large Room Image */}
              <Card sx={{ mb: 3, overflow: 'hidden' }}>
                <Box sx={{ position: 'relative' }}>
                  <img
                    src={room.images?.[selectedImage] || room.images?.[0]}
                    alt={room.roomType}
                      style={{
                        width: '100%',
                      height: '400px',
                      objectFit: 'cover',
                      cursor: 'pointer'
                    }}
                    onClick={() => setImageModalOpen(true)}
                  />
                  <Box sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    fontSize: '0.875rem'
                  }}>
                    {selectedImage + 1} / {room.images?.length || 1}
                  </Box>
                  </Box>

                {/* Image Gallery Thumbnails */}
                {room.images && room.images.length > 1 && (
                  <Box sx={{ p: 2, display: 'flex', gap: 1, overflowX: 'auto' }}>
                    {room.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${room.roomType} ${index + 1}`}
                        style={{
                          width: '100px',
                          height: '75px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: selectedImage === index ? '3px solid #1976D2' : '3px solid transparent',
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => setSelectedImage(index)}
                      />
                    ))}
                  </Box>
                )}
              </Card>

              {/* Room Information */}
              <Card sx={{ mb: 3 }}>
                  <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Box>
                      <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                        {room.roomType === 'deluxe' ? 'Phòng Cao cấp' : 
                         room.roomType === 'presidential' ? 'Phòng Tổng thống' : room.roomType}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <People fontSize="small" color="primary" />
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {room.maxOccupancy} khách
                        </Typography>
                          </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Hotel fontSize="small" color="primary" />
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {room.roomSize}m²
                          </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Chip
                        label={`${new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(room.basePrice)}/đêm`}
                        sx={{
                          backgroundColor: '#FFD700',
                          color: '#000',
                          fontWeight: 'bold',
                        fontSize: '1.1rem',
                        px: 3,
                        py: 1.5,
                        borderRadius: 2
                        }}
                      />
                    </Box>

                  <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.7, fontSize: '1.1rem' }}>
                    {room.description}
                    </Typography>

                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                        Tiện nghi
                      </Typography>
                  <Grid container spacing={3}>
                    {room.amenities?.map((amenity, index) => {
                      const amenityInfo = getAmenityInfo(amenity);
                            return (
                        <Grid item xs={6} sm={4} key={index}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5,
                            p: 1,
                            borderRadius: 1,
                            '&:hover': {
                              backgroundColor: 'rgba(0,0,0,0.04)'
                            }
                          }}>
                            {amenityInfo.icon}
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {amenityInfo.label}
                            </Typography>
                                </Box>
                              </Grid>
                            );
                    })}
                      </Grid>
                  </CardContent>
                </Card>
            </Box>

            {/* Right Side - Booking Form (40%) */}
            <Box sx={{ 
              flex: { xs: '1 1 100%', lg: '0 0 40%' }, 
              minWidth: 0 
            }}>
              <Card sx={{ 
                position: 'sticky', 
                top: 20, 
                backgroundColor: 'white', 
                height: 'fit-content',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ 
                    fontWeight: 'bold', 
                    mb: 3,
                    color: '#1976D2',
                    textAlign: 'center'
                  }}>
                    Đặt phòng
                  </Typography>

                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                        Ngày nhận phòng
                      </Typography>
                      <DatePicker
                        value={bookingForm.checkIn}
                        onChange={(newValue) => setBookingForm(prev => ({ ...prev, checkIn: newValue }))}
                        minDate={dayjs()}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            placeholder: 'Chọn ngày',
                            InputProps: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CalendarToday fontSize="small" />
                                </InputAdornment>
                              ),
                            },
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                        Ngày trả phòng
                      </Typography>
                      <DatePicker
                        value={bookingForm.checkOut}
                        onChange={(newValue) => setBookingForm(prev => ({ ...prev, checkOut: newValue }))}
                        minDate={bookingForm.checkIn.add(1, 'day')}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            placeholder: 'Chọn ngày',
                            InputProps: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CalendarToday fontSize="small" />
                                </InputAdornment>
                              ),
                            },
                          },
                        }}
                      />
                    </Box>
                  </LocalizationProvider>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Số khách
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: 2,
                      p: 1,
                      border: '1px solid #e0e0e0',
                      borderRadius: 1
                    }}>
                      <IconButton
                        onClick={() => setBookingForm(prev => ({ 
                          ...prev, 
                          guests: Math.max(1, prev.guests - 1) 
                        }))}
                        disabled={bookingForm.guests <= 1}
                        sx={{ 
                          border: '1px solid #e0e0e0',
                          borderRadius: '50%',
                          width: 40,
                          height: 40
                        }}
                      >
                        <Close />
                      </IconButton>
                      <Typography variant="h6" sx={{ minWidth: '60px', textAlign: 'center', fontWeight: 'bold' }}>
                        {bookingForm.guests}
                      </Typography>
                      <IconButton
                        onClick={() => setBookingForm(prev => ({ 
                          ...prev, 
                          guests: Math.min(room.maxOccupancy, prev.guests + 1) 
                        }))}
                        disabled={bookingForm.guests >= room.maxOccupancy}
                        sx={{ 
                          border: '1px solid #e0e0e0',
                          borderRadius: '50%',
                          width: 40,
                          height: 40
                        }}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Tổng cộng</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                      }).format(calculatePricing().total)}
                      </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleBooking}
                    disabled={bookingLoading}
                    sx={{
                      py: 2.5,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      color: '#fff',
                      boxShadow: '0 10px 35px rgba(102, 126, 234, 0.5)',
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
                        boxShadow: '0 15px 45px rgba(102, 126, 234, 0.6)',
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
                    {bookingLoading ? <CircularProgress size={24} color="inherit" /> : 'Xác nhận đặt phòng'}
                  </Button>

                  {bookingSuccess && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Đặt phòng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Image Modal */}
      <Dialog
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setImageModalOpen(false)}
                  sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              zIndex: 1,
                    '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            ✕
          </IconButton>
          
          <img
            src={room?.images?.[selectedImage] || room?.images?.[0]}
            alt={room?.roomType}
                      style={{
                        width: '100%',
              height: 'auto',
              maxHeight: '90vh',
              objectFit: 'contain'
            }}
          />
          
          {room?.images && room.images.length > 1 && (
            <Box sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
                          px: 2,
              py: 1,
              borderRadius: 2
            }}>
              {room.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${room.roomType} ${index + 1}`}
                  style={{
                    width: '60px',
                    height: '45px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    border: selectedImage === index ? '2px solid #1976D2' : '2px solid transparent',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
        </Box>
      )}
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
};

export default RoomDetail;
