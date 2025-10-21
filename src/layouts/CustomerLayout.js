import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import Footer from '../components/common/Footer';
import {
  Menu as MenuIcon,
  AccountCircle,
  Hotel,
  History,
  Star,
  Person,
  Logout,
  Search,
  Payment,
  Support,
  CalendarToday,
  BedroomParent
} from '@mui/icons-material';

const CustomerLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Check if user is logged in
  const isLoggedIn = !!user;
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleProfileMenuClose();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Trang chủ', icon: <Hotel />, path: '/', requiresAuth: false, action: 'navigate' },
    { text: 'Phòng', icon: <BedroomParent />, path: '/rooms', requiresAuth: false, action: 'navigate' },
    
    { text: 'Đặt phòng', icon: <CalendarToday />, path: '/book-room', requiresAuth: true, action: 'navigate' },
    { text: 'Lịch sử đặt phòng', icon: <History />, path: '/bookings', requiresAuth: true, action: 'navigate' },
    { text: 'Đánh giá', icon: <Star />, path: '/reviews', requiresAuth: true, action: 'navigate' },
    { text: 'Hồ sơ', icon: <Person />, path: '/profile', requiresAuth: true, action: 'navigate' },
    { text: 'Hỗ trợ', icon: <Support />, path: '/support', requiresAuth: false, action: 'navigate' },
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Luxury Palace
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => {
          const handleClick = () => {
            if (item.action === 'scroll' && item.text === 'Tìm phòng') {
              // Scroll to search section
              const searchSection = document.getElementById('search-section');
              if (searchSection) {
                searchSection.scrollIntoView({ behavior: 'smooth' });
              }
            } else if (item.requiresAuth && !isLoggedIn) {
              navigate('/login', { 
                state: { 
                  from: { pathname: item.path },
                  message: `Vui lòng đăng nhập để sử dụng tính năng "${item.text}"`
                }
              });
            } else {
              navigate(item.path);
            }
            setMobileOpen(false);
          };

          return (
            <ListItem
              button
              key={item.text}
              onClick={handleClick}
              selected={location.pathname === item.path}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(25, 118, 210, 0.12)',
                }
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
              {item.requiresAuth && !isLoggedIn && (
                <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                  (Cần đăng nhập)
                </Typography>
              )}
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top AppBar - hiển thị trên mọi thiết bị */}
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, backdropFilter: 'blur(8px)', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Toolbar sx={{ gap: 1 }}>
          {/* Mobile: Hamburger */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1, display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo / Brand */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: { xs: 1, md: 0 },
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: 0.3
            }}
            onClick={() => navigate('/')}
          >
            BinBer Hotel
          </Typography>

          {/* Desktop navigation */}
          <Box sx={{ 
            ml: 2, 
            display: { xs: 'none', md: 'flex' }, 
            flex: 1,
            justifyContent: 'space-between',
            maxWidth: '800px'
          }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                color="inherit"
                onClick={() => {
                  if (item.requiresAuth && !isLoggedIn) {
                    navigate('/login', {
                      state: { from: { pathname: item.path }, message: `Vui lòng đăng nhập để sử dụng tính năng "${item.text}"` }
                    });
                  } else {
                    navigate(item.path);
                  }
                }}
                startIcon={item.icon}
                sx={{
                  textTransform: 'none',
                  fontWeight: location.pathname === item.path ? 700 : 500,
                  backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
                  borderRadius: 2,
                  px: 2,
                  flex: 1,
                  mx: 0.5,
                  minWidth: 'auto'
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Right actions */}
          {isLoggedIn ? (
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar src={user?.avatar || user?.picture} sx={{ width: 32, height: 32 }}>
                {(user?.name || user?.fullName || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          ) : (
            <Button color="inherit" onClick={() => navigate('/login')} sx={{ textTransform: 'none', fontWeight: 600 }}>
              Đăng nhập
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 2 },
          width: '100%',
          mt: '72px',
        }}
      >
        {children}
      </Box>

      {/* Footer */}
      <Footer />

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>Hồ sơ cá nhân</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Đăng xuất</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CustomerLayout;
