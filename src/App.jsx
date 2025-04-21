// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { ThemeProvider } from "@mui/material";
import { useThemeStore } from "./store/themeStore";
import { darkTheme, lightTheme } from "./theme";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { routes } from "./routes";
import ProtectedRoute from "./components/ProtectedRoute";
import ROUTES from "./constants/routes";
import Login from "./pages/login/Login";

const App = () => {
  const { darkMode } = useThemeStore();
  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <ThemeProvider theme={theme}>
        <Router basename="/admin-setiakawan">
          <Routes>
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path="/" element={<Layout />}>
              {routes.map((route, index) =>
                route.children ? (
                  route.children.map((child, childIndex) => (
                    <Route
                      key={childIndex}
                      path={child.path}
                      element={
                        child.roles && child.roles.length > 0 ? (
                          <ProtectedRoute allowedRoles={child.roles}>
                            {child.element}
                          </ProtectedRoute>
                        ) : (
                          child.element
                        )
                      }
                    />
                  ))
                ) : (
                  <Route
                    key={index}
                    path={route.path}
                    element={
                      route.roles && route.roles.length > 0 ? (
                        <ProtectedRoute allowedRoles={route.roles}>
                          {route.element}
                        </ProtectedRoute>
                      ) : (
                        route.element
                      )
                    }
                  />
                )
              )}
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </LocalizationProvider>
  );
};

export default App;
