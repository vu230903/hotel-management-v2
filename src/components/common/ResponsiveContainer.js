import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';

const ResponsiveContainer = ({ 
  children, 
  maxWidth = 'xl', 
  padding = true,
  className = '',
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const getMaxWidth = () => {
    switch (maxWidth) {
      case 'xs': return '100%';
      case 'sm': return '600px';
      case 'md': return '900px';
      case 'lg': return '1200px';
      case 'xl': return '1536px';
      default: return '1536px';
    }
  };

  const getPadding = () => {
    if (!padding) return 0;
    if (isMobile) return '16px';
    if (isTablet) return '24px';
    return '32px';
  };

  return (
    <Box
      className={`responsive-container ${className}`}
      sx={{
        maxWidth: getMaxWidth(),
        margin: '0 auto',
        padding: getPadding(),
        width: '100%',
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default ResponsiveContainer;
