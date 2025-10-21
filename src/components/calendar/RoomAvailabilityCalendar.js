import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Hotel as HotelIcon,
  CheckCircle as AvailableIcon,
  Cancel as UnavailableIcon,
  Warning as MaintenanceIcon,
  CleaningServices as CleaningIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { roomsAPI } from '../../services/api';

const RoomAvailabilityCalendar = ({ roomId, onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [availabilityData, setAvailabilityData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock availability data for demonstration
  const mockAvailabilityData = [
    {
      date: dayjs().format('YYYY-MM-DD'),
      status: 'available',
      bookings: [],
    },
    {
      date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      status: 'occupied',
      bookings: [
        {
          id: 'BK001',
          customerName: 'Nguyễn Văn A',
          checkIn: dayjs().add(1, 'day').format('YYYY-MM-DD'),
          checkOut: dayjs().add(3, 'day').format('YYYY-MM-DD'),
        }
      ],
    },
    {
      date: dayjs().add(2, 'day').format('YYYY-MM-DD'),
      status: 'occupied',
      bookings: [
        {
          id: 'BK001',
          customerName: 'Nguyễn Văn A',
          checkIn: dayjs().add(1, 'day').format('YYYY-MM-DD'),
          checkOut: dayjs().add(3, 'day').format('YYYY-MM-DD'),
        }
      ],
    },
    {
      date: dayjs().add(3, 'day').format('YYYY-MM-DD'),
      status: 'cleaning',
      bookings: [],
    },
    {
      date: dayjs().add(4, 'day').format('YYYY-MM-DD'),
      status: 'available',
      bookings: [],
    },
    {
      date: dayjs().add(5, 'day').format('YYYY-MM-DD'),
      status: 'maintenance',
      bookings: [],
    },
    {
      date: dayjs().add(6, 'day').format('YYYY-MM-DD'),
      status: 'available',
      bookings: [],
    },
  ];

  useEffect(() => {
    fetchAvailabilityData();
  }, [selectedDate, roomId]);

  const fetchAvailabilityData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would fetch from the API
      // const response = await axios.get(`${API_BASE_URL}/rooms/${roomId}/availability-calendar`, {
      //   params: {
      //     month: selectedDate.format('YYYY-MM'),
      //   }
      // });
      
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAvailabilityData(mockAvailabilityData);
    } catch (err) {
      setError('Không thể tải dữ liệu lịch');
      console.error('Error fetching availability data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'success',
      occupied: 'error',
      cleaning: 'warning',
      maintenance: 'info',
      reserved: 'secondary',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      available: <AvailableIcon />,
      occupied: <UnavailableIcon />,
      cleaning: <CleaningIcon />,
      maintenance: <MaintenanceIcon />,
      reserved: <CalendarIcon />,
    };
    return icons[status] || <CalendarIcon />;
  };

  const getStatusText = (status) => {
    const texts = {
      available: 'Có sẵn',
      occupied: 'Đã thuê',
      cleaning: 'Đang dọn dẹp',
      maintenance: 'Bảo trì',
      reserved: 'Đã đặt',
    };
    return texts[status] || status;
  };

  const handleDateClick = (dateData) => {
    if (dateData.status === 'available') {
      onDateSelect?.(dateData.date);
    }
  };

  const renderCalendarGrid = () => {
    const startOfMonth = selectedDate.startOf('month');
    const endOfMonth = selectedDate.endOf('month');
    const startOfWeek = startOfMonth.startOf('week');
    const endOfWeek = endOfMonth.endOf('week');
    
    const days = [];
    let currentDay = startOfWeek;
    
    while (currentDay.isBefore(endOfWeek) || currentDay.isSame(endOfWeek, 'day')) {
      const dayData = availabilityData.find(d => d.date === currentDay.format('YYYY-MM-DD'));
      
      days.push(
        <Grid item xs={12} sm={6} md={4} lg={3} key={currentDay.format('YYYY-MM-DD')}>
          <Card
            sx={{
              height: '100%',
              cursor: dayData?.status === 'available' ? 'pointer' : 'default',
              opacity: dayData?.status === 'available' ? 1 : 0.7,
              '&:hover': dayData?.status === 'available' ? {
                transform: 'translateY(-2px)',
                transition: 'all 0.2s',
                boxShadow: 2,
              } : {},
            }}
            onClick={() => handleDateClick(dayData)}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" component="div">
                  {currentDay.format('DD')}
                </Typography>
                <Chip
                  icon={getStatusIcon(dayData?.status || 'available')}
                  label={getStatusText(dayData?.status || 'available')}
                  color={getStatusColor(dayData?.status || 'available')}
                  size="small"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {currentDay.format('dddd, DD/MM/YYYY')}
              </Typography>
              
              {dayData?.bookings && dayData.bookings.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Khách: {dayData.bookings[0].customerName}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Mã: {dayData.bookings[0].id}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      );
      
      currentDay = currentDay.add(1, 'day');
    }
    
    return days;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Lịch khả dụng phòng
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
            <DatePicker
              label="Chọn tháng"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              views={['year', 'month']}
              slotProps={{
                textField: {
                  size: 'small',
                },
              }}
            />
          </LocalizationProvider>
          
          <Button
            variant="outlined"
            size="small"
            onClick={fetchAvailabilityData}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <CalendarIcon />}
          >
            Làm mới
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            {renderCalendarGrid()}
          </Grid>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Chú thích:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip icon={<AvailableIcon />} label="Có sẵn" color="success" size="small" />
              <Chip icon={<UnavailableIcon />} label="Đã thuê" color="error" size="small" />
              <Chip icon={<CleaningIcon />} label="Đang dọn dẹp" color="warning" size="small" />
              <Chip icon={<MaintenanceIcon />} label="Bảo trì" color="info" size="small" />
            </Box>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default RoomAvailabilityCalendar;
