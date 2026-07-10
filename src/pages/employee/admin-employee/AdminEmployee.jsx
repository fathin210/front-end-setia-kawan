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
  Stack,
} from "@mui/material";
import { Edit, Delete, Search, Close } from "@mui/icons-material";
import { useFetchKaryawan } from "../../../hooks/useFetchKaryawan";
import {
  useCreateKaryawan,
  useDeleteKaryawan,
  useUpdateKaryawan,
} from "../../../hooks/useMutateKaryawan";
import { useDebouncedCallback } from "use-debounce";
import moment from "moment";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import { useForm, Controller } from "react-hook-form";

const defaultForm = {
  idkaryawan: "",
  nmkaryawan: "",
  jabatan: "",
  alamat: "",
  telp: "",
  noktp: "",
  temp_lahir: "",
  tgl_lahir: null,
  tmt_kerja: null,
};

const AdminEmployee = () => {
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
  const [editing, setEditing] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: defaultForm });

  const handleOpen = (karyawan) => {
    reset(karyawan || defaultForm);
    setEditing(!!karyawan);
    setOpen(true);
  };

  const handleClose = () => {
    reset(defaultForm);
    setEditing(false);
    setOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
      refetch();
      handleClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin hapus data ini?")) {
      try {
        await deleteMutation.mutateAsync(id);
        refetch();
      } catch (err) { }
    }
  };

  const debouncedSetSearch = useDebouncedCallback((value) => {
    setSearch(value);
  }, 500);

  return (
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Daftar Karyawan</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Tambah
        </Button>
      </Box>

      <Box mb={2}>
        <TextField
          placeholder="Cari Karyawan"
          onChange={(e) => debouncedSetSearch(e.target.value)}
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
        <Alert severity="error">Terjadi kesalahan: {errorFetching.message}</Alert>
      )}

      {!isLoading && !errorFetching && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nama</TableCell>
                <TableCell>Tempat Lahir</TableCell>
                <TableCell>Tanggal Lahir</TableCell>
                <TableCell>Jabatan</TableCell>
                <TableCell>Alamat</TableCell>
                <TableCell>Masa Kerja</TableCell>
                <TableCell>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {karyawans?.map((row) => {
                const durasi = moment.duration(moment().diff(row?.tmt_kerja));
                return (
                  <TableRow key={row.idkaryawan}>
                    <TableCell>{row.idkaryawan}</TableCell>
                    <TableCell>{row.nmkaryawan}</TableCell>
                    <TableCell>{row.temp_lahir}</TableCell>
                    <TableCell>{row.tgl_lahir ? moment(row.tgl_lahir).format("DD-MM-YYYY") : ""}</TableCell>
                    <TableCell>{row.jabatan}</TableCell>
                    <TableCell>{row.alamat}</TableCell>
                    <TableCell>{`${durasi.years()} Th ${durasi.months()} Bln ${durasi.days()} Hr`}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpen(row)}><Edit /></IconButton>
                      <IconButton onClick={() => handleDelete(row.idkaryawan)}><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Edit Karyawan" : "Tambah Karyawan"}</DialogTitle>
        <IconButton aria-label="close" onClick={handleClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <Close color="error" />
        </IconButton>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <TextField
              label="ID Karyawan"
              fullWidth
              margin="normal"
              {...register("idkaryawan")}
              disabled={editing}
            />
            <TextField
              label="Nama Karyawan"
              fullWidth
              margin="normal"
              {...register("nmkaryawan", { required: true })}
              error={!!errors.nmkaryawan}
              helperText={errors.nmkaryawan && "Nama wajib diisi"}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Tempat Lahir"
                sx={{ flex: 1 }}
                margin="normal"
                {...register("temp_lahir")}
              />
              <Controller
                name="tgl_lahir"
                control={control}
                render={({ field }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Tanggal Lahir"
                    inputFormat="DD/MM/YYYY"
                    value={field.value ? moment(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                    renderInput={(params) => (
                      <TextField
                        sx={{ flex: 1 }}
                        margin="normal" {...params} />
                    )}
                  />
                )}
              />
            </Stack>
            <TextField
              label="No. KTP"
              fullWidth
              margin="normal"
              {...register("noktp")}
            />
            <TextField
              label="Alamat"
              fullWidth
              margin="normal"
              {...register("alamat")}
            />
            <TextField
              label="No. Telp"
              fullWidth
              margin="normal"
              {...register("telp")}
            />
            <TextField
              label="Jabatan"
              fullWidth
              margin="normal"
              {...register("jabatan", { required: true })}
              error={!!errors.jabatan}
              helperText={errors.jabatan && "Jabatan wajib diisi"}
            />
          </DialogContent>
          <DialogActions>
            <Button type="submit" variant="contained">Simpan</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminEmployee;
