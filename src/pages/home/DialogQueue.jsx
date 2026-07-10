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
  Alert,
  alpha,
} from "@mui/material";
import { EventNote } from "@mui/icons-material";
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
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <EventNote color="primary" />
        Tambah ke Antrian
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            flexWrap="wrap"
            gap={3}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Nama
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {patient?.nmpasien || "-"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Nomor Pasien
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {patient?.nomorpasien || "-"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Alamat
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {patient?.alamat || "-"}
              </Typography>
            </Box>
          </Stack>
          <DesktopDatePicker
            sx={{ flex: 1 }}
            format="DD/MM/YYYY"
            label="Tanggal Antrian"
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
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Riwayat Rincian Pelayanan
            </Typography>
            <HistoryPatient listQueue={listQueue} />
          </Box>

          {/* STATE LOADING */}
          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {/* STATE ERROR */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Terjadi kesalahan saat mengambil data: {error.message}
            </Alert>
          )}

          {/* TABLE RINCIAN */}
          {!isLoading && !error && rincianData?.length > 0 ? (
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              <Table>
                <TableHead sx={{ bgcolor: "primary.main" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", color: "primary.contrastText" }}>
                      Tanggal Transaksi
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "primary.contrastText" }}>
                      Invoice
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "primary.contrastText" }}>
                      Nama Pasien
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "primary.contrastText" }}>
                      Tindakan
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "primary.contrastText" }}>
                      Teknisi
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "primary.contrastText" }}>
                      Total Biaya
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "primary.contrastText" }}>
                      Keterangan
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rincianData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {row?.tanggal_pelaks
                          ? moment(row?.tanggal_pelaks).format("DD-MM-YYYY")
                          : ""}
                      </TableCell>
                      <TableCell>#SK{row.nopendaftaran}#</TableCell>
                      <TableCell>{row.nmpasien}</TableCell>
                      <TableCell>{row?.nama_tindakan || "-"}</TableCell>
                      <TableCell>{row?.nama_karyawan || "-"}</TableCell>
                      <TableCell>{formatCurrency(row.total_biaya)}</TableCell>
                      <TableCell>{row?.ket || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            !isLoading &&
            !error && (
              <Typography sx={{ textAlign: "center", color: "text.secondary", mt: 3 }}>
                Tidak ada data rincian pelayanan.
              </Typography>
            )
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
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
