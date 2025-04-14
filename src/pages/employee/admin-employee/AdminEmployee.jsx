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
  InputAdornment,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Edit, Delete, Search } from "@mui/icons-material";
import { useFetchKaryawan } from "../../../hooks/useFetchKaryawan";
import {
  useCreateKaryawan,
  useDeleteKaryawan,
  useUpdateKaryawan,
} from "../../../hooks/useMutateKaryawan";
import { useDebouncedCallback } from "use-debounce";
import useSnackbarStore from "../../../store/snackbarStore";

const defaultForm = {
  idkaryawan: "",
  nmkaryawan: "",
  jabatan: "",
  alamat: "",
  telp: "",
  noktp: "",
};

const AdminEmployee = () => {
  const { showSnackbar } = useSnackbarStore.getState();
  const [search, setSearch] = useState("");
  const {
    data: karyawans,
    isLoading,
    error: errorFetching,
    refetch,
  } = useFetchKaryawan(search);
  const createMutation = useCreateKaryawan();
  const updateMutation = useUpdateKaryawan();
  const deleteMutation = useDeleteKaryawan();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  const handleOpen = (karyawan) => {
    setForm(karyawan || defaultForm);
    setEditing(!!karyawan);
    setError("");
    setOpen(true);
  };

  const handleClose = () => {
    setForm(defaultForm);
    setEditing(false);
    setOpen(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.nmkaryawan || !form.jabatan) {
      setError("Nama dan Jabatan wajib diisi.");
      return;
    }

    try {
      if (editing) {
        await updateMutation.mutateAsync(form);
        showSnackbar("Data berhasil diperbarui", "success");
      } else {
        await createMutation.mutateAsync(form);
        showSnackbar("Data berhasil ditambahkan", "success");
      }
      refetch();
      handleClose();
    } catch (err) {
      setError("Gagal menyimpan data.");
      showSnackbar("Terjadi kesalahan saat menyimpan data", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin hapus data ini?")) {
      try {
        await deleteMutation.mutateAsync(id);
        refetch();
        showSnackbar("Data berhasil dihapus", "success");
      } catch (err) {
        showSnackbar("Gagal menghapus data", "error");
      }
    }
  };

  const debouncedSetSearch = useDebouncedCallback((value) => {
    setSearch(value);
  }, 500);

  return (
    <Box p={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        rowGap={2}
        mb={2}
      >
        <Typography variant="h6">Daftar Karyawan</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Tambah
        </Button>
      </Box>

      <Box mb={2}>
        <TextField
          placeholder="Cari Karyawan"
          name="search"
          onChange={(event) => debouncedSetSearch(event.target.value)}
          fullWidth
          autoComplete="off"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
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
                <TableCell>ID</TableCell>
                <TableCell>Nama</TableCell>
                <TableCell>Jabatan</TableCell>
                <TableCell>Alamat</TableCell>
                <TableCell>Telp</TableCell>
                <TableCell>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {karyawans?.map((row) => (
                <TableRow key={row.idkaryawan}>
                  <TableCell>{row.idkaryawan}</TableCell>
                  <TableCell>{row.nmkaryawan}</TableCell>
                  <TableCell>{row.jabatan}</TableCell>
                  <TableCell>{row.alamat}</TableCell>
                  <TableCell>{row.telp || "-"}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(row)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(row.idkaryawan)}>
                      <Delete />
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
          {editing ? "Edit Karyawan" : "Tambah Karyawan"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoComplete="off"
            margin="normal"
            fullWidth
            name="idkaryawan"
            label="ID Karyawan"
            value={form.idkaryawan}
            onChange={handleChange}
            disabled={editing}
          />
          <TextField
            autoComplete="off"
            margin="normal"
            fullWidth
            name="nmkaryawan"
            label="Nama Karyawan"
            value={form.nmkaryawan}
            onChange={handleChange}
          />
          <TextField
            autoComplete="off"
            margin="normal"
            fullWidth
            name="jabatan"
            label="Jabatan"
            value={form.jabatan}
            onChange={handleChange}
          />
          <TextField
            autoComplete="off"
            margin="normal"
            fullWidth
            name="noktp"
            label="No. KTP"
            value={form.noktp}
            onChange={handleChange}
          />
          <TextField
            autoComplete="off"
            margin="normal"
            fullWidth
            name="alamat"
            label="Alamat"
            value={form.alamat}
            onChange={handleChange}
          />
          <TextField
            autoComplete="off"
            margin="normal"
            fullWidth
            name="telp"
            label="No. Telp"
            value={form.telp}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Batal</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminEmployee;
