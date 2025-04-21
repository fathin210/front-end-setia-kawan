import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import useAlertStore from "../store/alertStore";

const GlobalAlertDialog = ({ showClose = true }) => {
  const { open, message, severity, closeAlert } = useAlertStore();

  const renderIcon = () => {
    switch (severity) {
      case "success":
        return <CheckCircleOutlineIcon color="success" sx={{ fontSize: 48 }} />;
      case "error":
        return <ErrorOutlineIcon color="error" sx={{ fontSize: 48 }} />;
      case "waiting":
        return <CircularProgress color="primary" />;
      default:
        return null;
    }
  };

  const renderTitle = () => {
    switch (severity) {
      case "success":
        return "Success";
      case "error":
        return "Error";
      case "waiting":
        return "Please Wait";
      default:
        return "";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={severity === "waiting" ? undefined : closeAlert}
      disableEscapeKeyDown
      sx={{zIndex: 9999}}
    >
      <DialogTitle>{renderTitle()}</DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          textAlign: "center",
          minWidth: 300,
        }}
      >
        {renderIcon()}
        <Typography>{message}</Typography>
      </DialogContent>
      {showClose && severity !== "waiting" && (
        <DialogActions>
          <Button onClick={closeAlert} variant="contained" color="primary">
            OK
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default GlobalAlertDialog;
