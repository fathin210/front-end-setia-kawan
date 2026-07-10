import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  CssBaseline,
  Avatar,
  Divider,
  ButtonBase,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import {
  Logout,
  Menu as MenuIcon,
  DarkMode,
  LightMode,
} from "@mui/icons-material";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useThemeStore } from "../store/themeStore";
import GlobalSnackbar from "./GlobalSnackbar";
import { useAuthStore } from "../store/useAuthStore";
import GlobalAlertDialog from "./GlobalAlertDialog";
import DialogPdf from "./DialogPdf";
import { routes } from "../routes.jsx";
import { getInitials } from "../utils/common";

const flattenRoutes = (list) =>
  list.flatMap((route) => (route.children ? flattenRoutes(route.children) : [route]));

const getPageTitle = (pathname) => {
  const match = flattenRoutes(routes).find((route) => route.path === pathname);
  return match?.text ?? "Setia Kawan";
};

const Layout = () => {
  const { darkMode, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();

  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [hover, setHover] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);

  useEffect(() => {
    // Unexpand sidebar otomatis pada halaman tertentu
    const unexpandedPages = [
      "/",
      "/login",
      "/settings",
      "/employee/comissions",
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
        elevation={0}
        color="transparent"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
            >
              <MenuIcon />
            </IconButton>
            <Divider orientation="vertical" flexItem sx={{ my: 1.5 }} />
            <Typography variant="h6" fontWeight={600} noWrap>
              {getPageTitle(location.pathname)}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <ButtonBase
              onClick={(e) => setProfileAnchor(e.currentTarget)}
              sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 0.5, borderRadius: 2 }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "primary.main",
                  fontSize: 14,
                }}
              >
                {getInitials(user?.nama_lengkap)}
              </Avatar>
              <Typography noWrap>{user?.nama_lengkap}</Typography>
            </ButtonBase>
            <Menu
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={() => setProfileAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem
                onClick={() => {
                  toggleTheme();
                  setProfileAnchor(null);
                }}
              >
                <ListItemIcon>
                  {darkMode ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                </ListItemIcon>
                {darkMode ? "Mode Terang" : "Mode Gelap"}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setProfileAnchor(null);
                  logout();
                }}
              >
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
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
