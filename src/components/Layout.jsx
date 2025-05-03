import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  CssBaseline,
} from "@mui/material";
import { Logout, Menu as MenuIcon } from "@mui/icons-material";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useThemeStore } from "../store/themeStore";
import GlobalSnackbar from "./GlobalSnackbar";
import { useAuthStore } from "../store/useAuthStore";
import GlobalAlertDialog from "./GlobalAlertDialog";
import DialogPdf from "./DialogPdf";

const Layout = () => {
  const { darkMode, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();

  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    // Unexpand sidebar otomatis pada halaman tertentu
    const unexpandedPages = [
      "/",
      "/login",
      "/settings",
      "/employee/comissions",
      "/employee/admin",
      "/patient/deposit"
    ];
    if (unexpandedPages.includes(location.pathname)) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [location.pathname]);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Setia Kawan
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={6}>
            <Typography>{user?.nama_lengkap}</Typography>
            <IconButton onClick={logout}>
              <Logout />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Sidebar open={hover || open} setHover={setHover} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: "margin 0.3s",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
      <GlobalSnackbar />
      <GlobalAlertDialog />
      <DialogPdf />
    </Box>
  );
};

export default Layout;
