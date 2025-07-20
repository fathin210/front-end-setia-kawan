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
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import { formatCurrency, safeArray } from "../../../utils/common";
import { useFetchMasterPelayanan } from "../../../hooks/useFetchMasterPelayanan";
import { useFetchShift } from "../../../hooks/useFetchShift";
import { TARIFF_OPTIONS } from "../../home/QueueDetailDialog/constants";
import { useUpdatePelayanan } from "../../../hooks/useMutatePelayanan";

const defaultForm = {
  id: "",
  kdtindakan: "",
  komisi_pribadi: "",
  komisi_kolektif: "",
};

const KomisiKaryawan = () => {

  const updateMutation = useUpdatePelayanan ();

  const { data: masterPelayanan, isLoading, error: errorFetching, } = useFetchMasterPelayanan();
  const { data: masterShift } = useFetchShift();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [tarif, setTarif] = useState();
  const [shift, setShift] = useState(1);

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

  const handleSubmit = async () => {
    const {
      komisi_pribadi,
      komisi_kolektif,
    } = form;

    if (komisi_pribadi < 0 || komisi_kolektif < 0) {
      setError("Komisi pribadi dan komisi kolektif wajib diisi.");
      return;
    }

    // if (!komisi_kolektif || !nkomisi_kolektif) {
    //   setError("Komisi kolektif dan jumlahnya wajib diisi.");
    //   return;
    // }

    try {
      await updateMutation.mutateAsync(form);
      handleClose();
    } catch (err) {
      setError("Gagal menyimpan data.");
    }
  };


  return (
    <Box p={2}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6">Komisi / Shift</Typography>

        <Box display="flex" gap={2}>
          <Box sx={{ width: 200 }}>
            <Autocomplete
              options={safeArray(TARIFF_OPTIONS)}
              getOptionLabel={(option) => `${option?.value ? formatCurrency(option.value) : ""}`}
              value={
                safeArray(TARIFF_OPTIONS).find((item) => item.value === tarif?.value) ||
                null
              }
              onChange={(_, newValue) => setTarif(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tarif Gigi"
                  placeholder="Pilih Tarif Gigi"
                  fullWidth
                />
              )}
            />
          </Box>
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
        </Box>
      </Stack>

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
                <TableCell>Jumlah Gigi</TableCell>
                <TableCell>Hari</TableCell>
                <TableCell>Shift</TableCell>
                <TableCell>Komisi Pribadi</TableCell>
                {/* <TableCell>Jumlah</TableCell> */}
                <TableCell>Komisi Kolektif</TableCell>
                {/* <TableCell>Jumlah</TableCell> */}
                <TableCell>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {safeArray(masterPelayanan)
                ?.filter((item) => {
                  if (item.kdshift != shift) return false;
                  if (tarif?.code) return item.kode?.startsWith(tarif.code);
                  return true;
                })
                ?.map((row, index) => (
                  <TableRow key={row.kdtindakan}>
                    <TableCell>{++index}</TableCell>
                    <TableCell>{row.kode}</TableCell>
                    <TableCell>{row.jml_gigi}</TableCell>
                    <TableCell>{row.hari}</TableCell>
                    <TableCell>{row.kdshift}</TableCell>
                    <TableCell>{row.komisi_pribadi}</TableCell>
                    {/* <TableCell>{formatCurrency(row.nkomisi_pribadi)}</TableCell> */}
                    <TableCell>{row.komisi_kolektif}</TableCell>
                    {/* <TableCell>
                      {formatCurrency(row.nkomisi_kolektif)}
                    </TableCell> */}
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

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {editing ? "Edit Tarif Tindakan" : "Tambah Tarif Tindakan"}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            autoComplete="off"
            margin="normal"
            fullWidth
            name="komisi_pribadi"
            label="Komisi Pribadi"
            placeholder="Masukkan besar komisi pribadi"
            type="number"
            value={form?.komisi_pribadi}
            onChange={(e) =>
              setForm({ ...form, komisi_pribadi: e.target.value })
            }
          />
          {/* <TextField
            autoComplete="off"
            margin="normal"
            fullWidth
            name="nkomisi_pribadi"
            label="Jumlah Komisi Pribadi (nkomisi)"
            placeholder="Masukkan jumlah komisi pribadi"
            type="number"
            value={form?.nkomisi_pribadi || "0"}
            onChange={(e) =>
              setForm({ ...form, nkomisi_pribadi: e.target.value })
            }
          /> */}
          <TextField
            autoComplete="off"
            margin="normal"
            fullWidth
            name="komisi_kolektif"
            label="Komisi Kolektif"
            placeholder="Masukkan besar komisi kolektif"
            type="number"
            value={form?.komisi_kolektif}
            onChange={(e) =>
              setForm({ ...form, komisi_kolektif: e.target.value })
            }
          />
          {/* <TextField
            autoComplete="off"
            margin="normal"
            fullWidth
            name="nkomisi_kolektif"
            label="Jumlah Komisi Kolektif (nkomisi)"
            placeholder="Masukkan jumlah komisi kolektif"
            type="number"
            value={form?.nkomisi_kolektif || "0"}
            onChange={(e) =>
              setForm({ ...form, nkomisi_kolektif: e.target.value })
            }
          /> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Tutup</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KomisiKaryawan;
