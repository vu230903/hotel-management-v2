import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography, 
  CircularProgress, 
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Paper,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  Skeleton,
  AppBar,
  Toolbar,
  IconButton,
  Pagination
} from '@mui/material';
import {
  Hotel, 
  Restaurant, 
  LocalTaxi, 
  Spa,
  RoomService,
  Wifi,
  Pool,
  FitnessCenter,
  Search,
  CalendarToday,
  People,
  AttachMoney,
  Star,
  History,
  PlayArrow,
  ChevronLeft,
  ChevronRight,
  AccessTime,
  Security,
  LocalParking,
  BusinessCenter,
  RestaurantMenu,
  DirectionsCar,
  AcUnit,
  Tv,
  Bathtub,
  KingBed
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import CustomerLayout from '../../layouts/CustomerLayout';
import RoomCard from '../../components/common/RoomCard';
import { roomsAPI } from '../../services/api';

const CustomerDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Search state
  const [searchParams, setSearchParams] = useState({
    checkIn: dayjs().add(1, 'day'),
    checkOut: dayjs().add(2, 'day'),
    guests: 2,
    roomType: ''
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage] = useState(3);

  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Featured rooms state
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  // Customer reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Hotel amenities state
  const [hotelAmenities, setHotelAmenities] = useState([
    { icon: <Wifi />, title: 'WiFi miễn phí', description: 'Internet tốc độ cao 24/7' },
    { icon: <Pool />, title: 'Hồ bơi', description: 'Hồ bơi ngoài trời và trong nhà' },
    { icon: <FitnessCenter />, title: 'Phòng gym', description: 'Thiết bị tập luyện hiện đại' },
    { icon: <Spa />, title: 'Spa & Wellness', description: 'Dịch vụ massage và thư giãn' },
    { icon: <Restaurant />, title: 'Nhà hàng', description: 'Ẩm thực đa dạng và ngon miệng' },
    { icon: <BusinessCenter />, title: 'Trung tâm kinh doanh', description: 'Phòng họp và dịch vụ công việc' },
    { icon: <LocalParking />, title: 'Bãi đỗ xe', description: 'Đỗ xe miễn phí cho khách' },
    { icon: <Security />, title: 'An ninh 24/7', description: 'Bảo vệ và camera giám sát' }
  ]);

  // Animation state
  const [visibleSections, setVisibleSections] = useState({});
  const [scrollY, setScrollY] = useState(0);

  // Scroll animation handler
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Check which sections are visible
      const sections = ['featured-rooms', 'customer-reviews', 'hotel-amenities'];
      const newVisibleSections = {};
      
      sections.forEach(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
          newVisibleSections[sectionId] = isVisible;
        }
      });
      
      setVisibleSections(newVisibleSections);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch featured rooms on component mount
  useEffect(() => {
    fetchFeaturedRooms();
    fetchCustomerReviews();
  }, []);

  const fetchFeaturedRooms = async () => {
    try {
      setFeaturedLoading(true);
      const response = await roomsAPI.getRooms({ limit: 6 });
      if (response.data.success) {
        setFeaturedRooms(response.data.data.rooms);
      }
    } catch (error) {
      console.error('Error fetching featured rooms:', error);
    } finally {
      setFeaturedLoading(false);
    }
  };

  const fetchCustomerReviews = async () => {
    try {
      setReviewsLoading(true);
      // Mock reviews data for now - will integrate with API later
      const mockReviews = [
        {
          id: 1,
          customerName: 'Nguyễn Văn A',
          rating: 5,
          comment: 'Khách sạn tuyệt vời! Phòng sạch sẽ, nhân viên thân thiện. Sẽ quay lại lần sau.',
          roomType: 'Deluxe',
          date: '2024-01-15'
        },
        {
          id: 2,
          customerName: 'Trần Thị B',
          rating: 5,
          comment: 'Dịch vụ 5 sao, view đẹp, bữa sáng ngon. Rất hài lòng với trải nghiệm.',
          roomType: 'Suite',
          date: '2024-01-10'
        },
        {
          id: 3,
          customerName: 'Lê Văn C',
          rating: 4,
          comment: 'Phòng đẹp, tiện nghi đầy đủ. Chỉ có wifi hơi chậm một chút.',
          roomType: 'Standard',
          date: '2024-01-08'
        }
      ];
      setReviews(mockReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleRoomSearch = async () => {
    try {
      setSearchLoading(true);
      setSearchError('');
      
      const response = await roomsAPI.getRooms({
        checkIn: searchParams.checkIn.format('YYYY-MM-DD'),
        checkOut: searchParams.checkOut.format('YYYY-MM-DD'),
        guests: searchParams.guests,
        roomType: searchParams.roomType,
        limit: 6
      });

      if (response.data.success) {
        setSearchResults(response.data.data.rooms);
      } else {
        setSearchError('Không tìm thấy phòng phù hợp');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Lỗi khi tìm kiếm phòng');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleBookRoom = (room) => {
    if (!user) {
      // Redirect to login with room data for post-login redirect
      navigate('/login', {
        state: {
          from: { pathname: '/book-room' },
          roomData: room,
          searchParams: searchParams
        }
      });
      return;
    }

    // User is logged in, navigate to booking with pre-filled data
    navigate('/book-room', {
      state: {
        roomId: room._id,
        checkIn: searchParams.checkIn.format('YYYY-MM-DD'),
        checkOut: searchParams.checkOut.format('YYYY-MM-DD'),
        guests: searchParams.guests
      }
    });
  };

  // Scroll to search section when "Tìm phòng" is clicked
  const scrollToSearch = () => {
    const searchSection = document.getElementById('search-section');
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Vui lòng chờ trong giây lát
        </Typography>
      </Box>
    );
  }

  // Debug: Log user info
  console.log('Current user:', user);
  console.log('User role:', user?.role);

  // Always use CustomerLayout, but with different content based on auth status
  return (
    <CustomerLayout>
      <Box sx={{
        '@keyframes fadeInUp': {
          '0%': {
            opacity: 0,
            transform: 'translateY(30px)'
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)'
          }
        },
        '@keyframes slideInDown': {
          '0%': {
            opacity: 0,
            transform: 'translateY(-30px)'
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)'
          }
        },
        '@keyframes slideInUp': {
          '0%': {
            opacity: 0,
            transform: 'translateY(30px)'
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)'
          }
        },
        '@keyframes parallax': {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-20px)' }
        },
        '@keyframes backgroundSlide': {
          '0%': { opacity: 0 },
          '33%': { opacity: 1 },
          '66%': { opacity: 0 },
          '100%': { opacity: 0 }
        },
        '@keyframes backgroundSlide2': {
          '0%': { opacity: 0 },
          '33%': { opacity: 0 },
          '66%': { opacity: 1 },
          '100%': { opacity: 0 }
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        '@keyframes pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' }
        }
      }}>
        <Container 
          maxWidth="xl" 
          sx={{ 
            px: { xs: 0, sm: 1, md: 2 },
            '& .MuiContainer-root': {
              maxWidth: '100% !important'
            },
            '@media (max-width: 1200px)': {
              px: { xs: 0, sm: 0, md: 1 }
            },
            '@media (max-width: 900px)': {
              px: 0
            }
          }}
        >
        {/* Welcome Header - Show for both authenticated and non-authenticated users */}
        {user && (
          <Paper elevation={2} sx={{ 
            p: 3, 
            mb: 4, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)' }}>
                {(user.name || user.fullName || user.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  Chào mừng trở lại, {user.name || user.fullName || user.email?.split('@')[0] || 'Khách'}!
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Khám phá những trải nghiệm tuyệt vời tại Luxury Palace Hotel
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Hero Section with Search - Show for both */}
            <Box sx={{ 
              position: 'relative',
              height: '80vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              mb: 4,
              mx: { xs: 0, sm: -1, md: -2 }
            }}>
              {/* Background Image with Parallax */}
              <Box sx={{
                position: 'absolute',
                top: '-20%',
                left: 0,
                right: 0,
                height: '140%',
                backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=1080&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                zIndex: 1,
                animation: 'parallax 20s ease-in-out infinite alternate'
              }} />
              
              {/* Additional Background Images for Slider Effect */}
              <Box sx={{
                position: 'absolute',
                top: '-20%',
                left: 0,
                right: 0,
                height: '140%',
                backgroundImage: 'url(https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&h=1080&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                zIndex: 1,
                opacity: 0,
                animation: 'backgroundSlide 15s ease-in-out infinite'
              }} />
              
              <Box sx={{
                position: 'absolute',
                top: '-20%',
                left: 0,
                right: 0,
                height: '140%',
                backgroundImage: 'url(https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&h=1080&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                zIndex: 1,
                opacity: 0,
                animation: 'backgroundSlide2 15s ease-in-out infinite'
              }} />
              
              {/* Light overlay for text readability */}
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.3)',
                zIndex: 1
              }} />
              
              {/* Content */}
              <Box sx={{ position: 'relative', zIndex: 2, width: '100%', px: { xs: 1, sm: 2, md: 3 } }}>
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 4,
                  animation: 'fadeInUp 1s ease-out'
                }}>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      color: 'white', 
                      fontWeight: 'bold',
                      mb: 2,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      animation: 'slideInDown 1s ease-out 0.2s both',
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                    }}
                  >
                    Trải nghiệm kỳ nghỉ sang trọng
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.9)',
                      maxWidth: '600px',
                      mx: 'auto',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                      animation: 'slideInUp 1s ease-out 0.4s both',
                      fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
                    }}
                  >
                    Khám phá những phòng khách sạn đẳng cấp với tiện nghi hiện đại và dịch vụ 5 sao
            </Typography>
                </Box>

                {/* Search Bar */}
                <Paper elevation={8} sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: 'rgba(255,255,255,0.98)',
                  maxWidth: '900px',
                  mx: 'auto',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                }} id="search-section">
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6} md={2.4}>
                        <DatePicker
                          label="Nhận phòng"
                          value={searchParams.checkIn}
                          onChange={(newValue) => setSearchParams(prev => ({ ...prev, checkIn: newValue }))}
                          minDate={dayjs()}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              InputProps: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CalendarToday />
                                  </InputAdornment>
                                ),
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={2.4}>
                        <DatePicker
                          label="Trả phòng"
                          value={searchParams.checkOut}
                          onChange={(newValue) => setSearchParams(prev => ({ ...prev, checkOut: newValue }))}
                          minDate={searchParams.checkIn.add(1, 'day')}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              InputProps: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CalendarToday />
                                  </InputAdornment>
                                ),
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={2.4}>
                        <TextField
                          fullWidth
                          label="Số khách"
                          type="number"
                          value={searchParams.guests}
                          onChange={(e) => setSearchParams(prev => ({ ...prev, guests: parseInt(e.target.value) || 1 }))}
                          inputProps={{ min: 1, max: 10 }}
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <People fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                        />
        </Grid>
                      <Grid item xs={12} sm={6} md={2.4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Loại phòng</InputLabel>
                          <Select
                            value={searchParams.roomType}
                            onChange={(e) => setSearchParams(prev => ({ ...prev, roomType: e.target.value }))}
                            label="Loại phòng"
                          >
                            <MenuItem value="">Tất cả</MenuItem>
                            <MenuItem value="standard">Phòng Tiêu chuẩn</MenuItem>
                            <MenuItem value="deluxe">Phòng Cao cấp</MenuItem>
                            <MenuItem value="presidential">Phòng Tổng thống</MenuItem>
                          </Select>
                        </FormControl>
        </Grid>
                      <Grid item xs={12} sm={12} md={2.4}>
                         <Button
                           fullWidth
                           variant="contained"
                           size="large"
                           onClick={handleRoomSearch}
                           disabled={searchLoading}
                           sx={{ 
                             py: 2,
                             borderRadius: 3,
                             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                             fontSize: '1rem',
                             fontWeight: 700,
                             textTransform: 'none',
                             color: '#fff',
                             boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)',
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
                               boxShadow: '0 12px 40px rgba(102, 126, 234, 0.5)',
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
                             },
                           }}
                           startIcon={searchLoading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                         >
                          {searchLoading ? 'Đang tìm...' : 'Tìm phòng'}
                        </Button>
        </Grid>
      </Grid>
                  </LocalizationProvider>

                  {searchError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {searchError}
                    </Alert>
                  )}
                </Paper>
              </Box>
            </Box>

            {/* Featured Rooms Section */}
            <Box id="featured-rooms" sx={{ 
              mb: 6,
              opacity: visibleSections['featured-rooms'] ? 1 : 0,
              transform: visibleSections['featured-rooms'] ? 'translateY(0)' : 'translateY(50px)',
              transition: 'all 0.8s ease-out'
            }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' } }}>
                  Phòng nổi bật
        </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto', lineHeight: 1.6, fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}>
                  Khám phá những phòng được yêu thích nhất với tiện nghi cao cấp và dịch vụ tận tâm
            </Typography>
          </Box>
              
              {/* Featured Rooms Grid */}
              {featuredLoading ? (
                <Grid container spacing={3}>
                  {[...Array(3)].map((_, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2, mb: 2 }} />
                      <Skeleton variant="text" width="80%" />
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="40%" />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                 <Grid 
                   container 
                   spacing={1} 
                   sx={{ 
                     justifyContent: 'center', 
                     alignItems: 'stretch',
                     px: { xs: 0, sm: 1, md: 2 }
                   }}
                 >
                   {featuredRooms.length > 0 ? (
                     featuredRooms.slice((currentPage - 1) * roomsPerPage, currentPage * roomsPerPage).map((room) => (
                       <Grid 
                         item 
                         xs={12} 
                         sm={6} 
                         md={4} 
                         lg={4} 
                         xl={4} 
                         key={room._id} 
                         sx={{ 
                           display: 'flex'
                         }}
                       >
                         <Box sx={{ width: '100%', height: '100%' }}>
                           <RoomCard 
                             room={room} 
                             onBookRoom={handleBookRoom}
                           />
                         </Box>
                       </Grid>
                     ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                        Không tìm thấy phòng nổi bật nào.
            </Typography>
                    </Grid>
                  )}
                </Grid>
              )}
              
              {/* Pagination */}
              {featuredRooms.length > roomsPerPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                  <Pagination
                    count={Math.ceil(featuredRooms.length / roomsPerPage)}
                    page={currentPage}
                    onChange={(event, page) => setCurrentPage(page)}
                    color="primary"
                    size="large"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        fontSize: '1.1rem',
                        fontWeight: 600
                      }
                    }}
                  />
                </Box>
              )}

              {/* View All Rooms Button */}
              <Box sx={{ textAlign: 'center', mt: 2, mb: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/rooms')}
                  sx={{
                    px: 6,
                    py: 2,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)'
                    },
                    animation: 'pulse 2s ease-in-out infinite',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Xem tất cả phòng
            </Button>
          </Box>
            </Box>

            {/* Customer Reviews Section */}
            <Box id="customer-reviews" sx={{ 
              mb: 4,
              opacity: visibleSections['customer-reviews'] ? 1 : 0,
              transform: visibleSections['customer-reviews'] ? 'translateY(0)' : 'translateY(50px)',
              transition: 'all 0.8s ease-out 0.2s'
            }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' } }}>
                  Đánh giá khách hàng
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto', lineHeight: 1.6, fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}>
                  Những chia sẻ chân thực từ khách hàng đã trải nghiệm dịch vụ của chúng tôi
                </Typography>
              </Box>

              {reviewsLoading ? (
                <Grid container spacing={3}>
                  {[...Array(3)].map((_, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Grid container spacing={3}>
                  {reviews.map((review) => (
                    <Grid item xs={12} md={4} key={review.id}>
                      <Card sx={{ 
                        height: '100%', 
                        p: 3,
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            {review.customerName.charAt(0)}
                    </Avatar>
                      <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {review.customerName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                              {review.roomType} • {review.date}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              sx={{ 
                                color: i < review.rating ? '#FFD700' : '#E0E0E0',
                                fontSize: '1.2rem'
                              }} 
                            />
                          ))}
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          "{review.comment}"
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>

            {/* Hotel Amenities Section */}
            <Box id="hotel-amenities" sx={{ 
              mb: 4,
              opacity: visibleSections['hotel-amenities'] ? 1 : 0,
              transform: visibleSections['hotel-amenities'] ? 'translateY(0)' : 'translateY(50px)',
              transition: 'all 0.8s ease-out 0.4s'
            }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' } }}>
                  Tiện ích khách sạn
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto', lineHeight: 1.6, fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}>
                  Trải nghiệm đầy đủ các dịch vụ và tiện nghi cao cấp tại Luxury Palace Hotel
                        </Typography>
                      </Box>

              <Grid container spacing={3}>
                {hotelAmenities.map((amenity, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card sx={{ 
                      height: '100%', 
                      p: 3,
                      textAlign: 'center',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                      }
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mb: 2,
                        '& .MuiSvgIcon-root': {
                          fontSize: '2.5rem',
                          color: 'primary.main'
                        }
                      }}>
                        {amenity.icon}
                      </Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {amenity.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {amenity.description}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Search Results Section */}
            {searchResults.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                  Kết quả tìm kiếm
                        </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
                  Tìm thấy {searchResults.length} phòng phù hợp với yêu cầu của bạn
                        </Typography>
                
                 <Grid container spacing={1} sx={{ justifyContent: 'center', alignItems: 'stretch', px: { xs: 0, sm: 1, md: 2 } }}>
                   {searchResults.map((room) => (
                     <Grid item xs={12} sm={6} md={4} lg={4} xl={4} key={room._id} sx={{ display: 'flex' }}>
                       <Box sx={{ width: '100%', height: '100%' }}>
                         <RoomCard 
                           room={room} 
                           onBookRoom={handleBookRoom}
                         />
                       </Box>
                     </Grid>
                   ))}
                </Grid>
              </Box>
            )}

        {/* Hotel Services - Common for both */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Dịch vụ khách sạn
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Wifi color="primary" />
                <Typography variant="body2">WiFi miễn phí</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Pool color="primary" />
                <Typography variant="body2">Hồ bơi</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FitnessCenter color="primary" />
                <Typography variant="body2">Phòng gym</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RoomService color="primary" />
                <Typography variant="body2">Room service 24/7</Typography>
              </Box>
            </Grid>
          </Grid>
      </Paper>

        {/* Contact & Support - Common for both */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
            Hỗ trợ khách hàng
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" color="primary">
              Gọi điện thoại
            </Button>
            <Button variant="outlined" color="primary">
              Chat trực tuyến
            </Button>
            <Button variant="outlined" color="secondary">
              Email hỗ trợ
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
    </CustomerLayout>
  );
};

export default CustomerDashboard;
