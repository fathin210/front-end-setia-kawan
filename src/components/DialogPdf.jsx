import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Close, Download, PictureAsPdf } from "@mui/icons-material";
import Pdf from "./Pdf";
import usePdfStore from "../store/pdfStore";

const DialogPdf = () => {
  const { isDialogOpen, pdfURL, title, closeDialog, loading, error } =
    usePdfStore();

  return (
    <Dialog open={isDialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <PictureAsPdf color="primary" />
        {title}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={closeDialog}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: "text.secondary",
        }}
      >
        <Close />
      </IconButton>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ display: "flex", alignItems: "center", minHeight: "70vh" }}>
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>
          </Box>
        ) : (
          <Pdf pdfURL={pdfURL} title={title} />
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={closeDialog} variant="outlined" color="inherit">
          Tutup
        </Button>
        <Button
          component="a"
          href={pdfURL || undefined}
          download={`${title || "dokumen"}.pdf`}
          disabled={!pdfURL || loading || Boolean(error)}
          variant="contained"
          startIcon={<Download />}
        >
          Unduh
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogPdf;
