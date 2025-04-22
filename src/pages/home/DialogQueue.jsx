import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  CircularProgress,
  Box,
  Divider,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Autocomplete,
  TextField,
} from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import moment from "moment";
import { useAddToQueueMutation } from "../../hooks/useMutateQueue";
import useListQueue from "../../hooks/useListQueue";
import { formatCurrency, safeArray } from "../../utils/common";
import { useFetchKaryawan } from "../../hooks/useFetchKaryawan";

const DialogQueue = ({ isOpen, onClose, patient }) => {
  const {
    data: rincianData,
    error,
    isLoading,
  } = useListQueue("", patient?.nomorpasien);
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
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Riwayat Rincian Pelayanan
            </Typography>
            <Divider sx={{ my: 2 }} />
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
              sx={{ borderRadius: 2, boxShadow: 3 }}
            >
              <Table>
                <TableHead sx={{ background: "#1976d2" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                      Tanggal Transaksi
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                      Invoice
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                      Nama Pasien
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                      Tindakan
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                      Teknisi
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                      Total Biaya
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
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
              <Typography sx={{ textAlign: "center", color: "gray", mt: 3 }}>
                Tidak ada data rincian pelayanan.
              </Typography>
            )
          )}
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
