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
  Paper,
  InputAdornment,
  IconButton,
  Fade,
  Zoom,
  Link as MuiLink,
  Divider,
  Stack,
} from '@mui/material';
import {
  Hotel as HotelIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  Google as GoogleIcon,
  Star as StarIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { OAUTH_CONFIG } from '../../config/oauth';

const Login = () => {
  const { login, setUser, setToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
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
      
      console.log('🔵 Khởi động Google Login thật...');
      
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
      console.log('🔍 Đang khởi tạo Google One Tap với Client ID:', OAUTH_CONFIG.google.clientId);
      console.log('🌐 Current domain:', window.location.origin);
      console.log('🔗 Current URL:', window.location.href);
      
      window.google.accounts.id.initialize({
        client_id: OAUTH_CONFIG.google.clientId,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: false, // Tắt FedCM để tránh lỗi
      });
      
      // Kiểm tra xem có Client ID thật không
      if (OAUTH_CONFIG.google.clientId.includes('1234567890') || 
          OAUTH_CONFIG.google.clientId.includes('abcdefgh')) {
        console.log('❌ Đang dùng Client ID demo, cần cấu hình OAuth thật');
        setLoading(false);
        setError('Cần cấu hình Google Client ID thật trong file .env để sử dụng tính năng này. Xem OAUTH_SETUP.md');
        return;
      }
      
      // Function để hiển thị Google button khi One Tap không hoạt động
      const showGoogleButtonFallback = () => {
        console.log('🔄 Hiển thị Google Sign In button...');
        
        // Tạo một div tạm để render button
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'google-signin-button';
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
            <h3 style="margin: 0; color: #202124;">Đăng nhập với Google</h3>
          </div>
          <div id="google-button-target"></div>
          <div style="text-align: center; margin-top: 16px;">
            <button id="cancel-google" style="background: #f8f9fa; border: 1px solid #dadce0; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Hủy</button>
          </div>
        `;
        
        document.body.appendChild(buttonContainer);
        
        // Render Google button
        window.google.accounts.id.renderButton(
          document.getElementById('google-button-target'),
          {
            theme: 'outline',
            size: 'large',
            width: '300',
            text: 'signin_with',
            shape: 'rectangular',
          }
        );
        
        // Handle cancel
        document.getElementById('cancel-google').onclick = () => {
          document.body.removeChild(buttonContainer);
          setLoading(false);
        };
      };
      
      // Hiển thị Google One Tap với Client ID thật
      window.google.accounts.id.prompt((notification) => {
        console.log('🔍 Google One Tap notification:', notification);
        
        if (notification.isNotDisplayed()) {
          const reason = notification.getNotDisplayedReason();
          console.log('❌ One Tap không hiển thị, lý do:', reason);
          
          // Thử render button thay thế
          showGoogleButtonFallback();
        } else if (notification.isSkippedMoment()) {
          console.log('⏭️ User đã skip One Tap moment');
          setLoading(false);
        } else {
          console.log('✅ Google One Tap đang hiển thị với tài khoản thật!');
        }
      });
      
    } catch (error) {
      console.error('❌ Google login error:', error);
      setError('Lỗi khi khởi tạo Google login. Vui lòng thử lại.');
      setLoading(false);
    }
  };
  
  // Xử lý response từ Google
  const handleGoogleResponse = async (response) => {
    try {
      console.log('🔵 Nhận response từ Google:', response);
      
      // Decode JWT token từ Google
      const token = response.credential;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const userInfo = JSON.parse(jsonPayload);
      console.log('👤 Thông tin user từ Google:', userInfo);
      
      const loginData = {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        provider: 'google',
        providerId: userInfo.sub
      };
      
      const apiResponse = await authAPI.oauth(loginData);
      
      if (apiResponse.data.success) {
        const { user, token } = apiResponse.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Cập nhật AuthContext state
        setToken(token);
        setUser(user);
        
        console.log('✅ Google login thành công, chuyển tới dashboard');
        navigate('/dashboard');
      } else {
        setError(apiResponse.data.message || 'Đăng nhập thất bại');
      }
      
    } catch (error) {
      console.error('❌ Lỗi xử lý Google response:', error);
      setError('Lỗi khi xử lý đăng nhập Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google login failed:', error);
    // Không hiển thị lỗi khi chưa cấu hình OAuth
    // setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
  };

  const handleFacebookResponse = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('📘 Khởi động Facebook Login thật...');
      
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
          // Đã đăng nhập, lấy thông tin user
          getUserInfo(response.authResponse.accessToken);
        } else {
          // Chưa đăng nhập, mở popup đăng nhập
          window.FB.login((loginResponse) => {
            console.log('Facebook login response:', loginResponse);
            
            if (loginResponse.authResponse) {
              getUserInfo(loginResponse.authResponse.accessToken);
            } else {
              console.log('User cancelled login or did not fully authorize.');
              setLoading(false);
            }
          }, { scope: 'email,public_profile' });
        }
      });
      
      // Function để lấy thông tin user từ Facebook
      const getUserInfo = (accessToken) => {
        window.FB.api('/me', { fields: 'name,email,picture' }, async (userInfo) => {
          console.log('👤 Thông tin user từ Facebook:', userInfo);
          
          const loginData = {
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture?.data?.url || 'https://i.pravatar.cc/150',
            provider: 'facebook',
            providerId: userInfo.id,
            accessToken: accessToken
          };
          
          try {
            const apiResponse = await authAPI.oauth(loginData);
            
            if (apiResponse.data.success) {
              const { user, token } = apiResponse.data.data;
              localStorage.setItem('token', token);
              localStorage.setItem('user', JSON.stringify(user));
              
              // Cập nhật AuthContext state
              setToken(token);
              setUser(user);
              
              console.log('✅ Facebook login thành công, chuyển tới dashboard');
              navigate('/dashboard');
            } else {
              setError(apiResponse.data.message || 'Đăng nhập thất bại');
            }
          } catch (error) {
            console.error('❌ Lỗi API Facebook login:', error);
            setError('Lỗi khi xử lý đăng nhập Facebook.');
          } finally {
            setLoading(false);
          }
        });
      };
      
    } catch (error) {
      console.error('❌ Facebook login error:', error);
      setError('Lỗi khi khởi tạo Facebook login. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData);
      
      if (result.success) {
        const redirectPath = from !== '/' ? from : '/dashboard';
        navigate(redirectPath, { replace: true });
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <SecurityIcon />, title: 'Bảo mật cao', desc: 'Mã hóa SSL 256-bit' },
    { icon: <SpeedIcon />, title: 'Nhanh chóng', desc: 'Đăng nhập trong 2 giây' },
    { icon: <SupportIcon />, title: 'Hỗ trợ 24/7', desc: 'Luôn sẵn sàng giúp đỡ' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
          url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')
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
            radial-gradient(circle at 20% 80%, rgba(0, 0, 0, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(0, 0, 0, 0.15) 0%, transparent 50%)
          `,
          animation: 'backgroundShift 20s ease-in-out infinite',
        },
        '@keyframes backgroundShift': {
          '0%, 100%': { 
            background: `
              radial-gradient(circle at 20% 80%, rgba(102, 146, 255, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(240, 214, 149, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(20, 184, 166, 0.2) 0%, transparent 50%)
            `,
          },
          '50%': { 
            background: `
              radial-gradient(circle at 80% 20%, rgba(102, 146, 255, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 20% 80%, rgba(240, 214, 149, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 60% 60%, rgba(20, 184, 166, 0.3) 0%, transparent 50%)
            `,
          },
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
        '@keyframes pulse': {
          '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.05)' },
        },
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '15%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          backdropFilter: 'blur(10px)',
          animation: 'float 8s ease-in-out infinite',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: 150,
          height: 150,
          borderRadius: '30px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
          backdropFilter: 'blur(8px)',
          animation: 'float 10s ease-in-out infinite reverse',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          transform: 'rotate(45deg)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          right: '5%',
          width: 100,
          height: 100,
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
          backdropFilter: 'blur(6px)',
          animation: 'float 12s ease-in-out infinite',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transform: 'rotate(-30deg)',
        }}
      />


      {/* Login Form - Centered */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          p: { xs: 2, md: 4 },
          zIndex: 2,
        }}
      >
        <Container maxWidth="sm">
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
              <CardContent sx={{ p: 5 }}>
                {/* Header */}
                <Fade in timeout={1000}>
                  <Box textAlign="center" mb={4}>
                  <Typography 
                      variant="h4"
                      fontWeight="bold"
                      color="#2c3e50"
                    gutterBottom
                    sx={{
                        textShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      }}
                    >
                      Chào mừng trở lại! 👋
                  </Typography>
                  <Typography 
                      variant="body1" 
                    sx={{
                        color: '#5a6c7d',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    }}
                  >
                      Đăng nhập để tiếp tục hành trình của bạn
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

              {/* Login Form */}
              <Fade in timeout={1400}>
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      size="medium"
                      sx={{
                        mb: 3,
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: '#5a6c7d' }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Mật khẩu"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      size="medium"
                      sx={{
                        mb: 4,
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
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                      sx={{
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
                      {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>

                    {/* Divider */}
                    <Box display="flex" alignItems="center" my={4}>
                      <Box flex={1} height="1px" sx={{ background: 'rgba(90, 108, 125, 0.3)' }} />
                      <Typography 
                        variant="body2" 
                      sx={{
                          mx: 2,
                          color: '#5a6c7d',
                          fontWeight: 500,
                        }}
                      >
                        Hoặc đăng nhập bằng
                        </Typography>
                      <Box flex={1} height="1px" sx={{ background: 'rgba(90, 108, 125, 0.3)' }} />
                    </Box>

                    {/* Social Login Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                      {/* Google Login */}
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
                      
                      {/* Hidden div for Google fallback button */}
                      <div id="google-signin-button" style={{ display: 'none' }}></div>

                      {/* Facebook Login */}
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
                    </Box>

                    {/* Register Link */}
                    <Box textAlign="center">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#2c3e50',
                          fontWeight: 500,
                        }}
                      >
                        Chưa có tài khoản?{' '}
                        <MuiLink
                          component={Link}
                          to="/register"
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
                          Đăng ký ngay
                        </MuiLink>
                      </Typography>
                    </Box>
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

export default Login;
