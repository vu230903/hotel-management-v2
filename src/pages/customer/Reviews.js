import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Chip,
  Avatar,
  Divider,
  Paper,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Star,
  Hotel,
  Restaurant,
  Pool,
  Spa,
  FitnessCenter,
  Wifi,
  RoomService,
  LocalTaxi,
  CleaningServices,
  LocationOn,
  AttachMoney,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material';
import CustomerLayout from '../../layouts/CustomerLayout';
import { reviewsAPI } from '../../services/api';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [bookingsForReview, setBookingsForReview] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    overallRating: 5,
    detailedRatings: {
      cleanliness: 5,
      comfort: 5,
      location: 5,
      value: 5,
      service: 5
    },
    comment: '',
    mentionedAmenities: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Amenity options for review form
  const amenityOptions = [
    { value: 'wifi', label: 'WiFi miễn phí', icon: <Wifi /> },
    { value: 'pool', label: 'Hồ bơi', icon: <Pool /> },
    { value: 'restaurant', label: 'Nhà hàng', icon: <Restaurant /> },
    { value: 'spa', label: 'Spa', icon: <Spa /> },
    { value: 'fitness', label: 'Phòng gym', icon: <FitnessCenter /> },
    { value: 'room_service', label: 'Dịch vụ phòng', icon: <RoomService /> },
    { value: 'taxi', label: 'Dịch vụ taxi', icon: <LocalTaxi /> }
  ];

  // Fetch data from API
  useEffect(() => {
    fetchReviews();
    fetchMyReviews();
    fetchBookingsForReview();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getReviews({ status: 'approved' });
      if (response.data.success) {
        setReviews(response.data.data.reviews);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReviews = async () => {
    try {
      const response = await reviewsAPI.getCustomerReviews();
      if (response.data.success) {
        setMyReviews(response.data.data.reviews);
      }
    } catch (err) {
      console.error('Error fetching my reviews:', err);
    }
  };

  const fetchBookingsForReview = async () => {
    try {
      const response = await reviewsAPI.getBookingsForReview();
      if (response.data.success) {
        setBookingsForReview(response.data.data.bookings);
      }
    } catch (err) {
      console.error('Error fetching bookings for review:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleWriteReview = (booking) => {
    setSelectedBooking(booking);
    setReviewForm({
      overallRating: 5,
      detailedRatings: {
        cleanliness: 5,
        comfort: 5,
        location: 5,
        value: 5,
        service: 5
      },
      comment: '',
      mentionedAmenities: []
    });
    setReviewDialogOpen(true);
  };

  const handleAmenityChange = (amenity) => {
    setReviewForm(prev => ({
      ...prev,
      mentionedAmenities: prev.mentionedAmenities.includes(amenity)
        ? prev.mentionedAmenities.filter(a => a !== amenity)
        : [...prev.mentionedAmenities, amenity]
    }));
  };

  const submitReview = async () => {
    try {
      setLoading(true);
      const reviewData = {
        booking: selectedBooking._id,
        overallRating: reviewForm.overallRating,
        detailedRatings: reviewForm.detailedRatings,
        comment: reviewForm.comment,
        mentionedAmenities: reviewForm.mentionedAmenities
      };

      const response = await reviewsAPI.createReview(reviewData);
      if (response.data.success) {
        setReviewDialogOpen(false);
        fetchMyReviews();
        fetchBookingsForReview();
        alert('Đánh giá đã được gửi thành công!');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Không thể gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await reviewsAPI.markHelpful(reviewId);
      fetchReviews();
    } catch (err) {
      console.error('Error marking helpful:', err);
    }
  };

  const renderReviews = (reviewList) => {
    if (loading) {
      return (
        <Grid container spacing={3}>
          {[1, 2, 3].map((index) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h6">Loading...</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Loading...
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }

    if (reviewList.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Chưa có đánh giá nào
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {reviewList.map((review) => (
          <Grid item xs={12} key={review._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={review.customer?.avatar} 
                    sx={{ mr: 2 }}
                  >
                    {review.customer?.fullName?.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">
                      {review.customer?.fullName || 'Khách hàng'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phòng {review.room?.roomNumber} • {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={review.overallRating} precision={0.1} size="small" readOnly />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {review.overallRating}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body1" sx={{ mb: 2 }}>
                  {review.comment}
                </Typography>

                {review.mentionedAmenities && review.mentionedAmenities.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {review.mentionedAmenities.map((amenity, index) => (
                      <Chip
                        key={index}
                        icon={amenityOptions.find(opt => opt.value === amenity)?.icon}
                        label={amenityOptions.find(opt => opt.value === amenity)?.label}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Đánh giá này có hữu ích không?
                  </Typography>
                  <Box>
                    <Button
                      size="small"
                      startIcon={<ThumbUp />}
                      onClick={() => handleMarkHelpful(review._id)}
                    >
                      Hữu ích ({review.helpful?.count || 0})
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <CustomerLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Đánh giá khách sạn
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Tất cả đánh giá" />
            <Tab label="Đánh giá của tôi" />
            <Tab label="Viết đánh giá" />
          </Tabs>
        </Paper>

        {tabValue === 0 && renderReviews(reviews)}
        
        {tabValue === 1 && (
          <>
            {myReviews.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Bạn chưa có đánh giá nào
                </Typography>
              </Box>
            ) : (
              renderReviews(myReviews)
            )}
          </>
        )}

        {tabValue === 2 && (
          <>
            {bookingsForReview.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Không có đặt phòng nào để đánh giá
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bạn cần check-out để có thể đánh giá
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {bookingsForReview.map((booking) => (
                  <Grid item xs={12} sm={6} key={booking._id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Phòng {booking.room?.roomNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {booking.room?.roomType}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          Check-in: {new Date(booking.checkIn).toLocaleDateString('vi-VN')}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          Check-out: {new Date(booking.checkOut).toLocaleDateString('vi-VN')}
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleWriteReview(booking)}
                          sx={{ mt: 2 }}
                        >
                          Viết đánh giá
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Viết đánh giá</DialogTitle>
          <DialogContent>
            {selectedBooking && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6">
                  Phòng {selectedBooking.room?.roomNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedBooking.room?.roomType}
                </Typography>
              </Box>
            )}

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Đánh giá tổng thể *
              </Typography>
              <Rating
                value={reviewForm.overallRating}
                onChange={(event, newValue) => {
                  setReviewForm(prev => ({
                    ...prev,
                    overallRating: newValue
                  }));
                }}
                size="large"
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Đánh giá chi tiết
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CleaningServices sx={{ mr: 1 }} />
                    <Typography variant="body2">Sạch sẽ</Typography>
                  </Box>
                  <Rating
                    value={reviewForm.detailedRatings.cleanliness}
                    onChange={(event, newValue) => {
                      setReviewForm(prev => ({
                        ...prev,
                        detailedRatings: {
                          ...prev.detailedRatings,
                          cleanliness: newValue
                        }
                      }));
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Hotel sx={{ mr: 1 }} />
                    <Typography variant="body2">Tiện nghi</Typography>
                  </Box>
                  <Rating
                    value={reviewForm.detailedRatings.comfort}
                    onChange={(event, newValue) => {
                      setReviewForm(prev => ({
                        ...prev,
                        detailedRatings: {
                          ...prev.detailedRatings,
                          comfort: newValue
                        }
                      }));
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ mr: 1 }} />
                    <Typography variant="body2">Vị trí</Typography>
                  </Box>
                  <Rating
                    value={reviewForm.detailedRatings.location}
                    onChange={(event, newValue) => {
                      setReviewForm(prev => ({
                        ...prev,
                        detailedRatings: {
                          ...prev.detailedRatings,
                          location: newValue
                        }
                      }));
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoney sx={{ mr: 1 }} />
                    <Typography variant="body2">Giá trị</Typography>
                  </Box>
                  <Rating
                    value={reviewForm.detailedRatings.value}
                    onChange={(event, newValue) => {
                      setReviewForm(prev => ({
                        ...prev,
                        detailedRatings: {
                          ...prev.detailedRatings,
                          value: newValue
                        }
                      }));
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <RoomService sx={{ mr: 1 }} />
                    <Typography variant="body2">Dịch vụ</Typography>
                  </Box>
                  <Rating
                    value={reviewForm.detailedRatings.service}
                    onChange={(event, newValue) => {
                      setReviewForm(prev => ({
                        ...prev,
                        detailedRatings: {
                          ...prev.detailedRatings,
                          service: newValue
                        }
                      }));
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Bình luận *"
              value={reviewForm.comment}
              onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
              sx={{ mb: 3 }}
            />

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Tiện nghi được đề cập
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {amenityOptions.map((amenity) => (
                  <Chip
                    key={amenity.value}
                    icon={amenity.icon}
                    label={amenity.label}
                    clickable
                    color={reviewForm.mentionedAmenities.includes(amenity.value) ? 'primary' : 'default'}
                    onClick={() => handleAmenityChange(amenity.value)}
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              onClick={submitReview} 
              variant="contained"
              disabled={!reviewForm.comment.trim() || loading}
            >
              {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </CustomerLayout>
  );
};

export default Reviews;