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
  IconButton,
  Button,
  Avatar,
  Divider,
  Stack,
  Badge,
  Tooltip,
  Fade,
  Zoom,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Hotel as HotelIcon,
  BookOnline as BookOnlineIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  RoomService as RoomServiceIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI, roomsAPI, bookingsAPI, servicesAPI } from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    averageRating: 4.5,
    monthlyGrowth: 12.5,
    todayCheckIns: 0,
    todayCheckOuts: 0,
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [roomStatusData, setRoomStatusData] = useState([]);
  const [bookingTrendData, setBookingTrendData] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Colors for charts
  const COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
    purple: '#8b5cf6',
  };

  const pieColors = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.error];

  useEffect(() => {
    fetchDashboardData();
    
    // Auto refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch all data in parallel
      const [usersRes, roomsRes, bookingsRes, servicesRes] = await Promise.all([
        usersAPI.getUsers().catch(() => ({ data: { data: { users: [], total: 0 } } })),
        roomsAPI.getRooms().catch(() => ({ data: { data: { rooms: [], total: 0 } } })),
        bookingsAPI.getBookings().catch(() => ({ data: { data: { bookings: [], total: 0 } } })),
        servicesAPI.getServices().catch(() => ({ data: { data: { services: [], total: 0 } } })),
      ]);

      const users = usersRes.data.data?.users || [];
      const rooms = roomsRes.data.data?.rooms || [];
      const bookings = bookingsRes.data.data?.bookings || [];
      const services = servicesRes.data.data?.services || [];

      // Calculate stats
      const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
      const occupiedRooms = rooms.filter(room => room.status === 'occupied').length;
      const occupancyRate = rooms.length > 0 ? (occupiedRooms / rooms.length) * 100 : 0;
      
      // Today's check-ins/outs
      const today = new Date().toISOString().split('T')[0];
      const todayCheckIns = bookings.filter(b => 
        b.checkInDate && b.checkInDate.split('T')[0] === today
      ).length;
      const todayCheckOuts = bookings.filter(b => 
        b.checkOutDate && b.checkOutDate.split('T')[0] === today
      ).length;

      setStats({
        totalUsers: users.length,
        totalRooms: rooms.length,
        totalBookings: bookings.length,
        totalRevenue,
        occupancyRate,
        averageRating: 4.5,
        monthlyGrowth: 12.5,
        todayCheckIns,
        todayCheckOuts,
      });

      // Recent bookings (last 5)
      const sortedBookings = bookings
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentBookings(sortedBookings);

      // Room status data for pie chart
      const roomStatusCounts = rooms.reduce((acc, room) => {
        acc[room.status] = (acc[room.status] || 0) + 1;
        return acc;
      }, {});

      const roomStatusChartData = [
        { name: 'Có khách', value: roomStatusCounts.occupied || 0, color: COLORS.error },
        { name: 'Trống', value: roomStatusCounts.available || 0, color: COLORS.success },
        { name: 'Bảo trì', value: roomStatusCounts.maintenance || 0, color: COLORS.warning },
        { name: 'Dọn dẹp', value: roomStatusCounts.cleaning || 0, color: COLORS.info },
      ].filter(item => item.value > 0);

      setRoomStatusData(roomStatusChartData);

      // Generate revenue trend data (last 6 months)
      const revenueByMonth = generateRevenueData(bookings);
      setRevenueData(revenueByMonth);

      // Generate booking trend data
      const bookingTrend = generateBookingTrendData(bookings);
      setBookingTrendData(bookingTrend);

      // Generate notifications
      const notifs = generateNotifications(rooms, bookings);
      setNotifications(notifs);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateRevenueData = (bookings) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
      
      const monthRevenue = bookings
        .filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return bookingDate.getMonth() === date.getMonth() && 
                 bookingDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

      months.push({
        month: monthName,
        revenue: monthRevenue,
        bookings: bookings.filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return bookingDate.getMonth() === date.getMonth() && 
                 bookingDate.getFullYear() === date.getFullYear();
        }).length,
      });
    }
    
    return months;
  };

  const generateBookingTrendData = (bookings) => {
    const last7Days = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' });
      const dateStr = date.toISOString().split('T')[0];
      
      const dayBookings = bookings.filter(booking => 
        booking.createdAt && booking.createdAt.split('T')[0] === dateStr
      ).length;

      last7Days.push({
        day: dayName,
        bookings: dayBookings,
        date: dateStr,
      });
    }
    
    return last7Days;
  };

  const generateNotifications = (rooms, bookings) => {
    const notifs = [];
    
    // Maintenance rooms
    const maintenanceRooms = rooms.filter(room => room.status === 'maintenance');
    if (maintenanceRooms.length > 0) {
      notifs.push({
        id: 'maintenance',
        type: 'warning',
        title: 'Phòng bảo trì',
        message: `${maintenanceRooms.length} phòng đang bảo trì`,
        icon: <WarningIcon />,
      });
    }

    // Today's check-ins
    if (stats.todayCheckIns > 0) {
      notifs.push({
        id: 'checkins',
        type: 'info',
        title: 'Check-in hôm nay',
        message: `${stats.todayCheckIns} khách check-in`,
        icon: <CheckCircleIcon />,
      });
    }

    // Today's check-outs
    if (stats.todayCheckOuts > 0) {
      notifs.push({
        id: 'checkouts',
        type: 'success',
        title: 'Check-out hôm nay',
        message: `${stats.todayCheckOuts} khách check-out`,
        icon: <ScheduleIcon />,
      });
    }

    return notifs.slice(0, 3); // Max 3 notifications
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            🏨 Dashboard Quản trị
              </Typography>
          <Typography variant="body1" color="text.secondary">
            Chào mừng trở lại, {user?.fullName}! Đây là tổng quan hệ thống của bạn.
              </Typography>
            </Box>
        <Button
          variant="outlined"
          startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
                onClick={handleRefresh} 
                disabled={refreshing}
          sx={{ borderRadius: 2 }}
        >
          {refreshing ? 'Đang tải...' : 'Làm mới'}
        </Button>
          </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in timeout={400}>
            <Card sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalUsers}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Tổng người dùng
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <PeopleIcon fontSize="large" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in timeout={600}>
            <Card sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalRooms}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Tổng phòng
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Tỷ lệ lấp đầy: {stats.occupancyRate.toFixed(1)}%
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <HotelIcon fontSize="large" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in timeout={800}>
            <Card sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalBookings}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Tổng đặt phòng
                    </Typography>
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="caption">
                        +{stats.monthlyGrowth}% tháng này
                    </Typography>
                  </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <BookOnlineIcon fontSize="large" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in timeout={1000}>
            <Card sx={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(250, 112, 154, 0.3)',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {formatPrice(stats.totalRevenue)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Tổng doanh thu
                    </Typography>
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <StarIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="caption">
                        Đánh giá: {stats.averageRating}/5
                    </Typography>
                  </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <MoneyIcon fontSize="large" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} mb={4}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Fade in timeout={1200}>
            <Paper sx={{ 
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📈 Doanh thu 6 tháng gần đây
              </Typography>
              <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                <ResponsiveContainer>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                    <RechartsTooltip 
                      formatter={(value) => [formatPrice(value), 'Doanh thu']}
                      labelStyle={{ color: '#666' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={COLORS.primary}
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Fade>
        </Grid>

        {/* Room Status Pie Chart */}
        <Grid item xs={12} md={4}>
          <Fade in timeout={1400}>
            <Paper sx={{ 
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              height: '100%',
            }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                🏠 Trạng thái phòng
              </Typography>
              <Box sx={{ width: '100%', height: 250, mt: 2 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={roomStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {roomStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Fade>
        </Grid>
      </Grid>

      {/* Bottom Row */}
      <Grid container spacing={3}>
        {/* Booking Trend */}
        <Grid item xs={12} md={6}>
          <Fade in timeout={1600}>
            <Paper sx={{ 
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📊 Xu hướng đặt phòng (7 ngày)
                </Typography>
              <Box sx={{ width: '100%', height: 250, mt: 2 }}>
                <ResponsiveContainer>
                  <BarChart data={bookingTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#666" />
                    <YAxis stroke="#666" />
                    <RechartsTooltip 
                      formatter={(value) => [value, 'Đặt phòng']}
                      labelStyle={{ color: '#666' }}
                    />
                    <Bar dataKey="bookings" fill={COLORS.success} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Fade>
        </Grid>

        {/* Recent Bookings & Notifications */}
        <Grid item xs={12} md={6}>
          <Fade in timeout={1800}>
            <Paper sx={{ 
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                🔔 Thông báo & Hoạt động gần đây
              </Typography>
              
              {/* Notifications */}
              <Box sx={{ mb: 3 }}>
                {notifications.map((notif) => (
                  <Alert 
                    key={notif.id}
                    severity={notif.type}
                    icon={notif.icon}
                    sx={{ mb: 1, borderRadius: 2 }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      {notif.title}
                    </Typography>
                    <Typography variant="body2">
                      {notif.message}
                </Typography>
                  </Alert>
                ))}
              </Box>
              
              <Divider sx={{ my: 2 }} />

              {/* Recent Bookings */}
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Đặt phòng gần đây
              </Typography>
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {recentBookings.map((booking, index) => (
                  <Box key={booking._id} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    py: 1,
                    borderBottom: index < recentBookings.length - 1 ? '1px solid #f0f0f0' : 'none'
                  }}>
                            <Avatar sx={{ 
                      bgcolor: COLORS.primary, 
                              width: 32, 
                              height: 32, 
                              mr: 2,
                      fontSize: '0.8rem'
                            }}>
                      {booking.customer?.fullName?.charAt(0) || 'K'}
                            </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {booking.customer?.fullName || 'Khách hàng'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Phòng {booking.room?.roomNumber || '?'} • {formatPrice(booking.totalAmount || 0)}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                      label={booking.status || 'pending'}
                      color={booking.status === 'confirmed' ? 'success' : 'default'}
                    />
                  </Box>
                ))}
                </Box>
            </Paper>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
