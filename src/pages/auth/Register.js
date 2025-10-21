import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  InputAdornment,
  IconButton,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Link as MuiLink,
  Paper,
  Stack,
  Zoom,
} from '@mui/material';
import {
  Hotel as HotelIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  PersonAdd as RegisterIcon,
  Google as GoogleIcon,
  CheckCircle as CheckCircleIcon,
  Shield as ShieldIcon,
  Favorite as FavoriteIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { OAUTH_CONFIG } from '../../config/oauth';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Clear any existing errors when component mounts
  useEffect(() => {
    setError('');
  }, []);

  // Social login handlers
  const handleGoogleSuccess = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔵 Khởi động Google Registration thật...');
      
      // Load Google Identity Services nếu chưa có
      if (!window.google) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      // Khởi tạo Google Identity Services
      window.google.accounts.id.initialize({
        client_id: OAUTH_CONFIG.google.clientId,
        callback: handleGoogleRegisterResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true, // Hiện tất cả tài khoản Google thật
      });
      
      // Kiểm tra xem có Client ID thật không
      if (OAUTH_CONFIG.google.clientId.includes('1234567890') || 
          OAUTH_CONFIG.google.clientId.includes('abcdefgh')) {
        console.log('❌ Đang dùng Client ID demo cho registration');
        setLoading(false);
        setError('Cần cấu hình Google Client ID thật trong file .env để sử dụng tính năng này. Xem OAUTH_SETUP.md');
        return;
      }
      
      // Hiển thị Google One Tap với tài khoản thật cho registration
      window.google.accounts.id.prompt((notification) => {
        console.log('🔍 Google Registration One Tap:', notification);
        
        if (notification.isNotDisplayed()) {
          const reason = notification.getNotDisplayedReason();
          console.log('❌ One Tap không hiển thị cho registration, lý do:', reason);
          
          // Thử render button thay thế cho registration
          showGoogleButtonFallbackForRegister();
        } else if (notification.isSkippedMoment()) {
          console.log('⏭️ User skip One Tap registration');
          setLoading(false);
        } else {
          console.log('✅ Google One Tap registration đang hiển thị!');
        }
      });
      
      // Function để hiển thị Google button cho registration
      const showGoogleButtonFallbackForRegister = () => {
        console.log('🔄 Hiển thị Google Sign Up button...');
        
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'google-signup-button';
        buttonContainer.style.cssText = `
          position: fixed; 
          top: 50%; 
          left: 50%; 
          transform: translate(-50%, -50%);
          z-index: 10000;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        
        buttonContainer.innerHTML = `
          <div style="text-align: center; margin-bottom: 16px;">
            <h3 style="margin: 0; color: #202124;">Đăng ký với Google</h3>
          </div>
          <div id="google-signup-button-target"></div>
          <div style="text-align: center; margin-top: 16px;">
            <button id="cancel-google-signup" style="background: #f8f9fa; border: 1px solid #dadce0; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Hủy</button>
          </div>
        `;
        
        document.body.appendChild(buttonContainer);
        
        // Render Google button
        window.google.accounts.id.renderButton(
          document.getElementById('google-signup-button-target'),
          {
            theme: 'outline',
            size: 'large',
            width: '300',
            text: 'signup_with',
            shape: 'rectangular',
          }
        );
        
        // Handle cancel
        document.getElementById('cancel-google-signup').onclick = () => {
          document.body.removeChild(buttonContainer);
          setLoading(false);
        };
      };
      
    } catch (error) {
      console.error('❌ Google registration error:', error);
      setError('Lỗi khi khởi tạo Google registration. Vui lòng thử lại.');
      setLoading(false);
    }
  };
  
  // Xử lý response từ Google Registration
  const handleGoogleRegisterResponse = async (response) => {
    try {
      console.log('🔵 Nhận response từ Google Registration:', response);
      
      // Decode JWT token từ Google
      const token = response.credential;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const userInfo = JSON.parse(jsonPayload);
      console.log('👤 Thông tin user từ Google:', userInfo);
      
      // Tự động điền form với thông tin từ Google thật
      const userData = {
        fullName: userInfo.name,
        email: userInfo.email,
        phone: '0987654321', // Cần user nhập sau
        password: 'google123', // Tạo password mặc định
        confirmPassword: 'google123', 
        dateOfBirth: '1990-01-01', // Cần user nhập sau
        gender: 'other' // Cần user chọn sau
      };
      
      console.log('📝 Đăng ký user với thông tin Google:', userData);
      
      const result = await register(userData);
      if (result.success) {
        console.log('✅ Google registration thành công');
        navigate('/dashboard');
      } else {
        setError(result.message || 'Đăng ký thất bại');
      }
      
    } catch (error) {
      console.error('❌ Lỗi xử lý Google registration response:', error);
      setError('Lỗi khi xử lý đăng ký Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google login failed:', error);
    // Không hiển thị lỗi khi chưa cấu hình OAuth
    // setError('Đăng ký bằng Google thất bại. Vui lòng thử lại.');
  };

  const handleFacebookResponse = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('📘 Khởi động Facebook Registration thật...');
      
      // Load Facebook SDK nếu chưa có
      if (!window.FB) {
        await new Promise((resolve, reject) => {
          window.fbAsyncInit = function() {
            window.FB.init({
              appId: OAUTH_CONFIG.facebook.appId,
              cookie: true,
              xfbml: true,
              version: 'v18.0'
            });
            resolve();
          };
          
          const script = document.createElement('script');
          script.src = 'https://connect.facebook.net/en_US/sdk.js';
          script.onload = () => {
            if (!window.fbAsyncInit) {
              window.fbAsyncInit();
            }
          };
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      // Kiểm tra trạng thái đăng nhập Facebook
      window.FB.getLoginStatus((response) => {
        console.log('Facebook login status:', response);
        
        if (response.status === 'connected') {
          // Đã đăng nhập, lấy thông tin user để đăng ký
          getFacebookUserInfo(response.authResponse.accessToken);
        } else {
          // Chưa đăng nhập, mở popup đăng nhập
          window.FB.login((loginResponse) => {
            console.log('Facebook login response:', loginResponse);
            
            if (loginResponse.authResponse) {
              getFacebookUserInfo(loginResponse.authResponse.accessToken);
            } else {
              console.log('User cancelled login or did not fully authorize.');
              setLoading(false);
            }
          }, { scope: 'email,public_profile' });
        }
      });
      
      // Function để lấy thông tin user từ Facebook cho registration
      const getFacebookUserInfo = (accessToken) => {
        window.FB.api('/me', { fields: 'name,email,picture' }, async (userInfo) => {
          console.log('👤 Thông tin user từ Facebook:', userInfo);
          
          // Tự động điền form với thông tin từ Facebook thật
          const userData = {
            fullName: userInfo.name,
            email: userInfo.email,
            phone: '0123456789', // Cần user nhập sau
            password: 'facebook123', // Tạo password mặc định
            confirmPassword: 'facebook123', 
            dateOfBirth: '1988-01-01', // Cần user nhập sau
            gender: 'other' // Cần user chọn sau
          };
          
          console.log('📝 Đăng ký user với thông tin Facebook:', userData);
          
          try {
            const result = await register(userData);
            if (result.success) {
              console.log('✅ Facebook registration thành công');
              navigate('/dashboard');
            } else {
              setError(result.message || 'Đăng ký thất bại');
            }
          } catch (error) {
            console.error('❌ Lỗi API Facebook registration:', error);
            setError('Lỗi khi xử lý đăng ký Facebook.');
          } finally {
            setLoading(false);
          }
        });
      };
      
    } catch (error) {
      console.error('❌ Facebook registration error:', error);
      setError('Lỗi khi khởi tạo Facebook registration. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Nếu là phone field, chỉ cho phép nhập số và giới hạn tối đa 11 số
    if (name === 'phone') {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 11);
      setFormData({
        ...formData,
        [name]: numericValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Họ tên không được để trống');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email không được để trống');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Số điện thoại không được để trống');
      return false;
    }
    // Validate phone format: chỉ chứa số và có 10-11 chữ số
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Số điện thoại phải có 10-11 chữ số và chỉ chứa số (ví dụ: 0912345678)');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        role: 'customer' // Default role for registration
      };

      const result = await register(registerData);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: <CheckCircleIcon />, title: 'Đặt phòng dễ dàng', desc: 'Chỉ với vài click' },
    { icon: <ShieldIcon />, title: 'Bảo mật tuyệt đối', desc: 'Thông tin được mã hóa' },
    { icon: <FavoriteIcon />, title: 'Ưu đãi độc quyền', desc: 'Giảm giá lên đến 30%' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
          url('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 30% 70%, rgba(102, 146, 255, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, rgba(240, 214, 149, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.2) 0%, transparent 50%)
          `,
          animation: 'backgroundShift 25s ease-in-out infinite',
        },
        '@keyframes backgroundShift': {
          '0%, 100%': { 
            background: `
              radial-gradient(circle at 30% 70%, rgba(102, 146, 255, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 70% 30%, rgba(240, 214, 149, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.2) 0%, transparent 50%)
            `,
          },
          '50%': { 
            background: `
              radial-gradient(circle at 70% 30%, rgba(102, 146, 255, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 30% 70%, rgba(240, 214, 149, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.3) 0%, transparent 50%)
            `,
          },
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(3deg)' },
        },
        '@keyframes pulse': {
          '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.03)' },
        },
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          left: '8%',
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
          backdropFilter: 'blur(12px)',
          animation: 'float 9s ease-in-out infinite',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '70%',
          right: '12%',
          width: 120,
          height: 120,
          borderRadius: '25px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.04) 100%)',
          backdropFilter: 'blur(8px)',
          animation: 'float 11s ease-in-out infinite reverse',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transform: 'rotate(30deg)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '15%',
          width: 90,
          height: 90,
          borderRadius: '18px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.07) 100%)',
          backdropFilter: 'blur(6px)',
          animation: 'float 13s ease-in-out infinite',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          transform: 'rotate(-45deg)',
        }}
      />


      {/* Register Form - Centered */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          p: { xs: 2, md: 3 },
          zIndex: 2,
        }}
      >
        <Container maxWidth="md">
          <Fade in timeout={800}>
            <Card
              sx={{
                borderRadius: 5,
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
                backdropFilter: 'blur(30px)',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 30px 90px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.3) inset',
                overflow: 'hidden',
                position: 'relative',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 35px 100px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.5) inset',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '5px',
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                },
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                {/* Header */}
                <Fade in timeout={1000}>
                  <Box textAlign="center" mb={4}>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="#2c3e50"
                      gutterBottom
                      sx={{
                        textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                      }}
                    >
                      Tạo tài khoản mới ✨
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#5a6c7d',
                        textShadow: '0 1px 5px rgba(0,0,0,0.2)',
                      }}
                    >
                      Bắt đầu hành trình khám phá cùng BinBer Hotel
                    </Typography>
                  </Box>
                </Fade>

                {/* Error Alert */}
                {error && (
                  <Fade in timeout={300}>
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        background: 'rgba(244, 67, 54, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(244, 67, 54, 0.3)',
                        color: '#d32f2f',
                        '& .MuiAlert-icon': {
                          color: '#ff6b6b',
                        },
                      }}
                    >
                      {error}
                    </Alert>
                  </Fade>
                )}

                {/* Register Form */}
                <Fade in timeout={1400}>
                  <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      {/* Full Name */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Họ và tên"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                          size="medium"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon sx={{ color: '#5a6c7d' }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              height: '56px',
                              borderRadius: 2,
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              color: '#2c3e50',
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.15)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                              },
                              '&.Mui-focused': {
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.4)',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: '#5a6c7d',
                              '&.Mui-focused': {
                                color: '#6692ff',
                              },
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none',
                            },
                          }}
                        />
                      </Grid>

                      {/* Email */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          size="medium"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon sx={{ color: '#5a6c7d' }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              height: '56px',
                              borderRadius: 2,
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              color: '#2c3e50',
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.15)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                              },
                              '&.Mui-focused': {
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.4)',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: '#5a6c7d',
                              '&.Mui-focused': {
                                color: '#6692ff',
                              },
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none',
                            },
                          }}
                        />
                      </Grid>

                      {/* Phone */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Số điện thoại"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          size="medium"
                          placeholder="0912345678"
                          helperText="Chỉ nhập số, 10-11 chữ số"
                          inputProps={{
                            maxLength: 11,
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon sx={{ color: '#5a6c7d' }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              height: '56px',
                              borderRadius: 2,
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              color: '#2c3e50',
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.15)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                              },
                              '&.Mui-focused': {
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.4)',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: '#5a6c7d',
                              '&.Mui-focused': {
                                color: '#6692ff',
                              },
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none',
                            },
                            '& .MuiFormHelperText-root': {
                              color: '#5a6c7d',
                              marginLeft: 0,
                              fontSize: '0.75rem',
                            },
                          }}
                        />
                      </Grid>

                      {/* Gender */}
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel sx={{ color: '#5a6c7d', '&.Mui-focused': { color: '#6692ff' } }}>
                            Giới tính
                          </InputLabel>
                          <Select
                            name="gender"
                            value={formData.gender}
                            label="Giới tính"
                            onChange={handleChange}
                            size="medium"
                            sx={{
                              height: '56px',
                              borderRadius: 2,
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              color: '#2c3e50',
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.15)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                              },
                              '&.Mui-focused': {
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.4)',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none',
                              },
                              '& .MuiSvgIcon-root': {
                                color: '#5a6c7d',
                              },
                            }}
                          >
                            <MenuItem value="male">Nam</MenuItem>
                            <MenuItem value="female">Nữ</MenuItem>
                            <MenuItem value="other">Khác</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* Date of Birth */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Ngày sinh"
                          name="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          size="medium"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              height: '56px',
                              borderRadius: 2,
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              color: '#2c3e50',
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.15)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                              },
                              '&.Mui-focused': {
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.4)',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: '#5a6c7d',
                              '&.Mui-focused': {
                                color: '#6692ff',
                              },
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none',
                            },
                          }}
                        />
                      </Grid>

                      {/* Password */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Mật khẩu"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleChange}
                          required
                          size="medium"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon sx={{ color: '#5a6c7d' }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                  sx={{ color: '#5a6c7d' }}
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              height: '56px',
                              borderRadius: 2,
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              color: '#2c3e50',
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.15)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                              },
                              '&.Mui-focused': {
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.4)',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: '#5a6c7d',
                              '&.Mui-focused': {
                                color: '#6692ff',
                              },
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none',
                            },
                          }}
                        />
                      </Grid>

                      {/* Confirm Password */}
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Xác nhận mật khẩu"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          size="medium"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon sx={{ color: '#5a6c7d' }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  edge="end"
                                  sx={{ color: '#5a6c7d' }}
                                >
                                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              height: '56px',
                              borderRadius: 2,
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              color: '#2c3e50',
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.15)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                              },
                              '&.Mui-focused': {
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.4)',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: '#5a6c7d',
                              '&.Mui-focused': {
                                color: '#6692ff',
                              },
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none',
                            },
                          }}
                        />
                      </Grid>

                      {/* Submit Button */}
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          size="large"
                          disabled={loading}
                          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RegisterIcon />}
                          sx={{
                            mt: 2,
                            py: 2.5,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            color: '#fff',
                            boxShadow: '0 10px 40px rgba(102, 126, 234, 0.5)',
                            border: 'none',
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
                              boxShadow: '0 15px 50px rgba(102, 126, 234, 0.6)',
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
                              boxShadow: 'none',
                            },
                          }}
                        >
                          {loading ? 'Đang đăng ký...' : 'Đăng ký ngay'}
                        </Button>
                      </Grid>

                      {/* Divider */}
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center" my={2}>
                          <Box flex={1} height="1px" sx={{ background: 'rgba(90, 108, 125, 0.3)' }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              mx: 2,
                              color: '#5a6c7d',
                              fontWeight: 500,
                            }}
                          >
                            Hoặc đăng ký bằng
                          </Typography>
                          <Box flex={1} height="1px" sx={{ background: 'rgba(90, 108, 125, 0.3)' }} />
                        </Box>
                      </Grid>

                      {/* Social Login Buttons */}
                      <Grid item xs={12}>
                        <Grid container spacing={2}>
                          {/* Google Login */}
                          <Grid item xs={12} sm={6}>
                            <Button
                              fullWidth
                              variant="outlined"
                              startIcon={
                                <Box
                                  component="span"
                                  sx={{
                                    width: 20,
                                    height: 20,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(45deg, #ea4335 25%, #fbbc05 25%, #fbbc05 50%, #34a853 50%, #34a853 75%, #4285f4 75%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                  }}
                                >
                                  G
                                </Box>
                              }
                              onClick={handleGoogleSuccess}
                              sx={{
                                py: 2,
                                borderRadius: 3,
                                textTransform: 'none',
                                background: '#fff',
                                border: '2px solid #dadce0',
                                color: '#3c4043',
                                fontWeight: 600,
                                fontSize: '15px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                  background: '#f8f9fa',
                                  border: '2px solid #4285f4',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 6px 20px rgba(66, 133, 244, 0.3)',
                                },
                              }}
                            >
                              Google
                            </Button>
                          </Grid>

                          {/* Facebook Login */}
                          <Grid item xs={12} sm={6}>
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={
                                <Box
                                  component="span"
                                  sx={{
                                    width: 22,
                                    height: 22,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    color: '#fff',
                                  }}
                                >
                                  f
                                </Box>
                              }
                              onClick={handleFacebookResponse}
                              sx={{
                                py: 2,
                                borderRadius: 3,
                                textTransform: 'none',
                                background: 'linear-gradient(135deg, #1877f2 0%, #0c63d4 100%)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '15px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #0c63d4 0%, #1877f2 100%)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 6px 20px rgba(24, 119, 242, 0.4)',
                                },
                              }}
                            >
                              Facebook
                            </Button>
                          </Grid>
                        </Grid>
                      </Grid>

                      {/* Login Link */}
                      <Grid item xs={12}>
                        <Box textAlign="center" mt={2}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#2c3e50',
                              fontWeight: 500,
                            }}
                          >
                            Đã có tài khoản?{' '}
                            <MuiLink
                              component={Link}
                              to="/login"
                              sx={{
                                color: '#1976d2',
                                textDecoration: 'none',
                                fontWeight: 600,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  color: '#1565c0',
                                  textDecoration: 'underline',
                                },
                              }}
                            >
                              Đăng nhập ngay
                            </MuiLink>
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Fade>
              </CardContent>
            </Card>
          </Fade>
        </Container>
      </Box>
    </Box>
  );
};

export default Register;