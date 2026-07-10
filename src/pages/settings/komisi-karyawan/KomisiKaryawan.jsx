import { useState } from "react";
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
  Stack,
  Autocomplete,
  MenuItem,
  alpha,
} from "@mui/material";
import { Add, Edit, RequestQuote } from "@mui/icons-material";
import {
  useCreatePelayanan,
  useUpdatePelayanan,
} from "../../../hooks/useMutatePelayanan";
import { useFetchMasterPelayanan } from "../../../hooks/useFetchMasterPelayanan";
import { useFetchShift } from "../../../hooks/useFetchShift";
import { useFetchJenisGigi } from "../../../hooks/useFetchJenisGigi";
import { formatCurrency, safeArray } from "../../../utils/common";

const HARI_OPTIONS = ["Biasa", "Minggu"];

const defaultForm = {
  jml_gigi: "",
  hari: "",
  kdshift: "",
  id_jenis_gigi: "",
  komisi_pribadi: "",
  komisi_kolektif: "",
};

const KomisiKaryawan = () => {
  const {
    data: masterPelayanan,
    isLoading,
    error: errorFetching,
  } = useFetchMasterPelayanan();
  const { data: masterShift } = useFetchShift();
  const { data: jenisGigi } = useFetchJenisGigi();

  const createMutation = useCreatePelayanan();
  const updateMutation = useUpdatePelayanan();
  const isSaving = createMutation.isLoading || updateMutation.isLoading;

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [tarif, setTarif] = useState();
  const [shift, setShift] = useState(1);
  const [jenisGigiFilter, setJenisGigiFilter] = useState(null);

  const rows = safeArray(masterPelayanan).filter(
    (item) =>
      item.kdshift == shift &&
      (jenisGigiFilter === null || item.id_jenis_gigi === jenisGigiFilter)
  );

  const getJenisGigiLabel = (id) => {
    const match = safeArray(jenisGigi).find((item) => item.id === id);
    return match ? formatCurrency(match.tarif) : "-";
  };

  const handleOpen = (row) => {
    setForm(
      row || {
        ...defaultForm,
        kdshift: shift,
        id_jenis_gigi: jenisGigiFilter || "",
      }
    );
    setEditing(!!row);
    setError("");
    setOpen(true);
  };

  const handleClose = () => {
    setForm(defaultForm);
    setEditing(false);
    setOpen(false);
  };

  const handleNumberChange = (name) => (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, [name]: rawValue ? Number(rawValue) : "" }));
  };

  const handleSubmit = async () => {
    if (!form.kdshift || !form.jml_gigi) {
      setError("Shift dan jumlah gigi wajib diisi.");
      return;
    }
    if (!form.id_jenis_gigi) {
      setError("Jenis gigi wajib dipilih.");
      return;
    }
    if (form.komisi_pribadi === "" || form.komisi_kolektif === "") {
      setError("Komisi pribadi dan komisi kolektif wajib diisi.");
      return;
    }

    // if (!komisi_kolektif || !nkomisi_kolektif) {
    //   setError("Komisi kolektif dan jumlahnya wajib diisi.");
    //   return;
    // }

    try {
      const mutation = editing ? updateMutation : createMutation;
      await mutation.mutateAsync(form);
      handleClose();
    } catch {
      setError("Gagal menyimpan data.");
    }
  };


  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" fontWeight={600}>
          Komisi Karyawan
        </Typography>
        <Stack direction="row" gap={2} alignItems="center">
          <Box sx={{ width: 200 }}>
            <Autocomplete
              options={safeArray(masterShift)}
              getOptionLabel={(option) => option?.nmshift || ""}
              value={
                safeArray(masterShift).find((item) => item.kdshift === shift) ||
                null
              }
              onChange={(_, newValue) => setShift(newValue?.kdshift)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Shift"
                  placeholder="Pilih Shift"
                  fullWidth
                />
              )}
            />
          </Box>
          <Box sx={{ width: 200 }}>
            <Autocomplete
              options={safeArray(jenisGigi)}
              getOptionLabel={(option) => formatCurrency(option?.tarif)}
              value={
                safeArray(jenisGigi).find((item) => item.id === jenisGigiFilter) ||
                null
              }
              onChange={(_, newValue) => setJenisGigiFilter(newValue?.id ?? null)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Jenis Gigi"
                  placeholder="Semua Jenis Gigi"
                  fullWidth
                />
              )}
            />
          </Box>
          <Button
            onClick={() => handleOpen(null)}
            startIcon={<Add />}
            variant="contained"
          >
            Tambah
          </Button>
        </Stack>
      </Stack>

      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={3}>
          <CircularProgress />
        </Box>
      ) : errorFetching ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Terjadi kesalahan saat mengambil data: {errorFetching.message}
        </Alert>
      ) : rows.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          Belum ada data komisi untuk shift ini.
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
                <TableCell sx={{ fontWeight: 600 }} align="right">Jumlah Gigi</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Hari</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Shift</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Jenis Gigi</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Komisi Pribadi</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Komisi Kolektif</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Nominal Komisi Pribadi</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Nominal Komisi Kolektif</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={row.id ?? `${row.kdshift}-${row.jml_gigi}-${index}`} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell align="right">{row.jml_gigi}</TableCell>
                  <TableCell>{row.hari || "-"}</TableCell>
                  <TableCell>{row.kdshift}</TableCell>
                  <TableCell align="right">{getJenisGigiLabel(row.id_jenis_gigi)}</TableCell>
                  <TableCell align="right">{row.komisi_pribadi ?? "-"}</TableCell>
                  <TableCell align="right">{row.komisi_kolektif ?? "-"}</TableCell>
                  <TableCell align="right">{formatCurrency(row.nkomisi_pribadi)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.nkomisi_kolektif)}</TableCell>
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

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <RequestQuote color="primary" />
          {editing ? "Edit Komisi Karyawan" : "Tambah Komisi Karyawan"}
        </DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={safeArray(masterShift)}
                getOptionLabel={(option) => option?.nmshift || ""}
                value={
                  // kdshift dari master (angka) vs data tersimpan (string) -> loose equality
                  safeArray(masterShift).find(
                    (item) => item.kdshift == form?.kdshift
                  ) || null
                }
                onChange={(_, newValue) =>
                  setForm((prev) => ({ ...prev, kdshift: newValue?.kdshift || "" }))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Shift" required fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Jumlah Gigi"
                placeholder="Masukkan jumlah gigi"
                value={form?.jml_gigi || ""}
                onChange={handleNumberChange("jml_gigi")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={safeArray(jenisGigi)}
                getOptionLabel={(option) => formatCurrency(option?.tarif)}
                value={
                  safeArray(jenisGigi).find(
                    (item) => item.id === form?.id_jenis_gigi
                  ) || null
                }
                onChange={(_, newValue) =>
                  setForm((prev) => ({
                    ...prev,
                    id_jenis_gigi: newValue?.id || "",
                  }))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Jenis Gigi" required fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Hari"
                value={form?.hari || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, hari: e.target.value }))}
              >
                {HARI_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Komisi Pribadi"
                placeholder="Masukkan komisi pribadi"
                value={form?.komisi_pribadi ?? ""}
                onChange={handleNumberChange("komisi_pribadi")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Komisi Kolektif"
                placeholder="Masukkan komisi kolektif"
                value={form?.komisi_kolektif ?? ""}
                onChange={handleNumberChange("komisi_kolektif")}
              />
            </Grid>
          </Grid>
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

export default KomisiKaryawan;
