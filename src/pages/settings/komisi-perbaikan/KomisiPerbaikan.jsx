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
  Autocomplete,
  alpha,
} from "@mui/material";
import { Add, Edit, Handyman } from "@mui/icons-material";
import {
  useCreateTarifTindakan,
  useUpdateTarifTindakan,
} from "../../../hooks/useMutateTarifTindakan";
import { useFetchTarifTindakan } from "../../../hooks/useFetchTarifTindakan";
import { useFetchMasterAction } from "../../../hooks/useFetchMasterAction";
import { formatCurrency, safeArray } from "../../../utils/common";

const KODE_PERBAIKAN = "03";

const defaultForm = {
  komisi: null,
  kdtindakan: null,
  nmtindakan: null,
};

const KomisiPerbaikan = () => {
  const {
    data: tarifTindakan,
    isLoading,
    error: errorFetching,
  } = useFetchTarifTindakan();
  const { data: masterAction } = useFetchMasterAction();

  const updateMutation = useUpdateTarifTindakan();
  const createMutation = useCreateTarifTindakan();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  const rows = safeArray(tarifTindakan).filter(
    (item) => item.kdtindakan === KODE_PERBAIKAN
  );
  const usedCodes = safeArray(tarifTindakan).map((item) => item.kdtindakan);
  const availableActions = safeArray(masterAction).filter(
    (item) => item.kdtindakan === KODE_PERBAIKAN && !usedCodes.includes(item.kdtindakan)
  );

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

  const handleKomisiChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, komisi: rawValue ? Number(rawValue) : "" }));
  };

  const handleSubmit = async () => {
    if (!editing && !form.kdtindakan) {
      setError("Pilih tindakan terlebih dahulu.");
      return;
    } else if (!form.komisi) {
      setError("Komisi wajib diisi.");
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

  const isSaving = updateMutation.isLoading || createMutation.isLoading;

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          Komisi Perbaikan
        </Typography>
        <Button
          onClick={() => handleOpen(null)}
          startIcon={<Add />}
          variant="contained"
          disabled={rows.length > 0}
        >
          Tambah Komisi Perbaikan
        </Button>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={3}>
          <CircularProgress />
        </Box>
      ) : errorFetching ? (
        <Alert severity="error">
          Terjadi kesalahan saat mengambil data: {errorFetching.message}
        </Alert>
      ) : rows.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          Belum ada data komisi perbaikan.
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
                <TableCell sx={{ fontWeight: 600 }}>Nama Tindakan</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Komisi</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={row.kdtindakan} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.nmtindakan}</TableCell>
                  <TableCell align="right">{formatCurrency(row.komisi)}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleOpen(row)} color="primary">
                      <Edit fontSize="small" />
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
          <Handyman color="primary" />
          {editing ? "Edit Komisi Perbaikan" : "Tambah Komisi Perbaikan"}
        </DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {editing ? (
            <Typography variant="body1">
              <strong>Tindakan:</strong> {form?.nmtindakan || "-"}
            </Typography>
          ) : (
            <Autocomplete
              options={availableActions}
              getOptionLabel={(option) => option?.nmtindakan || ""}
              value={
                availableActions.find(
                  (item) => item.kdtindakan === form?.kdtindakan
                ) || null
              }
              onChange={(_, newValue) =>
                setForm((prev) => ({
                  ...prev,
                  kdtindakan: newValue?.kdtindakan || "",
                  nmtindakan: newValue?.nmtindakan || "",
                }))
              }
              renderInput={(params) => (
                <TextField {...params} label="Pilih Tindakan" fullWidth />
              )}
            />
          )}
          <TextField
            autoComplete="off"
            fullWidth
            name="komisi"
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
    </Paper>
  );
};

export default KomisiPerbaikan;
