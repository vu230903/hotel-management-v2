import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Fab,
  Stack,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
  Badge,
  Tooltip,
  Fade,
  Zoom,
  Tabs,
  Tab,
  LinearProgress,
  FormControlLabel,
  Checkbox,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Group as GroupIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  DateRange as DateRangeIcon,
  FilterAlt as FilterAltIcon,
  Sort as SortIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  HomeRepairService as CleaningServicesIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon,
  VerifiedUser as VerifiedUserIcon,
  Block as BlockIcon,
  Security as SecurityIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { usersAPI } from '../../services/api';
import ResponsiveContainer from '../../components/common/ResponsiveContainer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusChip from '../../components/common/StatusChip';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table', 'grid'
  const [advancedFilters, setAdvancedFilters] = useState({
    registrationDate: { start: '', end: '' },
    lastLogin: { start: '', end: '' },
    bookingCount: [0, 100],
    totalSpent: [0, 10000000],
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [banDialog, setBanDialog] = useState({ open: false, user: null });
  const [banData, setBanData] = useState({
    type: 'temporary', // 'temporary' or 'permanent'
    duration: 7, // days
    reason: '',
    until: null // for permanent ban
  });
  const [viewDialog, setViewDialog] = useState({ open: false, user: null });
  const [activeTab, setActiveTab] = useState('all');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'other',
    role: 'customer',
    status: 'active',
    tempPassword: '',
    notes: '',
  });

  const roleColors = {
    admin: { color: 'error', label: 'Quản trị viên', icon: '👑' },
    reception: { color: 'info', label: 'Nhân viên lễ tân', icon: '🏢' },
    customer: { color: 'success', label: 'Khách hàng', icon: '👤' },
    cleaning: { color: 'warning', label: 'Nhân viên dọn dẹp', icon: '🧹' },
  };

  const statusColors = {
    active: { color: 'success', label: 'Hoạt động', icon: '✅' },
    inactive: { color: 'warning', label: 'Tạm khóa', icon: '⏸️' },
    banned: { color: 'error', label: 'Cấm', icon: '🚫' },
  };


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getUsers({ limit: 100 });
      console.log('Fetched users:', response.data.data.users);
      setUsers(response.data.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showSnackbar('Lỗi khi tải danh sách người dùng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      console.log('Editing user:', user);
      console.log('User status:', user.status);
      setEditingUser(user);
      const formData = {
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        role: user.role || 'customer',
        status: user.status || 'active',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || 'other',
        notes: user.notes || '',
      };
      console.log('Form data status:', formData.status);
      console.log('Status mapping:', statusColors[formData.status]);
      setFormData(formData);
    } else {
      setEditingUser(null);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        gender: 'other',
        role: 'customer',
        status: 'active',
        tempPassword: '',
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        // Tách thông tin cơ bản và role
        const { role, status, ...basicInfo } = formData;
        
        // Cập nhật thông tin cơ bản
        await usersAPI.updateUser(editingUser._id, basicInfo);
        
        // Nếu role thay đổi, cập nhật role riêng
        if (role !== editingUser.role) {
          await usersAPI.updateUserRole(editingUser._id, { role });
        }
        
        // Nếu status thay đổi, cập nhật status riêng
        console.log('Status change:', { old: editingUser.status, new: status });
        if (status !== editingUser.status) {
          console.log('Updating status to:', status);
          
          // Chỉ xử lý active (kích hoạt user)
          if (status === 'active') {
            await usersAPI.updateUserStatus(editingUser._id, { isActive: true });
          } else {
            // Các status khác (inactive, banned) cần dùng nút riêng
            showSnackbar('Để thay đổi trạng thái khác, vui lòng sử dụng các nút hành động tương ứng', 'warning');
            return;
          }
        }
        
        showSnackbar('Cập nhật người dùng thành công!');
          } else {
            // Tạo user mới
            const userData = {
              ...formData,
              password: formData.tempPassword || 'temp123456'
            };
            delete userData.tempPassword; // Xóa tempPassword khỏi data gửi đi
            await usersAPI.createUser(userData);
            showSnackbar('Tạo người dùng mới thành công!');
          }
      fetchUsers();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving user:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Lỗi khi lưu người dùng';
      if (error.response?.data?.message) {
        errorMessage = `Lỗi khi lưu người dùng: ${error.response.data.message}`;
      } else if (error.response?.data?.errors) {
        errorMessage = `Lỗi khi lưu người dùng: ${error.response.data.errors.map(e => e.msg).join(', ')}`;
      } else if (error.message) {
        errorMessage = `Lỗi khi lưu người dùng: ${error.message}`;
      }
      
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await usersAPI.deleteUser(userId);
        showSnackbar('Xóa người dùng thành công!');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        showSnackbar('Lỗi khi xóa người dùng', 'error');
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await usersAPI.updateUser(userId, { status: newStatus });
      showSnackbar(`Cập nhật trạng thái thành công!`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      showSnackbar('Lỗi khi cập nhật trạng thái', 'error');
    }
  };

  const handleOpenBanDialog = (user) => {
    setBanDialog({ open: true, user });
    setBanData({
      type: 'temporary',
      duration: 7,
      reason: '',
      until: null
    });
  };

  const handleCloseBanDialog = () => {
    setBanDialog({ open: false, user: null });
    setBanData({
      type: 'temporary',
      duration: 7,
      reason: '',
      until: null
    });
  };

  const handleBanUser = async () => {
    try {
      const { user } = banDialog;
      
      // Validation
      if (!banData.type) {
        showSnackbar('Vui lòng chọn loại khóa', 'error');
        return;
      }
      
      if (banData.type === 'temporary' && (!banData.duration || banData.duration < 1)) {
        showSnackbar('Vui lòng chọn thời gian khóa hợp lệ', 'error');
        return;
      }
      
      const banUntil = banData.type === 'permanent' 
        ? null 
        : new Date(Date.now() + banData.duration * 24 * 60 * 60 * 1000);

      const banPayload = {
        type: banData.type,
        reason: banData.reason || '',
        until: banUntil
      };
      
      // Chỉ thêm duration nếu là temporary
      if (banData.type === 'temporary') {
        banPayload.duration = parseInt(banData.duration);
      }

      console.log('Ban payload:', banPayload);
      console.log('User ID:', user._id);

      const response = await usersAPI.banUser(user._id, banPayload);
      console.log('Ban response:', response);

      showSnackbar(`Đã ${banData.type === 'permanent' ? 'khóa vĩnh viễn' : `khóa tạm thời ${banData.duration} ngày`} người dùng ${user.fullName}`);
      fetchUsers();
      handleCloseBanDialog();
    } catch (error) {
      console.error('Error banning user:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Lỗi khi khóa người dùng';
      if (error.response?.data?.message) {
        errorMessage = `Lỗi khi khóa người dùng: ${error.response.data.message}`;
      } else if (error.response?.data?.errors) {
        errorMessage = `Lỗi khi khóa người dùng: ${error.response.data.errors.map(e => e.msg).join(', ')}`;
      } else if (error.message) {
        errorMessage = `Lỗi khi khóa người dùng: ${error.message}`;
      }
      
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      const response = await usersAPI.unbanUser(userId);
      console.log('Unban response:', response);
      showSnackbar('Đã mở khóa người dùng thành công!');
      fetchUsers();
    } catch (error) {
      console.error('Error unbanning user:', error);
      showSnackbar('Lỗi khi mở khóa người dùng', 'error');
    }
  };

  const handleViewUser = (user) => {
    setViewDialog({ open: true, user });
  };

  const handleCloseViewDialog = () => {
    setViewDialog({ open: false, user: null });
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user._id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    try {
      switch (bulkAction) {
        case 'activate':
          await Promise.all(selectedUsers.map(id => 
            usersAPI.updateUser(id, { status: 'active' })
          ));
          showSnackbar(`Đã kích hoạt ${selectedUsers.length} người dùng`);
          break;
        case 'deactivate':
          await Promise.all(selectedUsers.map(id => 
            usersAPI.updateUser(id, { status: 'inactive' })
          ));
          showSnackbar(`Đã khóa ${selectedUsers.length} người dùng`);
          break;
        case 'delete':
          if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedUsers.length} người dùng?`)) {
            await Promise.all(selectedUsers.map(id => 
              usersAPI.deleteUser(id)
            ));
            showSnackbar(`Đã xóa ${selectedUsers.length} người dùng`);
          }
          break;
      }
      setSelectedUsers([]);
      setBulkAction('');
      fetchUsers();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      showSnackbar('Lỗi khi thực hiện hành động hàng loạt', 'error');
    }
  };

  // Filter users based on active tab
  const filteredUsers = users.filter((user) => {
    if (activeTab === 'all') {
      return true;
    }
    
    if (activeTab === 'customers') {
      return user.role === 'customer';
    }
    
    if (activeTab === 'cleaning') {
      return user.role === 'cleaning';
    }
    
    if (activeTab === 'staff') {
      return user.role === 'staff';
    }
    
    
    if (activeTab === 'admin') {
      return user.role === 'admin';
    }
    
    return true;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <LoadingSpinner 
        message="Đang tải danh sách người dùng..." 
        size={60} 
        fullScreen={false}
      />
    );
  }

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
                  background: 'linear-gradient(135deg, #374151 0%, #6b7280 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-8px',
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                    borderRadius: '2px',
                  },
                  '@media (max-width:600px)': {
                    fontSize: '2rem',
                  },
                }}
              >
                Quản lý Người dùng
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Quản lý khách hàng, nhân viên và quản trị viên
              </Typography>
            </Box>
            
            {/* View Mode Toggle */}
            <Stack direction="row" spacing={1}>
              <Tooltip title="Bảng">
                <IconButton 
                  onClick={() => setViewMode('table')}
                  sx={{
                    background: viewMode === 'table' ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' : 'transparent',
                    color: viewMode === 'table' ? 'white' : 'inherit',
                  }}
                >
                  <ListIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Lưới">
                <IconButton 
                  onClick={() => setViewMode('grid')}
                  sx={{
                    background: viewMode === 'grid' ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' : 'transparent',
                    color: viewMode === 'grid' ? 'white' : 'inherit',
                  }}
                >
                  <GridIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
          
          {/* Quick Stats */}
          <Paper sx={{ 
            p: 4, 
            mb: 4,
            borderRadius: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
            },
          }}>
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                  border: '2px solid rgba(16, 185, 129, 0.2)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.2)',
                  },
                }}>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {users.filter(user => user.role === 'customer').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="600">
                    👤 Khách hàng
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.1) 100%)',
                  border: '2px solid rgba(59, 130, 246, 0.2)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.2)',
                  },
                }}>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {users.filter(user => user.role === 'reception').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="600">
                    🏢 Lễ tân
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
                  border: '2px solid rgba(245, 158, 11, 0.2)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(245, 158, 11, 0.2)',
                  },
                }}>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {users.filter(user => user.role === 'cleaning').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="600">
                    🧹 Dọn dẹp
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                  border: '2px solid rgba(239, 68, 68, 0.2)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(239, 68, 68, 0.2)',
                  },
                }}>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {users.filter(user => user.role === 'admin').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="600">
                    👑 Quản trị
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
                  border: '2px solid rgba(217, 119, 6, 0.2)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(217, 119, 6, 0.2)',
                  },
                }}>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {users.filter(user => user.status === 'active').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="600">
                    ✅ Đang hoạt động
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Fade>


      {/* Tab Navigation */}
      <Fade in={true} style={{ transitionDelay: '200ms' }}>
        <Paper sx={{ 
          p: 2, 
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
        }}>
          <Tabs 
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: '2px 2px 0 0',
                background: 'linear-gradient(90deg, #d97706 0%, #f59e0b 100%)',
              },
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#6b7280',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: '#d97706',
                  backgroundColor: 'rgba(217, 119, 6, 0.05)',
                },
                '&.Mui-selected': {
                  color: '#d97706',
                  backgroundColor: 'rgba(217, 119, 6, 0.08)',
                },
              },
            }}
          >
            <Tab
              icon={<GroupIcon sx={{ fontSize: 20 }} />}
              label="Tất cả"
              value="all"
            />
            <Tab
              icon={<PersonIcon sx={{ fontSize: 20 }} />}
              label="Khách hàng"
              value="customers"
            />
            <Tab
              icon={<CleaningServicesIcon sx={{ fontSize: 20 }} />}
              label="Dọn dẹp"
              value="cleaning"
            />
            <Tab
              icon={<AdminIcon sx={{ fontSize: 20 }} />}
              label="Lễ tân"
              value="staff"
            />
            <Tab
              icon={<AdminIcon sx={{ fontSize: 20 }} />}
              label="Quản trị"
              value="admin"
            />
          </Tabs>
          
          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <Fade in={selectedUsers.length > 0}>
              <Box sx={{ 
                mt: 3, 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
                border: '2px solid rgba(217, 119, 6, 0.2)',
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#d97706' }}>
                  🔧 Hành động hàng loạt ({selectedUsers.length} người dùng được chọn)
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Chọn hành động</InputLabel>
                    <Select
                      value={bulkAction}
                      onChange={(e) => setBulkAction(e.target.value)}
                      label="Chọn hành động"
                    >
                      <MenuItem value="activate">✅ Kích hoạt</MenuItem>
                      <MenuItem value="deactivate">⏸️ Khóa</MenuItem>
                      <MenuItem value="delete">🗑️ Xóa</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    onClick={handleBulkAction}
                    disabled={!bulkAction}
                    sx={{
                      background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                      },
                    }}
                  >
                    Thực hiện
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setSelectedUsers([])}
                    sx={{ borderColor: '#d97706', color: '#d97706' }}
                  >
                    Bỏ chọn tất cả
                  </Button>
                </Stack>
              </Box>
            </Fade>
          )}
          
          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <Fade in={showAdvancedFilters}>
              <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e2e8f0' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  🔧 Bộ lọc nâng cao
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      📅 Ngày đăng ký
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <TextField
                        type="date"
                        label="Từ ngày"
                        value={advancedFilters.registrationDate.start}
                        onChange={(e) => setAdvancedFilters({
                          ...advancedFilters,
                          registrationDate: { ...advancedFilters.registrationDate, start: e.target.value }
                        })}
                        InputLabelProps={{ shrink: true }}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        type="date"
                        label="Đến ngày"
                        value={advancedFilters.registrationDate.end}
                        onChange={(e) => setAdvancedFilters({
                          ...advancedFilters,
                          registrationDate: { ...advancedFilters.registrationDate, end: e.target.value }
                        })}
                        InputLabelProps={{ shrink: true }}
                        sx={{ flex: 1 }}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      💰 Tổng chi tiêu: {advancedFilters.totalSpent[0].toLocaleString()}đ - {advancedFilters.totalSpent[1].toLocaleString()}đ
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(advancedFilters.totalSpent[1] / 10000000) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#3b82f6',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}
        </Paper>
      </Fade>

      {/* Users Table */}
      <Fade in={true} style={{ transitionDelay: '400ms' }}>
        <Paper sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
        }}>
          {/* Table View */}
          {viewMode === 'table' && (
            <TableContainer>
              <Table>
              <TableHead sx={{ 
                background: 'linear-gradient(135deg, #374151 0%, #6b7280 100%)',
              }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 50 }}>
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                      onChange={handleSelectAll}
                      sx={{ color: 'white' }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Người dùng</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Số điện thoại</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vai trò</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ngày tạo</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user, index) => (
                  <TableRow 
                    key={user._id}
                    onClick={() => handleViewUser(user)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(217, 119, 6, 0.05)',
                      },
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                        sx={{ color: '#d97706' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ 
                          mr: 2,
                          background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                          fontWeight: 'bold',
                        }}>
                          {user.fullName?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="600">
                            {user.fullName || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {user._id.slice(-6)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {user.email || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {user.phone || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={roleColors[user.role]?.label}
                        color={roleColors[user.role]?.color}
                        size="small"
                        icon={
                          user.role === 'admin' ? <SecurityIcon /> :
                          user.role === 'reception' ? <AdminIcon /> :
                          user.role === 'cleaning' ? <AdminIcon /> :
                          <PersonIcon />
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusColors[user.status]?.label}
                        color={statusColors[user.status]?.color}
                        size="small"
                        icon={
                          user.status === 'active' ? <CheckCircleIcon /> :
                          user.status === 'inactive' ? <AccessTimeIcon /> :
                          <BlockIcon />
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {formatDate(user.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(user)}
                            sx={{
                              background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                              },
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        {user.status === 'banned' ? (
                          <Tooltip title="Mở khóa tài khoản">
                            <IconButton
                              size="small"
                              onClick={() => handleUnbanUser(user._id)}
                              sx={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                },
                              }}
                            >
                              <VerifiedUserIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Khóa tài khoản">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenBanDialog(user)}
                              sx={{
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: 'white',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                                },
                              }}
                            >
                              <BlockIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUser(user._id)}
                            sx={{
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                              },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {filteredUsers.map((user) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={user._id}>
                    <Card sx={{
                      height: '100%',
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                        borderColor: '#d97706',
                      },
                    }}
                    onClick={() => handleViewUser(user)}
                    >
                      <CardContent sx={{ p: 3 }}>
                        {/* User Avatar & Basic Info */}
                        <Box display="flex" alignItems="center" mb={2}>
                          <Avatar sx={{ 
                            mr: 2,
                            width: 48,
                            height: 48,
                            background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                          }}>
                            {user.fullName?.charAt(0)?.toUpperCase() || '👤'}
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="h6" fontWeight="700" noWrap>
                              {user.fullName || 'Chưa cập nhật'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Role & Status */}
                        <Box display="flex" gap={1} mb={2}>
                          <Chip
                            label={roleColors[user.role]?.label || user.role}
                            color={roleColors[user.role]?.color || 'default'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                          <Chip
                            label={statusColors[user.status]?.label || user.status}
                            color={statusColors[user.status]?.color || 'default'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>

                        {/* Phone */}
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          📱 {user.phone || 'Chưa cập nhật'}
                        </Typography>

                        {/* Created Date */}
                        <Typography variant="body2" color="text.secondary">
                          📅 {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </Typography>
                      </CardContent>

                      <CardActions sx={{ 
                        p: 2, 
                        pt: 0,
                        justifyContent: 'space-between',
                        borderTop: '1px solid #e2e8f0'
                      }}>
                        <Checkbox
                          checked={selectedUsers.includes(user._id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectUser(user._id);
                          }}
                          sx={{ color: '#d97706' }}
                        />
                        <Box>
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDialog(user);
                              }}
                              sx={{
                                background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                                color: 'white',
                                mr: 1,
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
                                },
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {user.status === 'banned' ? (
                            <Tooltip title="Mở khóa">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnbanUser(user._id);
                                }}
                                sx={{
                                  background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                                  color: 'white',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
                                  },
                                }}
                              >
                                <LockOpenIcon />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Khóa tài khoản">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenBanDialog(user);
                                }}
                                sx={{
                                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                                  color: 'white',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                                  },
                                }}
                              >
                                <LockIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUser(user._id);
                              }}
                              sx={{
                                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                                color: 'white',
                                ml: 1,
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                                },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {filteredUsers.length === 0 && (
            <Box textAlign="center" sx={{ py: 6 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Không tìm thấy người dùng nào
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Thử thay đổi bộ lọc hoặc tạo người dùng mới
              </Typography>
            </Box>
          )}
        </Paper>
      </Fade>

      {/* Add User FAB */}
      <Fab
        color="primary"
        aria-label="add user"
        onClick={() => handleOpenDialog()}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <AddIcon />
      </Fab>

      {/* User Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            maxHeight: 'calc(100vh - 40px)',
            display: 'flex',
            flexDirection: 'column',
            margin: '20px',
            zIndex: 1300,
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #374151 0%, #6b7280 100%)',
          color: 'white',
          textAlign: 'center',
          py: 4,
          borderRadius: '16px 16px 0 0',
          position: 'relative',
          overflow: 'hidden',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
          },
        }}>
            {editingUser ? '✏️ Chỉnh sửa người dùng' : '➕ Thêm người dùng mới'}
          <Box sx={{ opacity: 0.9, mt: 1, fontSize: '1rem', fontWeight: 'normal' }}>
            {editingUser ? 'Cập nhật thông tin người dùng' : 'Tạo tài khoản người dùng mới'}
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ 
          p: 4, 
          flex: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#d97706',
            borderRadius: '4px',
            '&:hover': {
              background: '#f59e0b',
            },
          },
        }}>
          <Grid container spacing={4}>
            {/* Thông tin cơ bản */}
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)',
                border: '2px solid rgba(217, 119, 6, 0.1)',
                mb: 3,
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  fontWeight: 700, 
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                }}>
                  👤 Thông tin cơ bản
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          background: 'rgba(248, 250, 252, 0.8)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)',
                            '& fieldset': {
                              borderColor: '#d97706',
                            },
                          },
                          '&.Mui-focused': {
                            background: 'white',
                            boxShadow: '0 0 0 3px rgba(217, 119, 6, 0.1)',
                            '& fieldset': {
                              borderColor: '#d97706',
                              borderWidth: 2,
                            },
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          background: 'rgba(248, 250, 252, 0.8)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)',
                            '& fieldset': {
                              borderColor: '#d97706',
                            },
                          },
                          '&.Mui-focused': {
                            background: 'white',
                            boxShadow: '0 0 0 3px rgba(217, 119, 6, 0.1)',
                            '& fieldset': {
                              borderColor: '#d97706',
                              borderWidth: 2,
                            },
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          background: 'rgba(248, 250, 252, 0.8)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)',
                            '& fieldset': {
                              borderColor: '#d97706',
                            },
                          },
                          '&.Mui-focused': {
                            background: 'white',
                            boxShadow: '0 0 0 3px rgba(217, 119, 6, 0.1)',
                            '& fieldset': {
                              borderColor: '#d97706',
                              borderWidth: 2,
                            },
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Ngày sinh"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          background: 'rgba(248, 250, 252, 0.8)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)',
                            '& fieldset': {
                              borderColor: '#d97706',
                            },
                          },
                          '&.Mui-focused': {
                            background: 'white',
                            boxShadow: '0 0 0 3px rgba(217, 119, 6, 0.1)',
                            '& fieldset': {
                              borderColor: '#d97706',
                              borderWidth: 2,
                            },
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Giới tính</InputLabel>
                      <Select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        label="Giới tính"
                        sx={{
                          borderRadius: 3,
                          background: 'rgba(248, 250, 252, 0.8)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)',
                            '& fieldset': {
                              borderColor: '#d97706',
                            },
                          },
                          '&.Mui-focused': {
                            background: 'white',
                            boxShadow: '0 0 0 3px rgba(217, 119, 6, 0.1)',
                            '& fieldset': {
                              borderColor: '#d97706',
                              borderWidth: 2,
                            },
                          },
                        }}
                      >
                        <MenuItem value="male">Nam</MenuItem>
                        <MenuItem value="female">Nữ</MenuItem>
                        <MenuItem value="other">Khác</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Địa chỉ"
                      multiline
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          background: 'rgba(248, 250, 252, 0.8)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)',
                            '& fieldset': {
                              borderColor: '#d97706',
                            },
                          },
                          '&.Mui-focused': {
                            background: 'white',
                            boxShadow: '0 0 0 3px rgba(217, 119, 6, 0.1)',
                            '& fieldset': {
                              borderColor: '#d97706',
                              borderWidth: 2,
                            },
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Vai trò và trạng thái */}
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)',
                border: '2px solid rgba(217, 119, 6, 0.1)',
                mb: 3,
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  fontWeight: 700, 
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                }}>
                  ⚙️ Cài đặt tài khoản
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Vai trò</InputLabel>
                      <Select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        label="Vai trò"
                        sx={{
                          borderRadius: 3,
                          background: 'rgba(248, 250, 252, 0.8)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#d97706',
                            },
                          },
                          '&.Mui-focused': {
                            background: 'white',
                            boxShadow: '0 0 0 3px rgba(217, 119, 6, 0.1)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#d97706',
                              borderWidth: 2,
                            },
                          },
                        }}
                      >
                        {Object.entries(roleColors).map(([key, value]) => (
                          <MenuItem key={key} value={key}>
                            {value.icon} {value.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Trạng thái</InputLabel>
                      <Select
                        value={formData.status}
                        onChange={(e) => {
                          console.log('Status changed from', formData.status, 'to', e.target.value);
                          setFormData({ ...formData, status: e.target.value });
                        }}
                        label="Trạng thái"
                        sx={{
                          borderRadius: 3,
                          background: 'rgba(248, 250, 252, 0.8)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#d97706',
                            },
                          },
                          '&.Mui-focused': {
                            background: 'white',
                            boxShadow: '0 0 0 3px rgba(217, 119, 6, 0.1)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#d97706',
                              borderWidth: 2,
                            },
                          },
                        }}
                      >
                        {Object.entries(statusColors)
                          .filter(([key]) => key === 'active') // Chỉ giữ active trong form edit
                          .map(([key, value]) => (
                          <MenuItem key={key} value={key}>
                            {value.icon} {value.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {!editingUser && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Mật khẩu tạm thời"
                        type="password"
                        value={formData.tempPassword || ''}
                        onChange={(e) => setFormData({ ...formData, tempPassword: e.target.value })}
                        placeholder="Để trống để sử dụng mật khẩu mặc định"
                        helperText="Mật khẩu mặc định: temp123456"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            background: 'rgba(248, 250, 252, 0.8)',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)',
                              '& fieldset': {
                                borderColor: '#d97706',
                              },
                            },
                            '&.Mui-focused': {
                              background: 'white',
                              boxShadow: '0 0 0 3px rgba(217, 119, 6, 0.1)',
                              '& fieldset': {
                                borderColor: '#d97706',
                                borderWidth: 2,
                              },
                            },
                          },
                        }}
                      />
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>

            {/* Ghi chú */}
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
                border: '2px solid rgba(16, 185, 129, 0.1)',
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  fontWeight: 700, 
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                }}>
                  📝 Ghi chú
                </Typography>
                <TextField
                  fullWidth
                  label="Ghi chú về người dùng"
                  multiline
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Nhập ghi chú về người dùng này..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      background: 'rgba(248, 250, 252, 0.8)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
                        '& fieldset': {
                          borderColor: '#10b981',
                        },
                      },
                      '&.Mui-focused': {
                        background: 'white',
                        boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)',
                        '& fieldset': {
                          borderColor: '#10b981',
                          borderWidth: 2,
                        },
                      },
                    },
                  }}
                />
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 4, 
          borderTop: '2px solid #e2e8f0',
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          borderRadius: '0 0 16px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              💡 Tip: Điền đầy đủ thông tin để tạo tài khoản hoàn chỉnh
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button 
              onClick={handleCloseDialog} 
              variant="outlined"
              sx={{
                borderColor: '#6b7280',
                color: '#6b7280',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#374151',
                  color: '#374151',
                  background: 'rgba(55, 65, 81, 0.05)',
                },
              }}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(217, 119, 6, 0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {editingUser ? '💾 Cập nhật' : '✨ Tạo mới'}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog 
        open={banDialog.open} 
        onClose={handleCloseBanDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            maxHeight: 'calc(100vh - 40px)',
            display: 'flex',
            flexDirection: 'column',
            margin: '20px',
            zIndex: 1300,
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          textAlign: 'center',
          py: 3,
          borderRadius: '12px 12px 0 0',
          fontSize: '1.5rem',
          fontWeight: 'bold',
        }}>
            🔒 Khóa tài khoản
          <Box sx={{ opacity: 0.9, mt: 1, fontSize: '1rem', fontWeight: 'normal' }}>
            {banDialog.user?.fullName}
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ 
          p: 4, 
          flex: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#ef4444',
            borderRadius: '4px',
            '&:hover': {
              background: '#dc2626',
            },
          },
        }}>
          <Grid container spacing={3}>
            {/* Loại khóa */}
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)',
                border: '2px solid rgba(239, 68, 68, 0.1)',
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  fontWeight: 700, 
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                }}>
                  ⏰ Loại khóa
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Chọn loại khóa</InputLabel>
                  <Select
                    value={banData.type}
                    onChange={(e) => setBanData({ ...banData, type: e.target.value })}
                    label="Chọn loại khóa"
                    sx={{
                      borderRadius: 3,
                      background: 'rgba(248, 250, 252, 0.8)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
                        '& fieldset': {
                          borderColor: '#ef4444',
                        },
                      },
                      '&.Mui-focused': {
                        background: 'white',
                        boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
                        '& fieldset': {
                          borderColor: '#ef4444',
                          borderWidth: 2,
                        },
                      },
                    }}
                  >
                    <MenuItem value="temporary">🔒 Khóa tạm thời</MenuItem>
                    <MenuItem value="permanent">🚫 Khóa vĩnh viễn</MenuItem>
                  </Select>
                </FormControl>
              </Paper>
            </Grid>

            {/* Thời gian khóa (chỉ hiện khi chọn tạm thời) */}
            {banData.type === 'temporary' && (
              <Grid item xs={12}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)',
                  border: '2px solid rgba(239, 68, 68, 0.1)',
                }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontWeight: 700, 
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3,
                  }}>
                    📅 Thời gian khóa
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Số ngày khóa</InputLabel>
                    <Select
                      value={banData.duration}
                      onChange={(e) => setBanData({ ...banData, duration: e.target.value })}
                      label="Số ngày khóa"
                      sx={{
                        borderRadius: 3,
                        background: 'rgba(248, 250, 252, 0.8)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
                          '& fieldset': {
                            borderColor: '#ef4444',
                          },
                        },
                        '&.Mui-focused': {
                          background: 'white',
                          boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
                          '& fieldset': {
                            borderColor: '#ef4444',
                            borderWidth: 2,
                          },
                        },
                      }}
                    >
                      <MenuItem value={1}>1 ngày</MenuItem>
                      <MenuItem value={3}>3 ngày</MenuItem>
                      <MenuItem value={7}>7 ngày</MenuItem>
                      <MenuItem value={15}>15 ngày</MenuItem>
                      <MenuItem value={30}>30 ngày</MenuItem>
                      <MenuItem value={90}>90 ngày</MenuItem>
                    </Select>
                  </FormControl>
                </Paper>
              </Grid>
            )}

            {/* Lý do khóa */}
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)',
                border: '2px solid rgba(239, 68, 68, 0.1)',
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  fontWeight: 700, 
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                }}>
                  📝 Lý do khóa
                </Typography>
                <TextField
                  fullWidth
                  label="Nhập lý do khóa tài khoản"
                  multiline
                  rows={4}
                  value={banData.reason}
                  onChange={(e) => setBanData({ ...banData, reason: e.target.value })}
                  placeholder="Ví dụ: Vi phạm quy định, không thanh toán, spam..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      background: 'rgba(248, 250, 252, 0.8)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
                        '& fieldset': {
                          borderColor: '#ef4444',
                        },
                      },
                      '&.Mui-focused': {
                        background: 'white',
                        boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
                        '& fieldset': {
                          borderColor: '#ef4444',
                          borderWidth: 2,
                        },
                      },
                    },
                  }}
                />
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 4, 
          borderTop: '2px solid #e2e8f0',
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          borderRadius: '0 0 16px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              ⚠️ Cảnh báo: Hành động này sẽ ngăn người dùng đăng nhập vào hệ thống
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button 
              onClick={handleCloseBanDialog} 
              variant="outlined"
              sx={{
                borderColor: '#6b7280',
                color: '#6b7280',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#374151',
                  color: '#374151',
                  background: 'rgba(55, 65, 81, 0.05)',
                },
              }}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleBanUser} 
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
                },
              }}
            >
              {banData.type === 'permanent' ? 'Khóa vĩnh viễn' : `Khóa ${banData.duration} ngày`}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* View User Dialog */}
      <Dialog 
        open={viewDialog.open} 
        onClose={handleCloseViewDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            maxHeight: 'calc(100vh - 40px)',
            display: 'flex',
            flexDirection: 'column',
            margin: '20px',
            zIndex: 1300,
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #374151 0%, #6b7280 100%)',
          color: 'white',
          textAlign: 'center',
          py: 3,
          borderRadius: '12px 12px 0 0',
          fontSize: '1.5rem',
          fontWeight: 'bold',
        }}>
            👤 Chi tiết người dùng
          <Box sx={{ opacity: 0.9, mt: 1, fontSize: '1rem', fontWeight: 'normal' }}>
            {viewDialog.user?.fullName}
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ 
          p: 4, 
          flex: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#374151',
            borderRadius: '4px',
            '&:hover': {
              background: '#6b7280',
            },
          },
        }}>
          {viewDialog.user && (
            <Grid container spacing={3}>
              {/* Thông tin cơ bản */}
              <Grid item xs={12}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.05) 0%, rgba(107, 114, 128, 0.05) 100%)',
                  border: '2px solid rgba(55, 65, 81, 0.1)',
                }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontWeight: 700, 
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3,
                  }}>
                    👤 Thông tin cơ bản
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Họ và tên
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {viewDialog.user.fullName || 'Chưa cập nhật'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Email
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {viewDialog.user.email}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Số điện thoại
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {viewDialog.user.phone || 'Chưa cập nhật'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Ngày sinh
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {viewDialog.user.dateOfBirth ? formatDate(viewDialog.user.dateOfBirth) : 'Chưa cập nhật'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Giới tính
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {viewDialog.user.gender === 'male' ? 'Nam' : viewDialog.user.gender === 'female' ? 'Nữ' : 'Chưa cập nhật'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Địa chỉ
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {viewDialog.user.address || 'Chưa cập nhật'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Thông tin tài khoản */}
              <Grid item xs={12}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)',
                  border: '2px solid rgba(217, 119, 6, 0.1)',
                }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontWeight: 700, 
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3,
                  }}>
                    🔐 Thông tin tài khoản
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Vai trò
                        </Typography>
                        <Chip
                          label={roleColors[viewDialog.user.role]?.label || viewDialog.user.role}
                          color={roleColors[viewDialog.user.role]?.color || 'default'}
                          size="medium"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Trạng thái
                        </Typography>
                        <Chip
                          label={statusColors[viewDialog.user.status]?.label || viewDialog.user.status}
                          color={statusColors[viewDialog.user.status]?.color || 'default'}
                          size="medium"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Ngày tạo
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {formatDate(viewDialog.user.createdAt)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Lần đăng nhập cuối
                        </Typography>
                        <Typography variant="body1" fontWeight="600">
                          {viewDialog.user.lastLogin ? formatDate(viewDialog.user.lastLogin) : 'Chưa đăng nhập'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Thông tin khóa (nếu có) */}
              {viewDialog.user.status === 'banned' && viewDialog.user.banInfo && (
                <Grid item xs={12}>
                  <Paper sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)',
                    border: '2px solid rgba(239, 68, 68, 0.1)',
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ 
                      fontWeight: 700, 
                      color: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      mb: 3,
                    }}>
                      🔒 Thông tin khóa tài khoản
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Loại khóa
                          </Typography>
                          <Typography variant="body1" fontWeight="600">
                            {viewDialog.user.banInfo.type === 'permanent' ? 'Khóa vĩnh viễn' : 'Khóa tạm thời'}
                          </Typography>
                        </Box>
                      </Grid>
                      {viewDialog.user.banInfo.type === 'temporary' && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Thời gian khóa
                            </Typography>
                            <Typography variant="body1" fontWeight="600">
                              {viewDialog.user.banInfo.duration} ngày
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Ngày khóa
                          </Typography>
                          <Typography variant="body1" fontWeight="600">
                            {formatDate(viewDialog.user.banInfo.bannedAt)}
                          </Typography>
                        </Box>
                      </Grid>
                      {viewDialog.user.banInfo.until && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Hết hạn vào
                            </Typography>
                            <Typography variant="body1" fontWeight="600">
                              {formatDate(viewDialog.user.banInfo.until)}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {viewDialog.user.banInfo.reason && (
                        <Grid item xs={12}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Lý do khóa
                            </Typography>
                            <Typography variant="body1" fontWeight="600">
                              {viewDialog.user.banInfo.reason}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Grid>
              )}

              {/* Ghi chú */}
              {viewDialog.user.notes && (
                <Grid item xs={12}>
                  <Paper sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
                    border: '2px solid rgba(16, 185, 129, 0.1)',
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ 
                      fontWeight: 700, 
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      mb: 3,
                    }}>
                      📝 Ghi chú
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {viewDialog.user.notes}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 4, 
          borderTop: '2px solid #e2e8f0',
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          borderRadius: '0 0 16px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              💡 Click vào hàng bất kỳ để xem chi tiết người dùng
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button 
              onClick={handleCloseViewDialog} 
              variant="outlined"
              sx={{
                borderColor: '#6b7280',
                color: '#6b7280',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#374151',
                  color: '#374151',
                  background: 'rgba(55, 65, 81, 0.05)',
                },
              }}
            >
              Đóng
            </Button>
            <Button 
              onClick={() => {
                handleCloseViewDialog();
                handleOpenDialog(viewDialog.user);
              }}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(217, 119, 6, 0.4)',
                },
              }}
            >
              ✏️ Chỉnh sửa
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

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

export default UserManagement;