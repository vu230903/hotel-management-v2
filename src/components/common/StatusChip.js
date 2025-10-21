import React from 'react';
import { Chip, Box } from '@mui/material';

const StatusChip = ({ 
  status, 
  variant = 'filled', 
  size = 'small',
  showIcon = true,
  className = ''
}) => {
  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase();
    
    switch (statusLower) {
      case 'active':
      case 'confirmed':
      case 'available':
      case 'completed':
        return {
          label: status,
          color: 'success',
          backgroundColor: '#e8f5e8',
          textColor: '#2e7d32',
        };
      
      case 'inactive':
      case 'cancelled':
      case 'unavailable':
        return {
          label: status,
          color: 'error',
          backgroundColor: '#ffebee',
          textColor: '#c62828',
        };
      
      case 'pending':
      case 'waiting':
      case 'processing':
        return {
          label: status,
          color: 'warning',
          backgroundColor: '#fff3e0',
          textColor: '#ef6c00',
        };
      
      case 'reserved':
      case 'booked':
        return {
          label: status,
          color: 'info',
          backgroundColor: '#e3f2fd',
          textColor: '#1976d2',
        };
      
      case 'maintenance':
      case 'cleaning':
        return {
          label: status,
          color: 'secondary',
          backgroundColor: '#f3e5f5',
          textColor: '#7b1fa2',
        };
      
      default:
        return {
          label: status || 'Unknown',
          color: 'default',
          backgroundColor: '#f5f5f5',
          textColor: '#616161',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      label={config.label}
      size={size}
      variant={variant}
      className={`status-chip ${className}`}
      sx={{
        backgroundColor: config.backgroundColor,
        color: config.textColor,
        fontWeight: 600,
        fontSize: '0.75rem',
        textTransform: 'capitalize',
        borderRadius: '20px',
        '& .MuiChip-label': {
          padding: '4px 8px',
        },
        ...(variant === 'outlined' && {
          borderColor: config.textColor,
          backgroundColor: 'transparent',
        }),
      }}
    />
  );
};

export default StatusChip;
