import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Autocomplete,
  TextField,
  IconButton,
  Divider,
  Box,
  Grid,
} from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import moment from "moment";
import { useAddToQueueMutation } from "../../hooks/useMutateQueue";
import useListQueue from "../../hooks/useListQueue";
import { safeArray } from "../../utils/common";
import { useFetchKaryawan } from "../../hooks/useFetchKaryawan";
import { Close } from "@mui/icons-material";
import HistoryPatient from "../patient/detail-patient/HistoryPatient";

const DialogQueue = ({ isOpen, onClose, patient }) => {
  const listQueue = useListQueue("", patient?.nomorpasien, "all");
  const { data: masterKaryawan } = useFetchKaryawan();
  const [draft, setDraft] = useState({
    tanggal_pelaks: moment(Date.now()).format("YYYY-MM-DD"),
    idkaryawan: null,
  });

  const handleAddToQueue = () => {
    if (!draft?.tanggal_pelaks) return;
    mutation.mutateAsync({
      ...patient,
      ...draft,
    });
  };

  const mutation = useAddToQueueMutation(onClose);

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Tambah ke Antrian</DialogTitle>
      <IconButton
        aria-label="close"
        color="error"
        onClick={onClose}
        sx={(_) => ({
          position: "absolute",
          right: 8,
          top: 8,
        })}
      >
        <Close color="error" />
      </IconButton>
      <DialogContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Detail Pasien
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Nama
                </Typography>
                <Typography variant="body1">
                  {patient?.nmpasien || "-"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Nomor Pasien
                </Typography>
                <Typography variant="body1">
                  {patient?.nomorpasien || "-"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  Alamat
                </Typography>
                <Typography variant="body1">
                  {patient?.alamat || "-"}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" gutterBottom>
                  Tanggal Antrian
                </Typography>
                <DesktopDatePicker
                  sx={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  value={draft?.tanggal_pelaks ? moment(draft?.tanggal_pelaks) : null}
                  onChange={(value) => {
                    if (value) {
                      setDraft({
                        ...draft,
                        tanggal_pelaks: moment(value).format("YYYY-MM-DD"),
                      });
                    }
                  }}
                  slotProps={{
                    actionBar: {
                      actions: ["today"],
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" gutterBottom>
                  Teknisi
                </Typography>
                <Autocomplete
                  options={safeArray(masterKaryawan)}
                  getOptionLabel={(option) => option?.nmkaryawan || ""}
                  value={
                    safeArray(masterKaryawan).find(
                      (emp) => emp.idkaryawan === draft?.idkaryawan
                    ) || null
                  }
                  onChange={(_, newValue) =>
                    setDraft((prev) => ({
                      ...prev,
                      idkaryawan: newValue?.idkaryawan,
                    }))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Nama Teknisi" fullWidth />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" gutterBottom>
              Riwayat Antrian
            </Typography>
            <HistoryPatient listQueue={listQueue} />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
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
