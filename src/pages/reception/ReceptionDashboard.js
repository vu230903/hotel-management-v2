import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Login as CheckInIcon,
  Logout as CheckOutIcon,
  Hotel as HotelIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { bookingsAPI, roomsAPI } from '../../services/api';

const ReceptionDashboard = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings
      const bookingsResponse = await bookingsAPI.getBookings({ limit: 20 });
      setBookings(bookingsResponse.data.data.bookings);

      // Fetch rooms
      const roomsResponse = await roomsAPI.getRooms({ limit: 50 });
      setRooms(roomsResponse.data.data.rooms);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'success',
      checked_in: 'info',
      checked_out: 'default',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      checked_in: 'Đã check-in',
      checked_out: 'Đã check-out',
      cancelled: 'Đã hủy',
    };
    return texts[status] || status;
  };

  const getRoomStatusColor = (status) => {
    const colors = {
      available: 'success',
      occupied: 'error',
      maintenance: 'warning',
      cleaning: 'info',
      out_of_order: 'error',
    };
    return colors[status] || 'default';
  };

  const getRoomStatusText = (status) => {
    const texts = {
      available: 'Có sẵn',
      occupied: 'Đang sử dụng',
      maintenance: 'Bảo trì',
      cleaning: 'Đang dọn dẹp',
      out_of_order: 'Hỏng hóc',
    };
    return texts[status] || status;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCheckIn = async (bookingId) => {
    try {
      await bookingsAPI.checkIn(bookingId, {
        roomKey: `KEY-${bookingId}`,
        additionalGuests: []
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Check-in error:', error);
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      await bookingsAPI.checkOut(bookingId, {
        roomCondition: 'good',
        damages: []
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Check-out error:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        BinBer Hotel - Dashboard Lễ Tân
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Chào mừng, {user?.fullName}!
      </Typography>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ScheduleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {bookings.filter(b => b.status === 'pending').length}
                  </Typography>
                  <Typography color="text.secondary">Chờ xác nhận</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckInIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {bookings.filter(b => b.status === 'checked_in').length}
                  </Typography>
                  <Typography color="text.secondary">Đang ở</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <HotelIcon color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {rooms.filter(r => r.status === 'available').length}
                  </Typography>
                  <Typography color="text.secondary">Phòng trống</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </Typography>
                  <Typography color="text.secondary">Đã xác nhận</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different views */}
      <Paper sx={{ p: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Đặt phòng" />
          <Tab label="Phòng" />
        </Tabs>

        {/* Bookings Tab */}
        {tabValue === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Phòng</TableCell>
                  <TableCell>Check-in</TableCell>
                  <TableCell>Check-out</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>{booking.customer?.fullName}</TableCell>
                    <TableCell>{booking.room?.roomNumber}</TableCell>
                    <TableCell>
                      {new Date(booking.checkIn).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      {new Date(booking.checkOut).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(booking.status)}
                        color={getStatusColor(booking.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {booking.status === 'confirmed' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleCheckIn(booking._id)}
                        >
                          Check-in
                        </Button>
                      )}
                      {booking.status === 'checked_in' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          onClick={() => handleCheckOut(booking._id)}
                        >
                          Check-out
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Rooms Tab */}
        {tabValue === 1 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Số phòng</TableCell>
                  <TableCell>Tầng</TableCell>
                  <TableCell>Loại phòng</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Trạng thái dọn dẹp</TableCell>
                  <TableCell>Giá</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room._id}>
                    <TableCell>{room.roomNumber}</TableCell>
                    <TableCell>{room.floor}</TableCell>
                    <TableCell>{room.roomType}</TableCell>
                    <TableCell>
                      <Chip
                        label={getRoomStatusText(room.status)}
                        color={getRoomStatusColor(room.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={room.cleaningStatus}
                        color={room.cleaningStatus === 'clean' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{room.basePrice?.toLocaleString()}đ</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default ReceptionDashboard;
