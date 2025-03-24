import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/home/Home";
import { ThemeProvider } from "@mui/material";
import { useThemeStore } from "./hooks/useThemeStore";
import { darkTheme, lightTheme } from "./theme";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

const App = () => {
  const { darkMode } = useThemeStore();

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            <Route path="/" element={<Layout>Test</Layout>}>
              <Route index element={<Home />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </LocalizationProvider>
  );
};

export default App;
