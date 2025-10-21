import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  Alert,
  Snackbar,
  Avatar,
  Tooltip,
  Fade,
  Zoom,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Storage as StorageIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Restore as RestoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import ResponsiveContainer from '../../components/common/ResponsiveContainer';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Settings states
  const [generalSettings, setGeneralSettings] = useState({
    hotelName: 'BinBer Hotel',
    hotelAddress: '123 Đường ABC, Quận 1, TP.HCM',
    hotelPhone: '+84 123 456 789',
    hotelEmail: 'info@binber.com',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
  });

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireTwoFactor: false,
    allowGuestAccess: true,
    maxLoginAttempts: 5,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    bookingConfirmations: true,
    paymentReminders: true,
    maintenanceAlerts: true,
  });

  const [themeSettings, setThemeSettings] = useState({
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    darkMode: false,
    animations: true,
    compactMode: false,
  });

  const tabs = [
    { label: 'Cài đặt chung', value: 'general', icon: <SettingsIcon /> },
    { label: 'Bảo mật', value: 'security', icon: <SecurityIcon /> },
    { label: 'Thông báo', value: 'notifications', icon: <NotificationsIcon /> },
    { label: 'Giao diện', value: 'theme', icon: <PaletteIcon /> },
    { label: 'Hệ thống', value: 'system', icon: <StorageIcon /> },
  ];

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSaveSettings = async (settingsType) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSnackbar(`Cập nhật ${settingsType} thành công!`);
    } catch (error) {
      showSnackbar('Lỗi khi cập nhật cài đặt', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Bạn có chắc chắn muốn reset tất cả cài đặt về mặc định?')) {
      showSnackbar('Reset cài đặt thành công!');
    }
  };

  const handleExportSettings = () => {
    showSnackbar('Xuất cài đặt thành công!');
  };

  const handleImportSettings = () => {
    showSnackbar('Nhập cài đặt thành công!');
  };

  return (
    <ResponsiveContainer>
      {/* Header */}
      <Fade in={true}>
        <Box sx={{ mb: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Box>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom 
                sx={{
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                  '@media (max-width:600px)': {
                    fontSize: '2rem',
                  },
                }}
              >
                ⚙️ Cài đặt Hệ thống
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Cấu hình và quản lý các thiết lập của hệ thống
              </Typography>
            </Box>
            
            {/* Action Buttons */}
            <Stack direction="row" spacing={1}>
              <Tooltip title="Reset cài đặt">
                <IconButton
                  onClick={handleResetSettings}
                  sx={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    },
                  }}
                >
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Xuất cài đặt">
                <IconButton
                  onClick={handleExportSettings}
                  sx={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    },
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Nhập cài đặt">
                <IconButton
                  onClick={handleImportSettings}
                  sx={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    },
                  }}
                >
                  <CloudUploadIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>
      </Fade>

      {/* Tabs */}
      <Fade in={true} style={{ transitionDelay: '100ms' }}>
        <Paper sx={{ 
          mb: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          borderRadius: 2,
        }}>
          <Tabs 
            value={selectedTab} 
            onChange={(e, newValue) => setSelectedTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                '&.Mui-selected': {
                  color: '#3b82f6',
                },
              },
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                height: 3,
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab 
                key={tab.value}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Paper>
      </Fade>

      {/* General Settings Tab */}
      {selectedTab === 0 && (
        <Fade in={true} style={{ transitionDelay: '200ms' }}>
          <Paper sx={{ 
            p: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: 3,
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              🏨 Thông tin khách sạn
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tên khách sạn"
                  value={generalSettings.hotelName}
                  onChange={(e) => setGeneralSettings({...generalSettings, hotelName: e.target.value})}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#3b82f6',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#3b82f6',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Địa chỉ"
                  value={generalSettings.hotelAddress}
                  onChange={(e) => setGeneralSettings({...generalSettings, hotelAddress: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  value={generalSettings.hotelPhone}
                  onChange={(e) => setGeneralSettings({...generalSettings, hotelPhone: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={generalSettings.hotelEmail}
                  onChange={(e) => setGeneralSettings({...generalSettings, hotelEmail: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Tiền tệ</InputLabel>
                  <Select
                    value={generalSettings.currency}
                    onChange={(e) => setGeneralSettings({...generalSettings, currency: e.target.value})}
                    label="Tiền tệ"
                  >
                    <MenuItem value="VND">VND (Việt Nam Đồng)</MenuItem>
                    <MenuItem value="USD">USD (US Dollar)</MenuItem>
                    <MenuItem value="EUR">EUR (Euro)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Múi giờ</InputLabel>
                  <Select
                    value={generalSettings.timezone}
                    onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
                    label="Múi giờ"
                  >
                    <MenuItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</MenuItem>
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="America/New_York">America/New_York</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSaveSettings('cài đặt chung')}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                  },
                }}
              >
                Lưu cài đặt
              </Button>
            </Box>
          </Paper>
        </Fade>
      )}

      {/* Security Settings Tab */}
      {selectedTab === 1 && (
        <Fade in={true} style={{ transitionDelay: '200ms' }}>
          <Paper sx={{ 
            p: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: 3,
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              🔒 Bảo mật hệ thống
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Thời gian timeout phiên (phút): {securitySettings.sessionTimeout}
                </Typography>
                <Slider
                  value={securitySettings.sessionTimeout}
                  onChange={(e, newValue) => setSecuritySettings({...securitySettings, sessionTimeout: newValue})}
                  min={5}
                  max={120}
                  step={5}
                  sx={{
                    color: '#3b82f6',
                    '& .MuiSlider-thumb': {
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Độ dài mật khẩu tối thiểu: {securitySettings.passwordMinLength}
                </Typography>
                <Slider
                  value={securitySettings.passwordMinLength}
                  onChange={(e, newValue) => setSecuritySettings({...securitySettings, passwordMinLength: newValue})}
                  min={6}
                  max={20}
                  step={1}
                  sx={{
                    color: '#10b981',
                    '& .MuiSlider-thumb': {
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.requireTwoFactor}
                      onChange={(e) => setSecuritySettings({...securitySettings, requireTwoFactor: e.target.checked})}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#3b82f6',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#3b82f6',
                        },
                      }}
                    />
                  }
                  label="Yêu cầu xác thực 2 yếu tố"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.allowGuestAccess}
                      onChange={(e) => setSecuritySettings({...securitySettings, allowGuestAccess: e.target.checked})}
                    />
                  }
                  label="Cho phép truy cập khách"
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSaveSettings('bảo mật')}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                  },
                }}
              >
                Lưu cài đặt
              </Button>
            </Box>
          </Paper>
        </Fade>
      )}

      {/* Notification Settings Tab */}
      {selectedTab === 2 && (
        <Fade in={true} style={{ transitionDelay: '200ms' }}>
          <Paper sx={{ 
            p: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: 3,
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              🔔 Cài đặt thông báo
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
                    />
                  }
                  label="Thông báo qua Email"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.smsNotifications}
                      onChange={(e) => setNotificationSettings({...notificationSettings, smsNotifications: e.target.checked})}
                    />
                  }
                  label="Thông báo qua SMS"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) => setNotificationSettings({...notificationSettings, pushNotifications: e.target.checked})}
                    />
                  }
                  label="Thông báo Push"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.bookingConfirmations}
                      onChange={(e) => setNotificationSettings({...notificationSettings, bookingConfirmations: e.target.checked})}
                    />
                  }
                  label="Xác nhận đặt phòng"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.paymentReminders}
                      onChange={(e) => setNotificationSettings({...notificationSettings, paymentReminders: e.target.checked})}
                    />
                  }
                  label="Nhắc nhở thanh toán"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.maintenanceAlerts}
                      onChange={(e) => setNotificationSettings({...notificationSettings, maintenanceAlerts: e.target.checked})}
                    />
                  }
                  label="Cảnh báo bảo trì"
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSaveSettings('thông báo')}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                  },
                }}
              >
                Lưu cài đặt
              </Button>
            </Box>
          </Paper>
        </Fade>
      )}

      {/* Theme Settings Tab */}
      {selectedTab === 3 && (
        <Fade in={true} style={{ transitionDelay: '200ms' }}>
          <Paper sx={{ 
            p: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: 3,
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              🎨 Cài đặt giao diện
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Màu chủ đạo
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip 
                    label="Xanh dương" 
                    onClick={() => setThemeSettings({...themeSettings, primaryColor: '#3b82f6'})}
                    sx={{
                      background: themeSettings.primaryColor === '#3b82f6' ? '#3b82f6' : 'transparent',
                      color: themeSettings.primaryColor === '#3b82f6' ? 'white' : 'inherit',
                    }}
                  />
                  <Chip 
                    label="Xanh lá" 
                    onClick={() => setThemeSettings({...themeSettings, primaryColor: '#10b981'})}
                    sx={{
                      background: themeSettings.primaryColor === '#10b981' ? '#10b981' : 'transparent',
                      color: themeSettings.primaryColor === '#10b981' ? 'white' : 'inherit',
                    }}
                  />
                  <Chip 
                    label="Tím" 
                    onClick={() => setThemeSettings({...themeSettings, primaryColor: '#8b5cf6'})}
                    sx={{
                      background: themeSettings.primaryColor === '#8b5cf6' ? '#8b5cf6' : 'transparent',
                      color: themeSettings.primaryColor === '#8b5cf6' ? 'white' : 'inherit',
                    }}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={themeSettings.darkMode}
                      onChange={(e) => setThemeSettings({...themeSettings, darkMode: e.target.checked})}
                    />
                  }
                  label="Chế độ tối"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={themeSettings.animations}
                      onChange={(e) => setThemeSettings({...themeSettings, animations: e.target.checked})}
                    />
                  }
                  label="Hiệu ứng chuyển động"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={themeSettings.compactMode}
                      onChange={(e) => setThemeSettings({...themeSettings, compactMode: e.target.checked})}
                    />
                  }
                  label="Chế độ compact"
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSaveSettings('giao diện')}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                  },
                }}
              >
                Lưu cài đặt
              </Button>
            </Box>
          </Paper>
        </Fade>
      )}

      {/* System Settings Tab */}
      {selectedTab === 4 && (
        <Fade in={true} style={{ transitionDelay: '200ms' }}>
          <Paper sx={{ 
            p: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: 3,
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              💾 Cài đặt hệ thống
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    📊 Thống kê hệ thống
                  </Typography>
                  <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Phiên bản:</Typography>
                      <Typography variant="body2" fontWeight="bold">v2.0.0</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Cập nhật cuối:</Typography>
                      <Typography variant="body2" fontWeight="bold">15/12/2024</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Dung lượng DB:</Typography>
                      <Typography variant="body2" fontWeight="bold">2.5 GB</Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    🔧 Bảo trì hệ thống
                  </Typography>
                  <Stack spacing={2}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<RefreshIcon />}
                      onClick={() => showSnackbar('Làm mới cache thành công!')}
                    >
                      Làm mới Cache
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<StorageIcon />}
                      onClick={() => showSnackbar('Tối ưu database thành công!')}
                    >
                      Tối ưu Database
                    </Button>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Fade>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ResponsiveContainer>
  );
};

export default Settings;
