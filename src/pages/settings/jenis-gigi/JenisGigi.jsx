import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Typography,
  CircularProgress,
  Stack,
  alpha,
} from "@mui/material";
import { Add, Category, DeleteOutline, Edit, WarningAmber } from "@mui/icons-material";
import { useFetchJenisGigi } from "../../../hooks/useFetchJenisGigi";
import {
  useCreateJenisGigi,
  useDeleteJenisGigi,
  useUpdateJenisGigi,
} from "../../../hooks/useMutateJenisGigi";
import { formatCurrency, safeArray } from "../../../utils/common";

const defaultForm = {
  tarif: "",
  komisi: "",
};

const JenisGigi = () => {
  const { data: jenisGigi, isLoading, error: errorFetching } = useFetchJenisGigi();

  const createMutation = useCreateJenisGigi();
  const updateMutation = useUpdateJenisGigi();
  const deleteMutation = useDeleteJenisGigi();
  const isSaving = createMutation.isLoading || updateMutation.isLoading;

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleOpen = (row) => {
    setForm(row || defaultForm);
    setEditing(!!row);
    setError("");
    setOpen(true);
  };

  const handleClose = () => {
    setForm(defaultForm);
    setEditing(false);
    setOpen(false);
  };

  const handleTarifChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, tarif: rawValue ? Number(rawValue) : "" }));
  };

  const handleKomisiChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, komisi: rawValue ? Number(rawValue) : "" }));
  };

  const handleSubmit = async () => {
    if (!form.tarif) {
      setError("Tarif wajib diisi.");
      return;
    }

    try {
      const mutation = editing ? updateMutation : createMutation;
      await mutation.mutateAsync(form);
      handleClose();
    } catch {
      setError("Gagal menyimpan data.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      setDeleteTarget(null);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" fontWeight={600}>
          Jenis Gigi
        </Typography>
        <Button
          onClick={() => handleOpen(null)}
          startIcon={<Add />}
          variant="contained"
        >
          Tambah
        </Button>
      </Stack>

      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={3}>
          <CircularProgress />
        </Box>
      ) : errorFetching ? (
        <Alert severity="error">
          Terjadi kesalahan saat mengambil data: {errorFetching.message}
        </Alert>
      ) : safeArray(jenisGigi).length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          Belum ada data jenis gigi.
        </Typography>
      ) : (
        <TableContainer sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                }}
              >
                <TableCell sx={{ fontWeight: 600 }}>No</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Tarif</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Komisi</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {safeArray(jenisGigi).map((row, index) => (
                <TableRow key={row.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell align="right">{formatCurrency(row.tarif)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.komisi)}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleOpen(row)} color="primary">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => setDeleteTarget(row)} color="error">
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog Form */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Category color="primary" />
          {editing ? "Edit Jenis Gigi" : "Tambah Jenis Gigi"}
        </DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            fullWidth
            required
            label="Tarif"
            placeholder="Masukkan tarif"
            value={form?.tarif ? formatCurrency(form.tarif) : ""}
            onChange={handleTarifChange}
          />
          <TextField
            fullWidth
            label="Komisi"
            placeholder="Masukkan besar komisi"
            value={form?.komisi ? formatCurrency(form.komisi) : ""}
            onChange={handleKomisiChange}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} variant="outlined" color="inherit">
            Tutup
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Konfirmasi Hapus */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmber color="error" />
          Hapus jenis gigi dengan tarif {deleteTarget?.tarif ? formatCurrency(deleteTarget.tarif) : "-"}?
        </DialogTitle>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" color="inherit" onClick={() => setDeleteTarget(null)}>
            Tutup
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? "Menghapus..." : "Ya, Hapus"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default JenisGigi;
