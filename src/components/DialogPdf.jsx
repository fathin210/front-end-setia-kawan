import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import Pdf from "./Pdf";
import usePdfStore from "../store/pdfStore";

const DialogPdf = () => {
  const { isDialogOpen, pdfURL, title, closeDialog, loading, error } =
    usePdfStore();

  return (
    <Dialog open={isDialogOpen} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={closeDialog}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <Close />
      </IconButton>
      <DialogContent>
        {loading ? (
          <CircularProgress sx={{ m: "auto" }} />
        ) : error ? (
          <Typography>{error}</Typography>
        ) : (
          <Pdf pdfURL={pdfURL} title={title} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogPdf;
