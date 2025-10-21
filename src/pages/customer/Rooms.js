import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Grid,
  Button,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  Skeleton,
  Pagination
} from '@mui/material';
import {
  Search,
  CalendarToday,
  People,
  FilterList,
  Sort
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import CustomerLayout from '../../layouts/CustomerLayout';
import RoomCard from '../../components/common/RoomCard';
import { roomsAPI } from '../../services/api';

const Rooms = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Search and filter state
  const [searchParams, setSearchParams] = useState({
    checkIn: dayjs().add(1, 'day'),
    checkOut: dayjs().add(2, 'day'),
    guests: 2,
    roomType: '',
    priceRange: '',
    sortBy: 'price-asc'
  });

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);

  const roomsPerPage = 9;

  // Fetch rooms on component mount and when filters change
  useEffect(() => {
    fetchRooms();
  }, [currentPage, searchParams]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: currentPage,
        limit: roomsPerPage,
        checkIn: searchParams.checkIn.format('YYYY-MM-DD'),
        checkOut: searchParams.checkOut.format('YYYY-MM-DD'),
        guests: searchParams.guests,
        roomType: searchParams.roomType,
        sortBy: searchParams.sortBy
      };

      const response = await roomsAPI.getRooms(params);

      if (response.data.success) {
        setRooms(response.data.data.rooms || []);
        const total = response.data.data.total || response.data.data.rooms?.length || 0;
        setTotalPages(Math.ceil(total / roomsPerPage));
        setTotalRooms(total);
      } else {
        setError('Không thể tải danh sách phòng');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Lỗi khi tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchRooms();
  };

  const handleBookRoom = (room) => {
    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: '/book-room' },
          roomData: room,
          searchParams: searchParams
        }
      });
      return;
    }

    navigate('/book-room', {
      state: {
        roomId: room._id,
        checkIn: searchParams.checkIn.format('YYYY-MM-DD'),
        checkOut: searchParams.checkOut.format('YYYY-MM-DD'),
        guests: searchParams.guests
      }
    });
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <CustomerLayout>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        {/* Header */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 6,
          px: 3
        }}>
          <Container maxWidth="lg">
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              Tất cả phòng khách sạn
            </Typography>
            <Typography variant="h6" sx={{ textAlign: 'center', opacity: 0.9 }}>
              Khám phá {totalRooms} phòng với tiện nghi cao cấp và dịch vụ 5 sao
            </Typography>
          </Container>
        </Box>

        {/* Search and Filter Section */}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
              <Search sx={{ mr: 1, verticalAlign: 'middle' }} />
              Tìm kiếm và lọc phòng
            </Typography>
            
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={2}>
                  <DatePicker
                    label="Nhận phòng"
                    value={searchParams.checkIn}
                    onChange={(newValue) => setSearchParams(prev => ({ ...prev, checkIn: newValue }))}
                    minDate={dayjs()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
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
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <DatePicker
                    label="Trả phòng"
                    value={searchParams.checkOut}
                    onChange={(newValue) => setSearchParams(prev => ({ ...prev, checkOut: newValue }))}
                    minDate={searchParams.checkIn.add(1, 'day')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
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
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    label="Số khách"
                    type="number"
                    size="small"
                    value={searchParams.guests}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, guests: parseInt(e.target.value) || 1 }))}
                    inputProps={{ min: 1, max: 10 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <People fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Loại phòng</InputLabel>
                    <Select
                      value={searchParams.roomType}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, roomType: e.target.value }))}
                      label="Loại phòng"
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      <MenuItem value="Standard">Standard</MenuItem>
                      <MenuItem value="Deluxe">Deluxe</MenuItem>
                      <MenuItem value="Suite">Suite</MenuItem>
                      <MenuItem value="Presidential">Presidential</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Sắp xếp</InputLabel>
                    <Select
                      value={searchParams.sortBy}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, sortBy: e.target.value }))}
                      label="Sắp xếp"
                    >
                      <MenuItem value="price-asc">Giá tăng dần</MenuItem>
                      <MenuItem value="price-desc">Giá giảm dần</MenuItem>
                      <MenuItem value="name-asc">Tên A-Z</MenuItem>
                      <MenuItem value="name-desc">Tên Z-A</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSearch}
                    disabled={loading}
                    sx={{ 
                      height: '40px',
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                      }
                    }}
                    startIcon={<Search />}
                  >
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Tìm kiếm'}
                  </Button>
                </Grid>
              </Grid>
            </LocalizationProvider>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Paper>

          {/* Results Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {loading ? 'Đang tải...' : `Tìm thấy ${totalRooms || 0} phòng`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Trang {currentPage} / {totalPages || 1}
            </Typography>
          </Box>

          {/* Rooms Grid */}
          {loading ? (
            <Grid container spacing={3}>
              {[...Array(9)].map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          ) : rooms.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {rooms.map((room) => (
                  <Grid item xs={12} sm={6} md={4} key={room._id}>
                    <RoomCard room={room} onBookRoom={handleBookRoom} />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          ) : (
            <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Không tìm thấy phòng nào
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hãy thử thay đổi tiêu chí tìm kiếm của bạn
              </Typography>
            </Paper>
          )}
        </Container>
      </Box>
    </CustomerLayout>
  );
};

export default Rooms;
