import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tabs,
  Tab,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Skeleton,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  CalendarToday,
  Hotel,
  Person,
  Payment,
  Cancel,
  Edit,
  Visibility,
  CheckCircle,
  Schedule,
  Warning,
  Star,
  Receipt,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  ExpandMore,
  RoomService,
  AccessTime,
  AttachMoney,
  PersonOff,
} from '@mui/icons-material';
import CustomerLayout from '../../layouts/CustomerLayout';
import { bookingsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const BookingHistory = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellationStep, setCancellationStep] = useState(0);
  const [refundAmount, setRefundAmount] = useState(0);
  const [cancellationFee, setCancellationFee] = useState(0);
  const [processingCancellation, setProcessingCancellation] = useState(false);
  const [cancellationSuccess, setCancellationSuccess] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Fetch bookings from MongoDB
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await bookingsAPI.getBookings({
        page: 1,
        limit: 100, // Get all bookings for the customer
        sort: 'createdAt'
      });
      
      if (response.data.success) {
        setBookings(response.data.data.bookings);
        filterBookings(tabValue, response.data.data.bookings);
      } else {
        setError('Không thể tải danh sách đặt phòng');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Có lỗi xảy ra khi tải danh sách đặt phòng');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = (tabIndex, bookingsList = bookings) => {
    let filtered = [...bookingsList];
    
    switch (tabIndex) {
      case 0: // All
        break;
      case 1: // Upcoming
        filtered = filtered.filter(booking => 
          booking.status === 'confirmed' || booking.status === 'pending'
        );
        break;
      case 2: // Completed
        filtered = filtered.filter(booking => 
          booking.status === 'checked_out' || booking.status === 'completed'
        );
        break;
      case 3: // Cancelled
        filtered = filtered.filter(booking => 
          booking.status === 'cancelled' || booking.status === 'no_show'
        );
        break;
      default:
        break;
    }
    
    setFilteredBookings(filtered);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    filterBookings(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'checked_in':
        return 'info';
      case 'checked_out':
        return 'info';
      case 'cancelled':
        return 'error';
      case 'no_show':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle />;
      case 'pending':
        return <Schedule />;
      case 'checked_in':
        return <CheckCircle />;
      case 'checked_out':
        return <CheckCircle />;
      case 'cancelled':
        return <Cancel />;
      case 'no_show':
        return <PersonOff />;
      default:
        return <Warning />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xác nhận';
      case 'checked_in':
        return 'Đã check-in';
      case 'checked_out':
        return 'Đã check-out';
      case 'cancelled':
        return 'Đã hủy';
      case 'no_show':
        return 'Không đến';
      default:
        return status;
    }
  };

  const calculateCancellationFee = (booking) => {
    const checkInDate = new Date(booking.checkIn);
    const currentDate = new Date();
    const daysUntilCheckIn = Math.ceil((checkInDate - currentDate) / (1000 * 60 * 60 * 24));
    
    let feePercentage = 0;
    
    if (daysUntilCheckIn >= 7) {
      feePercentage = 0; // Free cancellation
    } else if (daysUntilCheckIn >= 3) {
      feePercentage = 0.1; // 10% fee
    } else if (daysUntilCheckIn >= 1) {
      feePercentage = 0.3; // 30% fee
    } else {
      feePercentage = 0.5; // 50% fee
    }
    
    return Math.round(booking.totalAmount * feePercentage);
  };

  const calculateRefundAmount = (booking) => {
    const cancellationFee = calculateCancellationFee(booking);
    return booking.totalAmount - cancellationFee;
  };

  const canCancelBooking = (booking) => {
    // Check if booking can be cancelled based on status and timing
    if (booking.status === 'cancelled' || booking.status === 'no_show' || 
        booking.status === 'checked_out') {
      return false;
    }
    
    const checkInDate = new Date(booking.checkIn);
    const currentDate = new Date();
    const hoursUntilCheckIn = (checkInDate - currentDate) / (1000 * 60 * 60);
    
    // Can cancel if more than 24 hours before check-in
    return hoursUntilCheckIn > 24;
  };

  const canReviewBooking = (booking) => {
    // Can review if booking is completed and no review exists
    return booking.status === 'checked_out' && !booking.review;
  };

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setCancellationStep(0);
    setCancellationFee(calculateCancellationFee(booking));
    setRefundAmount(calculateRefundAmount(booking));
    setCancelReason('');
    setCancellationSuccess(false);
    setCancelDialogOpen(true);
  };

  const handleNextCancellationStep = () => {
    if (cancellationStep === 0) {
      setCancellationStep(1);
    } else if (cancellationStep === 1 && cancelReason.trim()) {
      setCancellationStep(2);
    }
  };

  const handleBackCancellationStep = () => {
    setCancellationStep(prev => prev - 1);
  };

  const confirmCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy đặt phòng');
      return;
    }

    setProcessingCancellation(true);
    
    try {
      // Call MongoDB API to cancel booking
      const response = await bookingsAPI.cancelBooking(selectedBooking._id);
      
      if (response.data.success) {
        // Update local state
        setBookings(prev => prev.map(booking => 
          booking._id === selectedBooking._id 
            ? { 
                ...booking, 
                status: 'cancelled',
                statusHistory: [
                  ...booking.statusHistory,
                  {
                    status: 'cancelled',
                    changedAt: new Date(),
                    changedBy: user._id,
                    reason: cancelReason
                  }
                ]
              }
            : booking
        ));
        
        // Refresh filtered bookings
        filterBookings(tabValue);
        
        setCancellationSuccess(true);
        setCancellationStep(3);
      } else {
        throw new Error(response.data.message || 'Không thể hủy đặt phòng');
      }
      
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Có lỗi xảy ra khi hủy đặt phòng: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessingCancellation(false);
    }
  };

  const closeCancelDialog = () => {
    setCancelDialogOpen(false);
    setSelectedBooking(null);
    setCancelReason('');
    setCancellationStep(0);
    setCancellationSuccess(false);
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
  };

  const handleReview = (booking) => {
    // Navigate to review page
    console.log('Navigate to review for booking:', booking._id);
    // You can implement navigation to a review page here
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <CustomerLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Lịch sử đặt phòng
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchBookings}
            disabled={loading}
          >
            Làm mới
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
          >
            <Tab label="Tất cả" />
            <Tab label="Sắp tới" />
            <Tab label="Hoàn thành" />
            <Tab label="Đã hủy" />
          </Tabs>
        </Paper>

        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3].map((index) => (
              <Grid item xs={12} key={index}>
                <Card>
                  <CardContent>
                    <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
                    <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {filteredBookings.map((booking) => (
              <Grid item xs={12} key={booking._id}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      {/* Room Image */}
                      <Grid item xs={12} sm={4}>
                        <Box
                          component="img"
                          src={booking.room?.images?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300'}
                          alt={booking.room?.roomNumber || 'Room'}
                          sx={{
                            width: '100%',
                            height: 200,
                            objectFit: 'cover',
                            borderRadius: 2
                          }}
                        />
                      </Grid>

                      {/* Booking Details */}
                      <Grid item xs={12} sm={8}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6" component="h2">
                            Phòng {booking.room?.roomNumber} - {booking.room?.roomType}
                          </Typography>
                          <Chip
                            icon={getStatusIcon(booking.status)}
                            label={getStatusText(booking.status)}
                            color={getStatusColor(booking.status)}
                            variant="filled"
                          />
                        </Box>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarToday color="primary" />
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Check-in
                                </Typography>
                                <Typography variant="body2">
                                  {formatDate(booking.checkIn)}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>

                          <Grid item xs={6} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarToday color="primary" />
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Check-out
                                </Typography>
                                <Typography variant="body2">
                                  {formatDate(booking.checkOut)}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>

                          <Grid item xs={6} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Person color="primary" />
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Khách
                                </Typography>
                                <Typography variant="body2">
                                  {booking.guests.adults + booking.guests.children} người
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>

                          <Grid item xs={6} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Payment color="primary" />
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Tổng tiền
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {formatCurrency(booking.totalAmount)}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* Additional Services */}
                        {booking.additionalServices && booking.additionalServices.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Dịch vụ bổ sung:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {booking.additionalServices.map((service, index) => (
                                <Chip
                                  key={index}
                                  label={`${service.service?.name || 'Service'} (${service.quantity})`}
                                  size="small"
                                  variant="outlined"
                                  icon={<RoomService />}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}

                        {/* Booking Number */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Mã đặt phòng: <strong>{booking.bookingNumber}</strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Ngày đặt: {formatDateTime(booking.createdAt)}
                          </Typography>
                        </Box>

                        {/* Actions */}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button
                            variant="outlined"
                            startIcon={<Visibility />}
                            size="small"
                            onClick={() => handleViewDetails(booking)}
                          >
                            Xem chi tiết
                          </Button>

                          {canCancelBooking(booking) && (
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<Cancel />}
                              size="small"
                              onClick={() => handleCancelBooking(booking)}
                            >
                              Hủy đặt phòng
                            </Button>
                          )}

                          {canReviewBooking(booking) && (
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<Star />}
                              size="small"
                              onClick={() => handleReview(booking)}
                            >
                              Đánh giá
                            </Button>
                          )}

                          {booking.status === 'checked_out' && (
                            <Button
                              variant="outlined"
                              startIcon={<Receipt />}
                              size="small"
                            >
                              Hóa đơn
                            </Button>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && filteredBookings.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Không có đặt phòng nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bạn chưa có đặt phòng nào trong danh mục này
            </Typography>
          </Box>
        )}

        {/* Booking Details Dialog */}
        <Dialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Chi tiết đặt phòng
            {selectedBooking && (
              <Typography variant="subtitle2" color="text.secondary">
                {selectedBooking.bookingNumber}
              </Typography>
            )}
          </DialogTitle>
          
          <DialogContent>
            {selectedBooking && (
              <Box>
                <Grid container spacing={3}>
                  {/* Room Information */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Thông tin phòng
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Số phòng:</strong> {selectedBooking.room?.roomNumber}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Loại phòng:</strong> {selectedBooking.room?.roomType}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Tầng:</strong> {selectedBooking.room?.floor}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Giá cơ bản:</strong> {formatCurrency(selectedBooking.room?.basePrice || 0)}/đêm
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Booking Information */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Thông tin đặt phòng
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Check-in:</strong> {formatDate(selectedBooking.checkIn)}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Check-out:</strong> {formatDate(selectedBooking.checkOut)}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Số đêm:</strong> {Math.ceil((new Date(selectedBooking.checkOut) - new Date(selectedBooking.checkIn)) / (1000 * 60 * 60 * 24))}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Người lớn:</strong> {selectedBooking.guests.adults}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Trẻ em:</strong> {selectedBooking.guests.children}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Payment Information */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Thông tin thanh toán
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Phương thức:</strong> {
                            selectedBooking.payment.method === 'cash' ? 'Tiền mặt' :
                            selectedBooking.payment.method === 'card' ? 'Thẻ' :
                            selectedBooking.payment.method === 'bank_transfer' ? 'Chuyển khoản' :
                            selectedBooking.payment.method === 'online' ? 'Online' : selectedBooking.payment.method
                          }
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Trạng thái:</strong> {
                            selectedBooking.payment.status === 'paid' ? 'Đã thanh toán' :
                            selectedBooking.payment.status === 'pending' ? 'Chờ thanh toán' :
                            selectedBooking.payment.status === 'refunded' ? 'Đã hoàn tiền' :
                            selectedBooking.payment.status === 'failed' ? 'Thất bại' : selectedBooking.payment.status
                          }
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Tổng tiền:</strong> {formatCurrency(selectedBooking.totalAmount)}
                        </Typography>
                        {selectedBooking.payment.paidAt && (
                          <Typography variant="body2" gutterBottom>
                            <strong>Ngày thanh toán:</strong> {formatDateTime(selectedBooking.payment.paidAt)}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Status Information */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Trạng thái đặt phòng
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          {getStatusIcon(selectedBooking.status)}
                          <Typography variant="body2">
                            {getStatusText(selectedBooking.status)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" gutterBottom>
                          <strong>Ngày đặt:</strong> {formatDateTime(selectedBooking.createdAt)}
                        </Typography>
                        {selectedBooking.checkInInfo && (
                          <Typography variant="body2" gutterBottom>
                            <strong>Check-in thực tế:</strong> {formatDateTime(selectedBooking.checkInInfo.actualCheckIn)}
                          </Typography>
                        )}
                        {selectedBooking.checkOutInfo && (
                          <Typography variant="body2" gutterBottom>
                            <strong>Check-out thực tế:</strong> {formatDateTime(selectedBooking.checkOutInfo.actualCheckOut)}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Additional Services */}
                  {selectedBooking.additionalServices && selectedBooking.additionalServices.length > 0 && (
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Dịch vụ bổ sung
                          </Typography>
                          <List>
                            {selectedBooking.additionalServices.map((service, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <RoomService />
                                </ListItemIcon>
                                <ListItemText
                                  primary={service.service?.name || 'Service'}
                                  secondary={`Số lượng: ${service.quantity} | Giá: ${formatCurrency(service.totalPrice || 0)}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}

                  {/* Status History */}
                  {selectedBooking.statusHistory && selectedBooking.statusHistory.length > 0 && (
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Lịch sử trạng thái
                          </Typography>
                          <List>
                            {selectedBooking.statusHistory.map((history, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <HistoryIcon />
                                </ListItemIcon>
                                <ListItemText
                                  primary={getStatusText(history.status)}
                                  secondary={`${formatDateTime(history.changedAt)}${history.reason ? ` - ${history.reason}` : ''}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setDetailDialogOpen(false)}>
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced Cancellation Dialog */}
        <Dialog
          open={cancelDialogOpen}
          onClose={closeCancelDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Hủy đặt phòng
            {selectedBooking && (
              <Typography variant="subtitle2" color="text.secondary">
                Phòng {selectedBooking.room?.roomNumber} • {formatDate(selectedBooking.checkIn)} - {formatDate(selectedBooking.checkOut)}
              </Typography>
            )}
          </DialogTitle>
          
          <DialogContent>
            {selectedBooking && (
              <Box>
                <Stepper activeStep={cancellationStep} sx={{ mb: 3 }}>
                  <Step>
                    <StepLabel>Thông tin hủy</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Lý do hủy</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Xác nhận</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Hoàn thành</StepLabel>
                  </Step>
                </Stepper>

                {cancellationStep === 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Thông tin hủy đặt phòng
                    </Typography>
                    
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <InfoIcon sx={{ mr: 1 }} />
                      Bạn đang hủy đặt phòng này. Vui lòng xem xét kỹ các điều khoản hủy phòng.
                    </Alert>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              Thông tin đặt phòng
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                              Phòng: {selectedBooking.room?.roomNumber}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                              Check-in: {formatDate(selectedBooking.checkIn)}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                              Check-out: {formatDate(selectedBooking.checkOut)}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                              Số khách: {selectedBooking.guests.adults + selectedBooking.guests.children}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                              Tổng tiền: {formatCurrency(selectedBooking.totalAmount)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              Chính sách hủy phòng
                            </Typography>
                            
                            {(() => {
                              const checkInDate = new Date(selectedBooking.checkIn);
                              const currentDate = new Date();
                              const daysUntilCheckIn = Math.ceil((checkInDate - currentDate) / (1000 * 60 * 60 * 24));
                              
                              let policy = '';
                              let feePercentage = 0;
                              
                              if (daysUntilCheckIn >= 7) {
                                policy = 'Hủy miễn phí';
                                feePercentage = 0;
                              } else if (daysUntilCheckIn >= 3) {
                                policy = 'Phí hủy 10%';
                                feePercentage = 0.1;
                              } else if (daysUntilCheckIn >= 1) {
                                policy = 'Phí hủy 30%';
                                feePercentage = 0.3;
                              } else {
                                policy = 'Phí hủy 50%';
                                feePercentage = 0.5;
                              }
                              
                              const fee = Math.round(selectedBooking.totalAmount * feePercentage);
                              const refund = selectedBooking.totalAmount - fee;
                              
                              return (
                                <Box>
                                  <Typography variant="body2" gutterBottom>
                                    Còn {daysUntilCheckIn} ngày đến ngày check-in
                                  </Typography>
                                  <Typography variant="body2" gutterBottom>
                                    {policy}
                                  </Typography>
                                  <Divider sx={{ my: 1 }} />
                                  <Typography variant="body2" gutterBottom>
                                    Phí hủy: {formatCurrency(fee)}
                                  </Typography>
                                  <Typography variant="body2" gutterBottom>
                                    Hoàn tiền: {formatCurrency(refund)}
                                  </Typography>
                                </Box>
                              );
                            })()}
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {cancellationStep === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Lý do hủy đặt phòng
                    </Typography>
                    
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Vui lòng cho chúng tôi biết lý do hủy đặt phòng"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Ví dụ: Thay đổi kế hoạch, không thể đến được, tìm được phòng khác..."
                      sx={{ mb: 2 }}
                    />
                    
                    <Alert severity="warning">
                      <Warning sx={{ mr: 1 }} />
                      Việc hủy đặt phòng không thể hoàn tác. Bạn có chắc chắn muốn hủy?
                    </Alert>
                  </Box>
                )}

                {cancellationStep === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Xác nhận hủy đặt phòng
                    </Typography>
                    
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      <Warning sx={{ mr: 1 }} />
                      Bạn sắp hủy đặt phòng này. Vui lòng xác nhận thông tin dưới đây.
                    </Alert>

                    <Paper sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Tóm tắt hủy phòng
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Lý do: {cancelReason}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Phí hủy: {formatCurrency(cancellationFee)}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Số tiền hoàn: {formatCurrency(refundAmount)}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Phương thức hoàn tiền: {selectedBooking.payment.method === 'cash' ? 'Tại khách sạn' : 'Về tài khoản gốc'}
                      </Typography>
                    </Paper>
                  </Box>
                )}

                {cancellationStep === 3 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    {cancellationSuccess ? (
                      <>
                        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                        <Typography variant="h4" gutterBottom>
                          Hủy đặt phòng thành công!
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3 }}>
                          Đặt phòng đã được hủy và tiền hoàn sẽ được xử lý trong 3-5 ngày làm việc.
                        </Typography>
                        {refundAmount > 0 && (
                          <Alert severity="success" sx={{ mb: 2 }}>
                            Số tiền hoàn: {formatCurrency(refundAmount)}
                          </Alert>
                        )}
                      </>
                    ) : (
                      <>
                        <Cancel sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
                        <Typography variant="h4" gutterBottom>
                          Hủy đặt phòng thất bại
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3 }}>
                          Có lỗi xảy ra khi hủy đặt phòng. Vui lòng thử lại sau.
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          
          <DialogActions>
            {cancellationStep < 3 && (
              <>
                <Button onClick={closeCancelDialog}>
                  Đóng
                </Button>
                
                {cancellationStep > 0 && (
                  <Button onClick={handleBackCancellationStep}>
                    Quay lại
                  </Button>
                )}
                
                {cancellationStep < 2 && (
                  <Button
                    variant="contained"
                    onClick={handleNextCancellationStep}
                    disabled={cancellationStep === 1 && !cancelReason.trim()}
                  >
                    Tiếp theo
                  </Button>
                )}
                
                {cancellationStep === 2 && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={confirmCancel}
                    disabled={processingCancellation}
                    startIcon={processingCancellation ? <CircularProgress size={20} /> : <Cancel />}
                  >
                    {processingCancellation ? 'Đang xử lý...' : 'Xác nhận hủy'}
                  </Button>
                )}
              </>
            )}
            
            {cancellationStep === 3 && (
              <Button variant="contained" onClick={closeCancelDialog}>
                Đóng
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </CustomerLayout>
  );
};

export default BookingHistory;
