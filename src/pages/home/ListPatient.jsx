import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputAdornment,
  Pagination,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Add, Search } from "@mui/icons-material";
import PatientCard from "./PatientCard";
import { MobileDatePicker } from "@mui/x-date-pickers";
import moment from "moment";

const dummy = [
  {
    no_urut: 1,
    nama: "TESTING",
    no_kartu: "1234658",
    address: "Jl. RAJAWALI 7",
    gender: "male",
  },
  {
    no_urut: 1,
    nama: "TESTING",
    no_kartu: "1234658",
    address: "Jl. RAJAWALI 7",
    gender: "female",
  },
  {
    no_urut: 1,
    nama: "TESTING",
    no_kartu: "1234658",
    address: "Jl. RAJAWALI 7",
    gender: "female",
  },
  {
    no_urut: 1,
    nama: "TESTING",
    no_kartu: "1234658",
    address: "Jl. RAJAWALI 7",
    gender: "male",
  },
  {
    no_urut: 1,
    nama: "TESTING",
    no_kartu: "1234658",
    address: "Jl. RAJAWALI 7",
    gender: "male",
  },
  {
    no_urut: 1,
    nama: "TESTING",
    no_kartu: "1234658",
    address: "Jl. RAJAWALI 7",
    gender: "male",
  },
  {
    no_urut: 1,
    nama: "TESTING",
    no_kartu: "1234658",
    address: "Jl. RAJAWALI 7",
    gender: "male",
  },
  {
    no_urut: 1,
    nama: "TESTING",
    no_kartu: "1234658",
    address: "Jl. RAJAWALI 7",
    gender: "male",
  },
];

const ListPatient = () => {
  const [dialog, setDialog] = useState(null);

  const handleDialog = (value) => () => setDialog(value);

  return (
    <>
      <Paper
        variant="outlined"
        square={false}
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          height: "100%",
        }}
      >
        <Stack gap={4} sx={{ height: "100%" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ flexGrow: 1 }}
          >
            <Typography>Daftar Pasien</Typography>
            <Button
              onClick={handleDialog("add_new_patient")}
              startIcon={<Add />}
              variant="contained"
            >
              Input Pasien Baru
            </Button>
          </Stack>
          <TextField
            placeholder="Cari Pasien"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Stack gap={2} sx={{ flexGrow: 2, overflow: "auto" }}>
            {dummy.map((item, index) => (
              <PatientCard data={item} key={index} />
            ))}
          </Stack>
          <Pagination
            color="primary"
            shape="rounded"
            count={10}
            sx={{ flexGrow: 1 }}
          />
        </Stack>
      </Paper>
      <Dialog
        maxWidth="md"
        fullWidth
        open={dialog === "add_new_patient"}
        onClose={handleDialog(null)}
      >
        <DialogTitle>Formulir Pasien Baru</DialogTitle>
        <DialogContent>
          <Stack gap={3}>
            <TextField
              label="Nama Pasien"
              placeholder="Masukkan nama pasien"
              variant="standard"
              fullWidth
            />
            <Stack direction="row" justifyContent="space-between" gap={4}>
              <TextField
                label="Tempat Lahir"
                placeholder="Masukkan Tempat Lahir"
                variant="standard"
                sx={{ flex: 1 }}
              />
              <MobileDatePicker
                defaultValue={moment(Date.now())}
                sx={{ flex: 1 }}
                format="DD/MM/YYYY"
                label="Tanggal Lahir"
              />
            </Stack>
            <TextField
              label="Alamat"
              placeholder="Masukkan Alamat"
              variant="standard"
              fullWidth
            />
            <FormControl>
              <FormLabel>Jenis Kelamin</FormLabel>
              <RadioGroup row>
                <FormControlLabel
                  value="male"
                  control={<Radio />}
                  label="Laki-laki"
                />
                <FormControlLabel
                  value="female"
                  control={<Radio />}
                  label="Perempuan"
                />
              </RadioGroup>
            </FormControl>
            <TextField
              label="No. Telepon / HP"
              placeholder="Masukkan Alamat"
              variant="standard"
              type="tel"
              fullWidth
              autoComplete="off"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="error"
            onClick={handleDialog(null)}
          >
            Batal
          </Button>
          <Button variant="contained">Simpan</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ListPatient;
