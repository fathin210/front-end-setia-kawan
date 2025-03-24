import React from "react";
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
} from "@mui/material";
import {
  Home as HomeIcon,
  Info as InfoIcon,
  ContactMail as ContactMailIcon,
} from "@mui/icons-material";

const drawerWidth = 200;
const collapsedWidth = 60;

const DrawerStyled = styled(Drawer)(({ theme, open }) => ({
  width: open ? drawerWidth : collapsedWidth,
  height: "100vh",
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
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
  },
}));

const menuItems = [
  { text: "Home", icon: <HomeIcon /> },
  { text: "About", icon: <InfoIcon /> },
  { text: "Contact", icon: <ContactMailIcon /> },
];

const Sidebar = ({ open }) => {
  return (
    <DrawerStyled variant="permanent" open={open}>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            disablePadding
            sx={{ display: "block", px: 1 }}
          >
            <ListItemButton
              sx={{
                justifyContent: open ? "initial" : "center",
                px: 2.5,
                borderRadius: 2,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : "auto",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{ opacity: open ? 1 : 0 }}
                slotProps={{
                  primary: {
                    fontSize: 14
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </DrawerStyled>
  );
};

export default Sidebar;
