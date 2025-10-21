import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  IconButton
} from '@mui/material';
import {
  People,
  Wifi,
  Restaurant,
  Hotel,
  Star
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const RoomCard = ({ room, onBookRoom, compact = false }) => {
  const navigate = useNavigate();

  const handleBookRoom = () => {
    if (onBookRoom) {
      onBookRoom(room);
    }
  };

  const handleViewDetails = () => {
    navigate(`/room/${room._id}`);
  };

  // Format price in Vietnamese Dong
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Get Vietnamese room type name
  const getRoomTypeName = (roomType) => {
    const typeMap = {
      'deluxe': 'Phòng Cao cấp',
      'presidential': 'Phòng Tổng thống',
      'standard': 'Phòng Tiêu chuẩn'
    };
    return typeMap[roomType?.toLowerCase()] || roomType;
  };

  // Get Vietnamese description
  const getRoomDescription = (roomType) => {
    const descMap = {
      'deluxe': 'Phòng Cao cấp sang trọng với view thành phố tuyệt đẹp, trang bị đầy đủ tiện nghi hiện đại',
      'presidential': 'Phòng Tổng thống cao cấp nhất với không gian rộng lớn và dịch vụ cá nhân hóa',
      'standard': 'Phòng Tiêu chuẩn ấm cúng, tiện nghi đầy đủ với thiết kế hiện đại và tối ưu không gian'
    };
    return descMap[roomType?.toLowerCase()] || room.description;
  };

  return (
    <Card
      sx={{
        height: 450, // Fixed height for all cards
        width: '100%',
        minWidth: { xs: '120px', sm: '90px', md: '60px' },
        maxWidth: { xs: '100%', sm: '100%', md: '100%' },
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)'
        }
      }}
    >
      {/* Image Section */}
      <Box sx={{ position: 'relative', height: 200 }}> {/* Fixed image container height */}
        <CardMedia
          component="img"
          height={200} // Fixed image height
          image={room.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop'}
          alt={getRoomTypeName(room.roomType)}
          sx={{
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
        />
        
        {/* Price Chip */}
        <Chip
          label={`${formatPrice(room.basePrice)}/đêm`}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: '#FFD700',
            color: '#000',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            px: 2,
            py: 1,
            '& .MuiChip-label': {
              px: 1
            }
          }}
        />
      </Box>

      {/* Content Section */}
      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 1.5,
          justifyContent: 'space-between',
          minHeight: compact ? '200px' : '180px'
        }}
      >
        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: 'text.primary',
            mb: 1,
            fontSize: '1.2rem'
          }}
        >
          {getRoomTypeName(room.roomType)}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            lineHeight: 1.4,
            height: '40px', // Fixed description height
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: compact ? 2 : 2,
            WebkitBoxOrient: 'vertical',
            textAlign: 'justify',
            fontSize: compact ? '0.8rem' : '0.75rem'
          }}
        >
          {getRoomDescription(room.roomType)}
        </Typography>

        {/* Amenities */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2,
            flexWrap: 'wrap',
            height: '50px', // Fixed amenities height
            overflow: 'hidden',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <People fontSize="small" color="primary" />
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
              {room.maxOccupancy} khách
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Hotel fontSize="small" color="primary" />
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
              {room.roomSize}m²
            </Typography>
          </Box>
          
          {room.amenities?.includes('wifi') && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Wifi fontSize="small" color="primary" />
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                WiFi
              </Typography>
            </Box>
          )}
          
          {room.amenities?.includes('breakfast') && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Restaurant fontSize="small" color="primary" />
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                Bữa sáng
              </Typography>
            </Box>
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1.5, 
          mt: 'auto',
          pt: 1,
          minHeight: '40px',
          alignItems: 'flex-end'
        }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleViewDetails}
            sx={{
              borderColor: '#667eea',
              color: '#667eea',
              fontWeight: 600,
              py: 1.5,
              borderRadius: 2.5,
              textTransform: 'none',
              fontSize: '0.95rem',
              border: '2px solid',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
              }
            }}
          >
            Chi tiết
          </Button>
          
          <Button
            variant="contained"
            fullWidth
            onClick={handleBookRoom}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 700,
              py: 1.5,
              borderRadius: 2.5,
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
              }
            }}
          >
            Đặt ngay
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RoomCard;
