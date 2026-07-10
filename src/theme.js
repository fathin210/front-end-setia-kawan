import { createTheme as createMuiTheme } from "@mui/material/styles";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

export const lightTheme = createMuiTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0d9488', // teal - klinik, bersih, menenangkan
    },
    secondary: {
      main: '#ea580c', // deep orange - complementary ke teal, beda hue dari warning/error
    },
    success: {
      main: '#16a34a',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#dc2626',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: "16px"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none"
        }
      }
    }
  },
})

export const darkTheme = createMuiTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2dd4bf', // teal lebih terang biar tetap kontras di background gelap
    },
    secondary: {
      main: '#fb923c',
    },
    success: {
      main: '#22c55e',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#ef4444',
    },
    background: {
      default: '#0c1716', // dark slate dengan undertone teal
      paper: '#132523',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: "16px"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none"
        }
      }
    }
  }
})