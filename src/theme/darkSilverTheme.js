import { createTheme } from '@mui/material/styles';

// Dark + Silver Luxury Color Palette
const luxuryColors = {
  // Primary: Dark Charcoal
  dark: {
    50: '#f5f5f5',
    100: '#eeeeee',
    200: '#e0e0e0',
    300: '#bdbdbd',
    400: '#9e9e9e',
    500: '#424242', // Main Dark
    600: '#303030',
    700: '#212121',
    800: '#1a1a1a',
    900: '#0d0d0d',
  },
  
  // Secondary: Silver Luxury
  silver: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e', // Main Silver
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Accent: Platinum
  platinum: {
    50: '#f8f9fa',
    100: '#e9ecef',
    200: '#dee2e6',
    300: '#ced4da',
    400: '#adb5bd',
    500: '#6c757d', // Main Platinum
    600: '#495057',
    700: '#343a40',
    800: '#212529',
    900: '#0d1117',
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

// Custom gradients
const gradients = {
  primary: 'linear-gradient(135deg, #424242 0%, #9e9e9e 100%)',
  secondary: 'linear-gradient(135deg, #9e9e9e 0%, #e0e0e0 100%)',
  luxury: 'linear-gradient(135deg, #212121 0%, #9e9e9e 50%, #e0e0e0 100%)',
  card: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
  darkCard: 'linear-gradient(145deg, #2c2c2c 0%, #424242 100%)',
};

// Create luxury theme
const luxuryTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: luxuryColors.dark[500],
      light: luxuryColors.dark[300],
      dark: luxuryColors.dark[700],
      contrastText: '#ffffff',
    },
    secondary: {
      main: luxuryColors.silver[500],
      light: luxuryColors.silver[300],
      dark: luxuryColors.silver[700],
      contrastText: '#000000',
    },
    accent: {
      main: luxuryColors.platinum[500],
      light: luxuryColors.platinum[300],
      dark: luxuryColors.platinum[700],
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fa',
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
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
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
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
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
          borderColor: luxuryColors.dark[500],
          color: luxuryColors.dark[500],
          '&:hover': {
            borderColor: luxuryColors.dark[600],
            backgroundColor: luxuryColors.dark[50],
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
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
        elevation2: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
        },
        elevation3: {
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
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
          backgroundColor: luxuryColors.dark[100],
          color: luxuryColors.dark[700],
        },
        colorSecondary: {
          backgroundColor: luxuryColors.silver[100],
          color: luxuryColors.silver[700],
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
                borderColor: luxuryColors.dark[400],
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: luxuryColors.dark[500],
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
