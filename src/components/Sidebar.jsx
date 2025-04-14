import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  styled,
  Collapse,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { routes } from "../routes.jsx";

const drawerWidth = 220;
const collapsedWidth = 72;

const DrawerStyled = styled(Drawer)(({ theme, open }) => ({
  width: open ? drawerWidth : collapsedWidth,
  height: "100vh",
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  backgroundColor: theme.palette.background.default,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  "& .MuiDrawer-paper": {
    width: open ? drawerWidth : collapsedWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    borderRight: `1px solid ${theme.palette.divider}`,
    boxShadow: "4px 0 10px rgba(0,0,0,0.05)",
  },
}));

const Sidebar = ({ open, hover, setHover }) => {
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState({});

  useEffect(() => {
    const activeSubmenus = {};
    routes.forEach((route) => {
      if (route.children) {
        const isActive = route.children.some(
          (child) => child.path === location.pathname
        );
        if (isActive) activeSubmenus[route.text] = true;
      }
    });
    setOpenSubmenus(activeSubmenus);
  }, [location.pathname]);

  const handleToggle = (text) => {
    setOpenSubmenus((prev) => ({ ...prev, [text]: !prev[text] }));
  };

  return (
    <DrawerStyled
      variant="permanent"
      open={open || hover}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Toolbar />
      <Divider />
      <List>
        {routes.map((route) => {
          const isActive = location.pathname === route.path;
          return (
            <React.Fragment key={route.text}>
              <ListItem disablePadding sx={{ display: "block", px: 1 }}>
                <ListItemButton
                  component={route.children ? "button" : Link}
                  to={route.children ? undefined : route.path}
                  onClick={() => route.children && handleToggle(route.text)}
                  sx={{
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                    borderRadius: 2,
                    backgroundColor: isActive
                      ? "rgba(33, 150, 243, 0.1)"
                      : "transparent",
                    color: isActive ? "primary.main" : "inherit",
                    transition: "all 0.3s",
                    width: "100%",
                    "&:hover": { backgroundColor: "rgba(33, 150, 243, 0.2)" },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : "auto",
                      justifyContent: "center",
                      color: isActive ? "primary.main" : "gray",
                      transition: "all 0.3s",
                    }}
                  >
                    {route.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={route.text}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                  {route.children &&
                    (openSubmenus[route.text] ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    ))}
                </ListItemButton>
              </ListItem>

              {route.children && (
                <Collapse
                  in={openSubmenus[route.text]}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {route.children.map((child) => {
                      const isChildActive = location.pathname === child.path;
                      return (
                        <ListItem
                          key={child.text}
                          disablePadding
                          sx={{ px: 1, width: "100%" }}
                        >
                          <ListItemButton
                            component={Link}
                            to={child.path}
                            sx={{
                              pl: 3,
                              borderRadius: 2,
                              backgroundColor: isChildActive
                                ? "rgba(33, 150, 243, 0.15)"
                                : "transparent",
                              color: isChildActive ? "primary.main" : "inherit",
                              transition: "all 0.3s",
                              "&:hover": {
                                backgroundColor: "rgba(33, 150, 243, 0.25)",
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 0,
                                mr: open ? 2 : "auto",
                                justifyContent: "center",
                                color: isChildActive ? "primary.main" : "gray",
                                transition: "all 0.3s",
                              }}
                            >
                              {child.icon}
                            </ListItemIcon>
                            {(open || hover) && (
                              <ListItemText
                                primary={child.text}
                                sx={{ opacity: open ? 1 : 0, textWrap: "wrap" }}
                              />
                            )}
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>
    </DrawerStyled>
  );
};

export default Sidebar;
