import { createTheme } from '@mui/material/styles';

// Purple + Pink Luxury Color Palette
const luxuryColors = {
  // Primary: Purple (Sang trọng)
  purple: {
    50: '#f3e5f5',
    100: '#e1bee7',
    200: '#ce93d8',
    300: '#ba68c8',
    400: '#ab47bc',
    500: '#9c27b0', // Main Purple
    600: '#8e24aa',
    700: '#7b1fa2',
    800: '#6a1b9a',
    900: '#4a148c',
  },
  
  // Secondary: Pink Luxury
  pink: {
    50: '#fce4ec',
    100: '#f8bbd9',
    200: '#f48fb1',
    300: '#f06292',
    400: '#ec407a',
    500: '#e91e63', // Main Pink
    600: '#d81b60',
    700: '#c2185b',
    800: '#ad1457',
    900: '#880e4f',
  },
  
  // Accent: Deep Purple
  deepPurple: {
    50: '#ede7f6',
    100: '#d1c4e9',
    200: '#b39ddb',
    300: '#9575cd',
    400: '#7e57c2',
    500: '#673ab7', // Main Deep Purple
    600: '#5e35b1',
    700: '#512da8',
    800: '#4527a0',
    900: '#311b92',
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
  primary: 'linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)',
  secondary: 'linear-gradient(135deg, #e91e63 0%, #ff4081 100%)',
  luxury: 'linear-gradient(135deg, #673ab7 0%, #e91e63 50%, #ff4081 100%)',
  card: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
  darkCard: 'linear-gradient(145deg, #2c3e50 0%, #34495e 100%)',
};

// Create luxury theme
const luxuryTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: luxuryColors.purple[500],
      light: luxuryColors.purple[300],
      dark: luxuryColors.purple[700],
      contrastText: '#ffffff',
    },
    secondary: {
      main: luxuryColors.pink[500],
      light: luxuryColors.pink[300],
      dark: luxuryColors.pink[700],
      contrastText: '#ffffff',
    },
    accent: {
      main: luxuryColors.deepPurple[500],
      light: luxuryColors.deepPurple[300],
      dark: luxuryColors.deepPurple[700],
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
          borderColor: luxuryColors.purple[500],
          color: luxuryColors.purple[500],
          '&:hover': {
            borderColor: luxuryColors.purple[600],
            backgroundColor: luxuryColors.purple[50],
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
          backgroundColor: luxuryColors.purple[100],
          color: luxuryColors.purple[700],
        },
        colorSecondary: {
          backgroundColor: luxuryColors.pink[100],
          color: luxuryColors.pink[700],
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
                borderColor: luxuryColors.purple[400],
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: luxuryColors.purple[500],
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
