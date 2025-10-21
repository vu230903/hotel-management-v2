import { createTheme } from '@mui/material/styles';

// Soft Luxury Color Palette (Nhẹ nhàng hơn)
const luxuryColors = {
  // Primary: Soft Blue (Nhẹ nhàng)
  navy: {
    50: '#f0f4ff',
    100: '#e1eaff',
    200: '#c3d4ff',
    300: '#a4beff',
    400: '#85a8ff',
    500: '#6692ff', // Main Soft Blue (nhạt hơn)
    600: '#5282e6',
    700: '#3e72cc',
    800: '#2a62b3',
    900: '#165299',
  },
  
  // Secondary: Soft Gold (Nhẹ nhàng hơn)
  gold: {
    50: '#fefdf8',
    100: '#fefbf0',
    200: '#fef7e0',
    300: '#fdefc7',
    400: '#fce7ae',
    500: '#f0d695', // Main Soft Gold (nhạt hơn)
    600: '#e6c77a',
    700: '#d4b85f',
    800: '#c2a944',
    900: '#b09a29',
  },
  
  // Accent: Soft Teal (Nhẹ nhàng hơn)
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6', // Main Soft Teal (nhạt hơn)
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
  
  // Neutral colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  }
};

// Soft Custom gradients (Nhẹ nhàng hơn)
const gradients = {
  primary: 'linear-gradient(135deg, #6692ff 0%, #14b8a6 100%)',
  secondary: 'linear-gradient(135deg, #f0d695 0%, #e6c77a 100%)',
  luxury: 'linear-gradient(135deg, #6692ff 0%, #14b8a6 50%, #f0d695 100%)',
  card: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
  darkCard: 'linear-gradient(145deg, #4a5568 0%, #5a6b7d 100%)',
};

// Create luxury theme
const luxuryTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: luxuryColors.navy[500],
      light: luxuryColors.navy[300],
      dark: luxuryColors.navy[700],
      contrastText: '#ffffff',
    },
    secondary: {
      main: luxuryColors.gold[500],
      light: luxuryColors.gold[300],
      dark: luxuryColors.gold[700],
      contrastText: '#000000',
    },
    accent: {
      main: luxuryColors.teal[500],
      light: luxuryColors.teal[300],
      dark: luxuryColors.teal[700],
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafbfc', // Nhạt hơn một chút
      paper: '#ffffff',
    },
    text: {
      primary: luxuryColors.neutral[800],
      secondary: luxuryColors.neutral[600],
    },
    // Custom colors
    luxury: luxuryColors,
    gradients: gradients,
  },
  
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      '@media (max-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1.125rem',
      },
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1rem',
      },
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '0.875rem',
      },
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      '@media (max-width:600px)': {
        fontSize: '0.875rem',
      },
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      '@media (max-width:600px)': {
        fontSize: '0.75rem',
      },
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
      '@media (max-width:600px)': {
        fontSize: '0.75rem',
        padding: '8px 16px',
      },
    },
  },
  
  shape: {
    borderRadius: 12,
  },
  
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '@media (max-width:600px)': {
            padding: '8px 16px',
            fontSize: '0.75rem',
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            '@media (max-width:600px)': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
            },
          },
        },
        contained: {
          background: gradients.primary,
          color: '#ffffff',
          '&:hover': {
            background: gradients.primary,
            opacity: 0.9,
          },
        },
        outlined: {
          borderColor: luxuryColors.navy[500],
          color: luxuryColors.navy[500],
          '&:hover': {
            borderColor: luxuryColors.navy[600],
            backgroundColor: luxuryColors.navy[50],
          },
        },
      },
    },
    
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '@media (max-width:600px)': {
            borderRadius: 12,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
          },
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
            '@media (max-width:600px)': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
            },
          },
        },
      },
    },
    
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          '@media (max-width:600px)': {
            borderRadius: 12,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
          },
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          '@media (max-width:600px)': {
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        elevation2: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
          '@media (max-width:600px)': {
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.12)',
          },
        },
        elevation3: {
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
          '@media (max-width:600px)': {
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: luxuryColors.navy[100],
          color: luxuryColors.navy[700],
        },
        colorSecondary: {
          backgroundColor: luxuryColors.gold[100],
          color: luxuryColors.gold[700],
        },
      },
    },
    
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.3s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: luxuryColors.navy[400],
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: luxuryColors.navy[500],
                borderWidth: 2,
              },
            },
          },
        },
      },
    },
    
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
          '@media (max-width:600px)': {
            borderRadius: 16,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            margin: '16px',
            maxHeight: 'calc(100vh - 32px)',
          },
        },
      },
    },
    
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: gradients.primary,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default luxuryTheme;
