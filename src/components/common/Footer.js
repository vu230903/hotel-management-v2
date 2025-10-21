import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  Stack,
  Chip
} from '@mui/material';
import {
  Facebook,
  Instagram,
  Twitter,
  YouTube,
  Phone,
  Email,
  LocationOn,
  Hotel,
  Wifi,
  Pool,
  Restaurant,
  LocalParking,
  Security,
  BusinessCenter,
  Spa,
  FitnessCenter
} from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const hotelServices = [
    { icon: <Wifi />, name: 'WiFi miễn phí' },
    { icon: <Pool />, name: 'Hồ bơi' },
    { icon: <Restaurant />, name: 'Nhà hàng' },
    { icon: <Spa />, name: 'Spa & Wellness' },
    { icon: <FitnessCenter />, name: 'Phòng gym' },
    { icon: <LocalParking />, name: 'Bãi đỗ xe' },
    { icon: <Security />, name: 'An ninh 24/7' },
    { icon: <BusinessCenter />, name: 'Trung tâm kinh doanh' }
  ];

  const quickLinks = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Phòng', href: '/rooms' },
    { name: 'Đặt phòng', href: '/book-room' },
    { name: 'Lịch sử', href: '/booking-history' },
    { name: 'Đánh giá', href: '/reviews' },
    { name: 'Liên hệ', href: '/contact' }
  ];

  const customerServices = [
    { name: 'Hỗ trợ 24/7', href: '/support' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Chính sách hủy', href: '/cancellation' },
    { name: 'Điều khoản sử dụng', href: '/terms' },
    { name: 'Bảo mật thông tin', href: '/privacy' },
    { name: 'Phản hồi', href: '/feedback' }
  ];

  const socialLinks = [
    { icon: <Facebook />, href: '#', color: '#1877F2' },
    { icon: <Instagram />, href: '#', color: '#E4405F' },
    { icon: <Twitter />, href: '#', color: '#1DA1F2' },
    { icon: <YouTube />, href: '#', color: '#FF0000' }
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Hotel Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Hotel sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  Luxury Hotel
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                Khách sạn 5 sao với dịch vụ cao cấp, mang đến trải nghiệm nghỉ dưỡng 
                tuyệt vời nhất cho quý khách.
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {hotelServices.slice(0, 4).map((service, index) => (
                  <Chip
                    key={index}
                    icon={service.icon}
                    label={service.name}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      '& .MuiChip-icon': { color: 'white' }
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Liên kết nhanh
            </Typography>
            <Stack spacing={1}>
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  color="inherit"
                  underline="hover"
                  sx={{
                    '&:hover': { color: 'secondary.main' }
                  }}
                >
                  {link.name}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Customer Services */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Dịch vụ khách hàng
            </Typography>
            <Stack spacing={1}>
              {customerServices.map((service, index) => (
                <Link
                  key={index}
                  href={service.href}
                  color="inherit"
                  underline="hover"
                  sx={{
                    '&:hover': { color: 'secondary.main' }
                  }}
                >
                  {service.name}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Liên hệ
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">
                  123 Đường ABC, Quận 1, TP.HCM
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">
                  +84 28 1234 5678
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Email sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">
                  info@luxuryhotel.com
                </Typography>
              </Box>
            </Stack>

            {/* Social Links */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Theo dõi chúng tôi
              </Typography>
              <Stack direction="row" spacing={1}>
                {socialLinks.map((social, index) => (
                  <IconButton
                    key={index}
                    href={social.href}
                    sx={{
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        bgcolor: social.color,
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.2)' }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {currentYear} Luxury Hotel. Tất cả quyền được bảo lưu.
          </Typography>
          
          <Stack direction="row" spacing={2}>
            <Link href="/terms" color="inherit" underline="hover" variant="body2">
              Điều khoản
            </Link>
            <Link href="/privacy" color="inherit" underline="hover" variant="body2">
              Bảo mật
            </Link>
            <Link href="/cookies" color="inherit" underline="hover" variant="body2">
              Cookies
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
