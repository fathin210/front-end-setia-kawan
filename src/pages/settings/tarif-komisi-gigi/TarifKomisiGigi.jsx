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
  Grid,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useUpdateTarifTindakan } from "../../../hooks/useMutateTarifTindakan";
import { useFetchTarifTindakan } from "../../../hooks/useFetchTarifTindakan";
import { formatCurrency, safeArray } from "../../../utils/common";

const defaultForm = {
  idkaryawan: "",
  tarif: "",
  komisi: "",
  kdtindakan: "",
};

const TarifKomisiGigi = () => {
  const {
    data: tarifTindakan,
    isLoading,
    error: errorFetching,
  } = useFetchTarifTindakan();

  const updateMutation = useUpdateTarifTindakan();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    const rawValue = value.replace(/\D/g, "");
    setForm({ ...form, [name]: rawValue ? Number(rawValue) : "" });
  };

  const handleSubmit = async () => {
    if (form.kdtindakan === "03" && !form.komisi) {
      setError("Komisi wajib diisi.");
      return;
    } else if (form.kdtindakan !== "03" && (!form.tarif || !form.komisi)) {
      setError("Tarif dan Komisi wajib diisi.");
      return;
    }

    try {
      await updateMutation.mutateAsync(form);
      handleClose();
    } catch (err) {
      setError("Gagal menyimpan data.");
    }
  };

  return (
    <Grid container spacing={4}>
      {/* Tabel Gigi */}
      <Grid item xs={12} sm={6}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Tarif dan komisi per gigi</Typography>
        </Box>

        {isLoading && (
          <Box display="flex" justifyContent="center" mt={3}>
            <CircularProgress />
          </Box>
        )}

        {errorFetching && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Terjadi kesalahan saat mengambil data: {errorFetching.message}
          </Alert>
        )}

        {!isLoading && !errorFetching && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No</TableCell>
                  <TableCell>Kode</TableCell>
                  <TableCell>Besar Tarif</TableCell>
                  <TableCell>Besar Komisi</TableCell>
                  <TableCell>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {safeArray(tarifTindakan)
                  ?.filter((item) => item.kdtindakan !== "03")
                  ?.map((row, index) => (
                    <TableRow key={row.kdtindakan}>
                      <TableCell>{++index}</TableCell>
                      <TableCell>{row.kdtindakan}</TableCell>
                      <TableCell>{formatCurrency(row.tarif)}</TableCell>
                      <TableCell>{formatCurrency(row.komisi)}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpen(row)}>
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Grid>

      {/* Tabel Perbaikan */}
      <Grid item xs={12} sm={6}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Komisi Perbaikan</Typography>
        </Box>

        {isLoading && (
          <Box display="flex" justifyContent="center" mt={3}>
            <CircularProgress />
          </Box>
        )}

        {errorFetching && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Terjadi kesalahan saat mengambil data: {errorFetching.message}
          </Alert>
        )}

        {!isLoading && !errorFetching && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No</TableCell>
                  <TableCell>Nama Tindakan</TableCell>
                  <TableCell>Komisi</TableCell>
                  <TableCell>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {safeArray(tarifTindakan)
                  ?.filter((item) => item.kdtindakan === "03")
                  ?.map((row, index) => (
                    <TableRow key={row.kdtindakan}>
                      <TableCell>{++index}</TableCell>
                      <TableCell>{row.nmtindakan}</TableCell>
                      <TableCell>{row.komisi}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpen(row)}>
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Grid>

      {/* Dialog Form */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {editing ? "Edit Tarif Tindakan" : "Tambah Tarif Tindakan"}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error">{error}</Alert>}
          {form?.kdtindakan !== "03" && (
            <TextField
              autoComplete="off"
              margin="normal"
              fullWidth
              name="tarif"
              label="Tarif"
              placeholder="Masukkan tarif"
              value={form?.tarif ? formatCurrency(form.tarif) : ""}
              onChange={handleChange}
            />
          )}
          {form.kdtindakan === "03" ? (
            <TextField
              autoComplete="off"
              margin="normal"
              fullWidth
              name="komisi"
              label="Komisi"
              placeholder="Masukkan besar komisi"
              value={form?.komisi || ""}
              onChange={(e) => setForm({ ...form, komisi: e.target.value })}
            />
          ) : (
            <TextField
              autoComplete="off"
              margin="normal"
              fullWidth
              name="komisi"
              label="Komisi"
              placeholder="Masukkan besar komisi"
              value={form?.komisi ? formatCurrency(form.komisi) : ""}
              onChange={handleChange}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Tutup</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default TarifKomisiGigi;
