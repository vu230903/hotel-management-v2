import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  CircularProgress,
  Stack,
  Alert,
  Snackbar,
  Divider,
  Tooltip,
  Fade,
  Zoom,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Hotel as HotelIcon,
  BookOnline as BookOnlineIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  DateRange as DateRangeIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Visibility as ViewIcon,
  GetApp as GetAppIcon,
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
  ComposedChart,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { bookingsAPI, roomsAPI, usersAPI, servicesAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ReportsAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [reportType, setReportType] = useState('overview');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Data states
  const [overviewData, setOverviewData] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalRooms: 0,
    occupancyRate: 0,
    averageRating: 0,
    revenueGrowth: 0,
    bookingGrowth: 0,
  });

  const [revenueData, setRevenueData] = useState([]);
  const [bookingData, setBookingData] = useState([]);
  const [roomPerformanceData, setRoomPerformanceData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [serviceRevenueData, setServiceRevenueData] = useState([]);
  const [monthlyComparisonData, setMonthlyComparisonData] = useState([]);
  const [occupancyTrendData, setOccupancyTrendData] = useState([]);
  const [topCustomersData, setTopCustomersData] = useState([]);

  // Colors for charts
  const COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
    purple: '#8b5cf6',
    pink: '#ec4899',
    indigo: '#6366f1',
  };

  const pieColors = [
    COLORS.primary, COLORS.success, COLORS.warning, COLORS.error, 
    COLORS.info, COLORS.purple, COLORS.pink, COLORS.indigo
  ];

  const tabs = [
    { label: 'Tổng quan', value: 'overview', icon: <AssessmentIcon /> },
    { label: 'Doanh thu', value: 'revenue', icon: <MoneyIcon /> },
    { label: 'Đặt phòng', value: 'bookings', icon: <BookOnlineIcon /> },
    { label: 'Phòng', value: 'rooms', icon: <HotelIcon /> },
    { label: 'Khách hàng', value: 'customers', icon: <PeopleIcon /> },
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
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

      // Process data
      processOverviewData(users, rooms, bookings, services);
      processRevenueData(bookings);
      processBookingData(bookings);
      processRoomPerformanceData(rooms, bookings);
      processCustomerData(users, bookings);
      processServiceRevenueData(services, bookings);
      processMonthlyComparison(bookings);
      processOccupancyTrend(rooms, bookings);
      processTopCustomers(users, bookings);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      showSnackbar('Có lỗi khi tải dữ liệu báo cáo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const processOverviewData = (users, rooms, bookings, services) => {
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
      const occupiedRooms = rooms.filter(room => room.status === 'occupied').length;
    const occupancyRate = rooms.length > 0 ? (occupiedRooms / rooms.length) * 100 : 0;
    
    // Calculate growth (mock data for now)
    const revenueGrowth = 12.5;
    const bookingGrowth = 8.3;
    const averageRating = 4.5;

      setOverviewData({
        totalRevenue,
      totalBookings: bookings.length,
      totalUsers: users.length,
      totalRooms: rooms.length,
        occupancyRate,
      averageRating,
        revenueGrowth,
        bookingGrowth,
      });
  };

  const processRevenueData = (bookings) => {
    // Generate revenue data for last 12 months
    const months = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
      
      const monthRevenue = bookings
        .filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return bookingDate.getMonth() === date.getMonth() && 
                 bookingDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
      
      const monthBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return bookingDate.getMonth() === date.getMonth() && 
                 bookingDate.getFullYear() === date.getFullYear();
      }).length;

      months.push({
        month: monthName,
        revenue: monthRevenue,
        bookings: monthBookings,
        averageValue: monthBookings > 0 ? monthRevenue / monthBookings : 0,
      });
    }
    
    setRevenueData(months);
  };

  const processBookingData = (bookings) => {
    // Booking status distribution
    const statusCounts = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});

    const bookingStatusData = [
      { name: 'Đã xác nhận', value: statusCounts.confirmed || 0, color: COLORS.success },
      { name: 'Chờ xử lý', value: statusCounts.pending || 0, color: COLORS.warning },
      { name: 'Đã hủy', value: statusCounts.cancelled || 0, color: COLORS.error },
      { name: 'Hoàn thành', value: statusCounts.completed || 0, color: COLORS.info },
    ].filter(item => item.value > 0);

    setBookingData(bookingStatusData);
  };

  const processRoomPerformanceData = (rooms, bookings) => {
    const roomPerformance = rooms.map(room => {
      const roomBookings = bookings.filter(booking => booking.room?._id === room._id);
      const revenue = roomBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
      
      return {
      roomNumber: room.roomNumber,
        type: room.type,
        bookings: roomBookings.length,
        revenue,
        occupancyRate: roomBookings.length > 0 ? (roomBookings.length / 30) * 100 : 0, // Assuming 30 days
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    setRoomPerformanceData(roomPerformance);
  };

  const processCustomerData = (users, bookings) => {
    const customers = users.filter(user => user.role === 'customer');
    
    // Customer segments
    const segments = [
      { name: 'VIP', count: Math.floor(customers.length * 0.1), color: COLORS.purple },
      { name: 'Thường xuyên', count: Math.floor(customers.length * 0.3), color: COLORS.success },
      { name: 'Mới', count: Math.floor(customers.length * 0.6), color: COLORS.info },
    ];

    setCustomerData(segments);
  };

  const processServiceRevenueData = (services, bookings) => {
    // Mock service revenue data
    const serviceRevenue = services.map(service => ({
      name: service.name,
      revenue: Math.random() * 10000000, // Mock revenue
      orders: Math.floor(Math.random() * 100),
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 8);

    setServiceRevenueData(serviceRevenue);
  };

  const processMonthlyComparison = (bookings) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonth = bookings.filter(booking => {
      const date = new Date(booking.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const lastMonth = bookings.filter(booking => {
      const date = new Date(booking.createdAt);
      return date.getMonth() === currentMonth - 1 && date.getFullYear() === currentYear;
    });

    const comparison = [
      {
        period: 'Tháng trước',
        bookings: lastMonth.length,
        revenue: lastMonth.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      },
      {
        period: 'Tháng này',
        bookings: thisMonth.length,
        revenue: thisMonth.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      },
    ];

    setMonthlyComparisonData(comparison);
  };

  const processOccupancyTrend = (rooms, bookings) => {
    // Generate occupancy trend for last 30 days
    const trend = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayBookings = bookings.filter(booking => {
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        return date >= checkIn && date <= checkOut;
      }).length;

      const occupancyRate = rooms.length > 0 ? (dayBookings / rooms.length) * 100 : 0;

      trend.push({
        date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        occupancy: occupancyRate,
        bookings: dayBookings,
      });
    }
    
    setOccupancyTrendData(trend);
  };

  const processTopCustomers = (users, bookings) => {
    const customers = users.filter(user => user.role === 'customer');
    
    const customerStats = customers.map(customer => {
      const customerBookings = bookings.filter(booking => booking.customer?._id === customer._id);
      const totalSpent = customerBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
      
      return {
        ...customer,
        bookingsCount: customerBookings.length,
        totalSpent,
        averageSpent: customerBookings.length > 0 ? totalSpent / customerBookings.length : 0,
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10);

    setTopCustomersData(customerStats);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const handleExport = () => {
    showSnackbar('Tính năng xuất báo cáo đang được phát triển', 'info');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderOverviewTab = () => (
    <Grid container spacing={3}>
            {/* Key Metrics */}
      <Grid item xs={12}>
        <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={400}>
                  <Card sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                borderRadius: 3,
              }}>
                <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                      <Typography variant="h4" fontWeight="bold">
                            {formatPrice(overviewData.totalRevenue)}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Tổng doanh thu
                          </Typography>
                      <Box display="flex" alignItems="center" mt={0.5}>
                        <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="caption">
                              +{overviewData.revenueGrowth}%
                            </Typography>
                          </Box>
                        </Box>
                    <MoneyIcon fontSize="large" />
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
              }}>
                <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                      <Typography variant="h4" fontWeight="bold">
                            {overviewData.totalBookings}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Tổng đặt phòng
                          </Typography>
                      <Box display="flex" alignItems="center" mt={0.5}>
                        <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="caption">
                              +{overviewData.bookingGrowth}%
                            </Typography>
                          </Box>
                        </Box>
                    <BookOnlineIcon fontSize="large" />
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
              }}>
                <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {overviewData.occupancyRate.toFixed(1)}%
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Tỷ lệ lấp đầy
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {overviewData.totalRooms} phòng
                          </Typography>
                        </Box>
                    <HotelIcon fontSize="large" />
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
              }}>
                <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {overviewData.averageRating}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Đánh giá trung bình
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {overviewData.totalUsers} khách hàng
                          </Typography>
                        </Box>
                    <StarIcon fontSize="large" />
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>
          </Grid>
              </Grid>
            </Grid>

      {/* Charts */}
              <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📈 Xu hướng doanh thu 12 tháng
                  </Typography>
          <Box sx={{ width: '100%', height: 400, mt: 2 }}>
            <ResponsiveContainer>
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis yAxisId="left" stroke="#666" tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                <YAxis yAxisId="right" orientation="right" stroke="#666" />
                <RechartsTooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatPrice(value) : value,
                    name === 'revenue' ? 'Doanh thu' : 'Số đặt phòng'
                  ]}
                />
                <Legend />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  fill={COLORS.primary}
                  fillOpacity={0.3}
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  name="Doanh thu"
                />
                <Bar yAxisId="right" dataKey="bookings" fill={COLORS.success} name="Số đặt phòng" />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📊 Phân bố trạng thái đặt phòng
                          </Typography>
          <Box sx={{ width: '100%', height: 300, mt: 2 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={bookingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {bookingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      {/* Monthly Comparison */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📅 So sánh tháng
                          </Typography>
          <Box sx={{ width: '100%', height: 250, mt: 2 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" stroke="#666" />
                <YAxis stroke="#666" />
                <RechartsTooltip />
                <Bar dataKey="bookings" fill={COLORS.info} name="Đặt phòng" />
              </BarChart>
            </ResponsiveContainer>
                        </Box>
        </Paper>
      </Grid>

      {/* Occupancy Trend */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🏠 Xu hướng lấp đầy (30 ngày)
          </Typography>
          <Box sx={{ width: '100%', height: 250, mt: 2 }}>
            <ResponsiveContainer>
              <LineChart data={occupancyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" domain={[0, 100]} />
                <RechartsTooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Tỷ lệ lấp đầy']} />
                <Line 
                  type="monotone" 
                  dataKey="occupancy" 
                  stroke={COLORS.purple}
                  strokeWidth={3}
                  dot={{ fill: COLORS.purple, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
                      </Box>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderRevenueTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            💰 Chi tiết doanh thu theo tháng
          </Typography>
          <Box sx={{ width: '100%', height: 400, mt: 2 }}>
            <ResponsiveContainer>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                <RechartsTooltip formatter={(value) => [formatPrice(value), 'Doanh thu']} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={COLORS.success}
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🛎️ Doanh thu dịch vụ
                  </Typography>
          <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
            {serviceRevenueData.map((service, index) => (
              <Box key={service.name} sx={{ mb: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2" noWrap sx={{ maxWidth: '60%' }}>
                    {service.name}
                          </Typography>
                  <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                    {formatPrice(service.revenue)}
                          </Typography>
                        </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {service.orders} đơn hàng
                  </Typography>
                  <Chip 
                    size="small" 
                    label={`#${index + 1}`} 
                    color={index < 3 ? 'success' : 'default'}
                  />
                </Box>
                <Box sx={{ 
                  height: 4, 
                  bgcolor: 'grey.200', 
                  borderRadius: 2,
                  overflow: 'hidden'
                }}>
                  <Box sx={{ 
                    height: '100%', 
                    width: `${(service.revenue / Math.max(...serviceRevenueData.map(s => s.revenue))) * 100}%`,
                    bgcolor: pieColors[index % pieColors.length],
                    borderRadius: 2,
                  }} />
                </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
  );

  const renderCustomersTab = () => (
            <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            👥 Phân khúc khách hàng
                  </Typography>
          <Box sx={{ width: '100%', height: 300, mt: 2 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={customerData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {customerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🏆 Top khách hàng VIP
          </Typography>
          <TableContainer sx={{ maxHeight: 300 }}>
            <Table stickyHeader>
                      <TableHead>
                <TableRow>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell align="right">Đặt phòng</TableCell>
                  <TableCell align="right">Tổng chi tiêu</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                {topCustomersData.map((customer, index) => (
                  <TableRow key={customer._id} hover>
                            <TableCell>
                      <Box display="flex" alignItems="center">
                        <Chip 
                          size="small" 
                          label={index + 1} 
                          color={index < 3 ? 'success' : 'default'}
                          sx={{ mr: 1, minWidth: 32 }}
                        />
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {customer.fullName}
                              </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {customer.email}
                              </Typography>
                        </Box>
                      </Box>
                            </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {customer.bookingsCount}
                              </Typography>
                            </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {formatPrice(customer.totalSpent)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
  );

  const renderRoomsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🏠 Hiệu suất phòng (Top 10)
              </Typography>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
                  <TableHead>
                <TableRow>
                  <TableCell>Phòng</TableCell>
                  <TableCell>Loại phòng</TableCell>
                  <TableCell align="right">Số đặt phòng</TableCell>
                  <TableCell align="right">Doanh thu</TableCell>
                  <TableCell align="right">Tỷ lệ lấp đầy</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                {roomPerformanceData.map((room, index) => (
                  <TableRow key={room.roomNumber} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                        <Chip 
                          size="small" 
                          label={index + 1} 
                          color={index < 3 ? 'success' : 'default'}
                          sx={{ mr: 1, minWidth: 32 }}
                        />
                        <Typography variant="body2" fontWeight="bold">
                          Phòng {room.roomNumber}
                              </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                      <Chip size="small" label={room.type} variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {room.bookings}
                          </Typography>
                        </TableCell>
                    <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                        {formatPrice(room.revenue)}
                          </Typography>
                        </TableCell>
                    <TableCell align="right">
                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {room.occupancyRate.toFixed(1)}%
                          </Typography>
                        <Box sx={{ 
                          width: 60, 
                          height: 6, 
                          bgcolor: 'grey.200', 
                          borderRadius: 3,
                          overflow: 'hidden'
                        }}>
                          <Box sx={{ 
                            height: '100%', 
                            width: `${Math.min(room.occupancyRate, 100)}%`,
                            bgcolor: room.occupancyRate > 70 ? 'success.main' : 
                                     room.occupancyRate > 40 ? 'warning.main' : 'error.main',
                            borderRadius: 3,
                          }} />
                        </Box>
                      </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              📊 Báo cáo & Phân tích
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Theo dõi hiệu suất kinh doanh và xu hướng phát triển
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ borderRadius: 2 }}
            >
              Làm mới
            </Button>
            <Button
              variant="contained"
              startIcon={<GetAppIcon />}
              onClick={handleExport}
              sx={{ borderRadius: 2 }}
            >
              Xuất báo cáo
            </Button>
          </Stack>
        </Box>

        {/* Date Range Filter */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <DateRangeIcon color="action" />
            </Grid>
            <Grid item>
              <TextField
                label="Từ ngày"
                type="date"
                size="small"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />
            </Grid>
            <Grid item>
              <TextField
                label="Đến ngày"
                type="date"
                size="small"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Paper sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={tab.value}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{ minHeight: 64, textTransform: 'none' }}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Fade in key={selectedTab} timeout={500}>
          <Box>
            {selectedTab === 0 && renderOverviewTab()}
            {selectedTab === 1 && renderRevenueTab()}
            {selectedTab === 2 && renderOverviewTab()} {/* Bookings use overview for now */}
            {selectedTab === 3 && renderRoomsTab()}
            {selectedTab === 4 && renderCustomersTab()}
          </Box>
        </Fade>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Box>
  );
};

export default ReportsAnalytics;
