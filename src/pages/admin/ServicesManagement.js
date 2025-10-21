import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Grid,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  Snackbar,
  Alert,
  InputAdornment,
  Divider,
  Stack,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon,
  Schedule as TimeIcon,
  PhotoCamera as ImageIcon
} from '@mui/icons-material';
import { servicesAPI } from '../../services/api';

const ServicesManagement = () => {
  // Default categories fallback
  const defaultCategories = [
    { value: 'food_beverage', label: '🍽️ Ăn uống', icon: '🍽️', count: 0 },
    { value: 'spa_wellness', label: '💆‍♀️ Spa & Wellness', icon: '💆‍♀️', count: 0 },
    { value: 'laundry', label: '👕 Giặt ủi', icon: '👕', count: 0 },
    { value: 'transportation', label: '🚗 Vận chuyển', icon: '🚗', count: 0 },
    { value: 'entertainment', label: '🎮 Giải trí', icon: '🎮', count: 0 },
    { value: 'business', label: '💼 Dịch vụ business', icon: '💼', count: 0 },
    { value: 'room_service', label: '🛎️ Dịch vụ phòng', icon: '🛎️', count: 0 },
    { value: 'other', label: '📋 Khác', icon: '📋', count: 0 }
  ];

  // State
  const [services, setServices] = useState([]); // Initialize with empty array
  const [categories, setCategories] = useState(defaultCategories);
  
  // Debug services state
  console.log('🔧 Current services state:', services);
  console.log('🔧 Services length:', services.length);
  console.log('🔧 Is services array?', Array.isArray(services));
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalServices, setTotalServices] = useState(0);
  
  // Filters & Search
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    isActive: 'all', // Changed from 'true' to 'all' to show all services
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Dialog states
  const [dialog, setDialog] = useState({
    open: false,
    mode: 'create', // 'create', 'edit', 'view'
    service: null
  });

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'room_service',
    price: '',
    unit: 'per_service',
    isActive: true,
    availableHours: {
      start: '00:00',
      end: '23:59'
    },
    maxQuantity: '',
    preparationTime: '',
    tags: [],
    images: []
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load data
  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [page, rowsPerPage, filters]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };

      if (filters.category !== 'all') {
        params.category = filters.category;
      }
      if (filters.isActive !== 'all') {
        params.isActive = filters.isActive;
      }
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }

      console.log('🔗 Final params to send:', params);
      const response = await servicesAPI.getServices(params);
      console.log('📊 Full Services response:', response);
      
      if (response.data && response.data.success) {
        setServices(Array.isArray(response.data.data?.services) ? response.data.data.services : []);
        setTotalServices(response.data.data?.pagination?.total || 0);
      } else {
        console.warn('⚠️ API response format unexpected:', response.data);
        setServices([]);
        setTotalServices(0);
      }
      
    } catch (error) {
      console.error('❌ Error fetching services:', error);
      console.error('❌ Error details:', error.response?.data);
      setServices([]);
      setTotalServices(0);
      showSnackbar(error.response?.data?.message || 'Lỗi khi tải danh sách dịch vụ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await servicesAPI.getServiceCategories();
      console.log('📊 Categories response:', response.data);
      
      if (response.data && response.data.success) {
        setCategories(Array.isArray(response.data.data) ? response.data.data : defaultCategories);
      } else {
        console.warn('⚠️ Categories API response format unexpected:', response.data);
        setCategories(defaultCategories);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setCategories(defaultCategories);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (mode, service = null) => {
    setDialog({ open: true, mode, service });
    
    if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        category: 'room_service',
        price: '',
        unit: 'per_service',
        isActive: true,
        availableHours: {
          start: '00:00',
          end: '23:59'
        },
        maxQuantity: '',
        preparationTime: '',
        tags: [],
        images: []
      });
    } else if (mode === 'edit' && service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        category: service.category || 'room_service',
        price: service.price || '',
        unit: service.unit || 'per_service',
        isActive: service.isActive !== undefined ? service.isActive : true,
        availableHours: service.availableHours || { start: '00:00', end: '23:59' },
        maxQuantity: service.maxQuantity || '',
        preparationTime: service.preparationTime || '',
        tags: service.tags || [],
        images: service.images || []
      });
    }
  };

  const handleCloseDialog = () => {
    setDialog({ open: false, mode: 'create', service: null });
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        maxQuantity: formData.maxQuantity ? parseInt(formData.maxQuantity) : null,
        preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : 0
      };

      console.log('📤 Submitting service data:', submitData);
      console.log('🔧 Dialog mode:', dialog.mode);
      console.log('🔧 Dialog service:', dialog.service);

      let response;
      if (dialog.mode === 'create') {
        console.log('➕ Creating new service...');
        response = await servicesAPI.createService(submitData);
        console.log('✅ Create service response:', response.data);
        showSnackbar('Tạo dịch vụ thành công');
      } else if (dialog.mode === 'edit') {
        console.log('✏️ Updating service with ID:', dialog.service._id);
        console.log('📊 Update data:', submitData);
        response = await servicesAPI.updateService(dialog.service._id, submitData);
        console.log('✅ Update service response:', response);
        console.log('✅ Update service response data:', response.data);
        showSnackbar('Cập nhật dịch vụ thành công');
      }

      // Refresh both services and categories
      await Promise.all([
        fetchServices(),
        fetchCategories()
      ]);
      
      handleCloseDialog();
    } catch (error) {
      console.error('❌ Error submitting service:', error);
      console.error('❌ Error details:', error.response?.data);
      showSnackbar(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
      return;
    }

    try {
      await servicesAPI.deleteService(serviceId);
      showSnackbar('Xóa dịch vụ thành công');
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      showSnackbar(error.response?.data?.message || 'Có lỗi khi xóa dịch vụ', 'error');
    }
  };

  const handleToggleStatus = async (service) => {
    try {
      const newStatus = !service.isActive;
      const updateData = { isActive: newStatus };
      
      console.log('🔄 Toggling service status:', service.name, 'to', newStatus);
      
      await servicesAPI.updateService(service._id, updateData);
      
      showSnackbar(
        `${newStatus ? 'Kích hoạt' : 'Tạm dừng'} dịch vụ "${service.name}" thành công`,
        'success'
      );
      
      // Refresh services list
      fetchServices();
    } catch (error) {
      console.error('Error toggling service status:', error);
      showSnackbar(
        error.response?.data?.message || 'Có lỗi khi thay đổi trạng thái dịch vụ', 
        'error'
      );
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const getCategoryInfo = (categoryValue) => {
    if (!Array.isArray(categories)) return { label: categoryValue, icon: '📋', count: 0 };
    return categories.find(cat => cat.value === categoryValue) || 
           { label: categoryValue, icon: '📋', count: 0 };
  };

  const getUnitDisplay = (unit) => {
    const unitMap = {
      'per_person': 'người',
      'per_hour': 'giờ',
      'per_item': 'món',
      'per_service': 'lần',
      'per_kg': 'kg'
    };
    return unitMap[unit] || unit;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          🛎️ Quản lý Dịch vụ
        </Typography>
      </Box>

      {/* Category Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Array.isArray(categories) && categories.slice(0, 4).map((category) => (
          <Grid item xs={12} sm={6} md={3} key={category.value}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-2px)', 
                  boxShadow: 6 
                },
                bgcolor: filters.category === category.value ? 'primary.light' : 'background.paper'
              }}
              onClick={() => handleFilterChange('category', category.value)}
            >
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    mx: 'auto', 
                    mb: 1,
                    width: 48,
                    height: 48,
                    fontSize: '1.5rem'
                  }}
                >
                  {category.icon}
                </Avatar>
                <Typography variant="h6" component="div" fontSize="0.9rem">
                  {category.label}
                </Typography>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {category.count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters & Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm kiếm dịch vụ..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={filters.category}
                label="Danh mục"
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                {Array.isArray(categories) && categories.map(cat => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filters.isActive}
                label="Trạng thái"
                onChange={(e) => handleFilterChange('isActive', e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="true">Đang hoạt động</MenuItem>
                <MenuItem value="false">Tạm dừng</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sắp xếp</InputLabel>
              <Select
                value={filters.sortBy}
                label="Sắp xếp"
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <MenuItem value="name">Tên A-Z</MenuItem>
                <MenuItem value="price">Giá</MenuItem>
                <MenuItem value="category">Danh mục</MenuItem>
                <MenuItem value="createdAt">Ngày tạo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchServices}
              size="small"
            >
              Làm mới
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Services Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell>Dịch vụ</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell align="right">Giá</TableCell>
              <TableCell>Đơn vị</TableCell>
              <TableCell>Thời gian chuẩn bị</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(services) && services.length > 0 ? (
              services.map((service) => {
                const categoryInfo = getCategoryInfo(service.category);
                return (
                <TableRow key={service._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        {categoryInfo.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {service.name}
                        </Typography>
                        {service.description && (
                          <Typography variant="caption" color="text.secondary">
                            {service.description.length > 50 
                              ? `${service.description.substring(0, 50)}...` 
                              : service.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={categoryInfo.label}
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight="medium">
                      {formatPrice(service.price)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={getUnitDisplay(service.unit)} />
                  </TableCell>
                  <TableCell>
                    {service.preparationTime > 0 ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {service.preparationTime} phút
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Ngay lập tức
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={`Click để ${service.isActive ? 'tạm dừng' : 'kích hoạt'}`}>
                    <Chip
                      size="small"
                      label={service.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      color={service.isActive ? 'success' : 'default'}
                        onClick={() => handleToggleStatus(service)}
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: 2
                          }
                        }}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog('view', service)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog('edit', service)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(service._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    {loading ? '🔄 Đang tải dữ liệu...' : '📋 Chưa có dịch vụ nào'}
                  </Typography>
                  {!loading && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Hãy thêm dịch vụ đầu tiên để bắt đầu
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={totalServices}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}–${to} của ${count !== -1 ? count : `hơn ${to}`}`}
        />
      </TableContainer>

      {/* Service Dialog */}
      <Dialog 
        open={dialog.open} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          {dialog.mode === 'create' && <><AddIcon /> Thêm dịch vụ mới</>}
          {dialog.mode === 'edit' && <><EditIcon /> Chỉnh sửa dịch vụ</>}
          {dialog.mode === 'view' && <><ViewIcon /> Chi tiết dịch vụ</>}
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Basic Info */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon color="primary" />
                Thông tin cơ bản
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Tên dịch vụ"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={dialog.mode === 'view'}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={formData.category}
                  label="Danh mục"
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  disabled={dialog.mode === 'view'}
                >
                  {Array.isArray(categories) && categories.map(cat => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                disabled={dialog.mode === 'view'}
                multiline
                rows={3}
              />
            </Grid>

            {/* Pricing */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <MoneyIcon color="primary" />
                Thông tin giá
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Giá dịch vụ"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                disabled={dialog.mode === 'view'}
                required
                InputProps={{
                  endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Đơn vị tính</InputLabel>
                <Select
                  value={formData.unit}
                  label="Đơn vị tính"
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  disabled={dialog.mode === 'view'}
                >
                  <MenuItem value="per_person">Theo người</MenuItem>
                  <MenuItem value="per_hour">Theo giờ</MenuItem>
                  <MenuItem value="per_item">Theo món</MenuItem>
                  <MenuItem value="per_service">Theo lần</MenuItem>
                  <MenuItem value="per_kg">Theo kg</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Advanced Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <TimeIcon color="primary" />
                Cài đặt nâng cao
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Thời gian chuẩn bị (phút)"
                type="number"
                value={formData.preparationTime}
                onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: e.target.value }))}
                disabled={dialog.mode === 'view'}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Số lượng tối đa"
                type="number"
                value={formData.maxQuantity}
                onChange={(e) => setFormData(prev => ({ ...prev, maxQuantity: e.target.value }))}
                disabled={dialog.mode === 'view'}
                inputProps={{ min: 1 }}
                helperText="Để trống nếu không giới hạn"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    disabled={dialog.mode === 'view'}
                  />
                }
                label="Đang hoạt động"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Giờ bắt đầu phục vụ"
                type="time"
                value={formData.availableHours.start}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  availableHours: { ...prev.availableHours, start: e.target.value }
                }))}
                disabled={dialog.mode === 'view'}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Giờ kết thúc phục vụ"
                type="time"
                value={formData.availableHours.end}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  availableHours: { ...prev.availableHours, end: e.target.value }
                }))}
                disabled={dialog.mode === 'view'}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        {dialog.mode !== 'view' && (
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={handleCloseDialog}>
              Hủy
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)' }
              }}
            >
              {dialog.mode === 'create' ? 'Tạo dịch vụ' : 'Cập nhật'}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add service"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.3s ease',
        }}
        onClick={() => handleOpenDialog('create')}
      >
        <AddIcon />
      </Fab>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServicesManagement;
