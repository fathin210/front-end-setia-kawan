import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import moment from "moment";
import { useAddToQueueMutation } from "../../hooks/useMutateQueue";

const DialogQueue = ({ isOpen, onClose, patient }) => {
  const [selectedDate, setSelectedDate] = useState(
    moment(Date.now()).format("YYYY-MM-DD")
  );

  const handleAddToQueue = () => {
    if (!selectedDate) return;
    mutation.mutateAsync({
      ...patient,
      tanggal_pelaks: selectedDate,
    });
  };

  const mutation = useAddToQueueMutation({
    onComplete: onClose,
  });

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tambah ke Antrian</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body1">
            <strong>Nama:</strong> {patient?.nmpasien || "-"}
          </Typography>
          <Typography variant="body1">
            <strong>Nomor Pasien:</strong> {patient?.nomorpasien || "-"}
          </Typography>
          <Typography variant="body1">
            <strong>Alamat:</strong> {patient?.alamat || "-"}
          </Typography>
          <DesktopDatePicker
            sx={{ flex: 1 }}
            format="DD/MM/YYYY"
            label="Tanggal Antrian"
            value={selectedDate ? moment(selectedDate) : null}
            onChange={(value) => {
              if (value) {
                setSelectedDate(moment(value).format("YYYY-MM-DD"));
              }
            }}
            slotProps={{
              actionBar: {
                actions: ["today"],
              },
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="error">
          Tutup
        </Button>
        <Button
          onClick={handleAddToQueue}
          color="primary"
          variant="contained"
          disabled={mutation.isLoading}
        >
          {mutation.isLoading ? "Menambahkan..." : "Simpan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogQueue;
