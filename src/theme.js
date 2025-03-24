import { createTheme as createMuiTheme } from "@mui/material/styles";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

export const lightTheme = createMuiTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#155dfc',
    },
    secondary: {
      main: '#f50057',
    },
    success: {
      main: '#00a63e',
    },
    warning: {
      main: '#f0b100',
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
      main: '#155dfc',
    },
    secondary: {
      main: '#f50057',
    },
    success: {
      main: '#00a63e',
    },
    warning: {
      main: '#f0b100',
    },
    background: {
      default: '#111828',
      paper: '#181F2E',
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