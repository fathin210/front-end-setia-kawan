import React, { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  Divider,
  Box,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
  Button,
} from "@mui/material";
import moment from "moment";
import { Person } from "@mui/icons-material";
import { formatCurrency } from "../../../utils/common";
import useListQueue from "../../../hooks/useListQueue";
import DialogPatientForm from "../../home/DialogPatientForm";
import usePatientStore from "../../../store/patientStore";
import { ADD_QUEUE, EDIT_PATIENT } from "../../../constants/variables";
import DialogQueue from "../../home/DialogQueue";
import MaleImage from "../../../assets/male.png";
import FemaleImage from "../../../assets/female.png";

const DetailPatient = () => {
  const { activePatient } = usePatientStore();
  const [dialog, setDialog] = useState(false);

  const handleDialog = (value) => setDialog(value);

  const {
    data: rincianData,
    error,
    isLoading,
    refetch,
  } = useListQueue("", activePatient?.nomorpasien);

  if (!activePatient) {
    return (
      <Container>
        <Typography
          variant="h5"
          sx={{ mt: 3, textAlign: "center", color: "gray" }}
        >
          Tidak ada pasien yang dipilih
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 3 }}>
      {/* DETAIL PASIEN */}
      <Card sx={{ mb: 4, p: 2 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={3}>
            {/* Avatar Pasien */}
            <Avatar
              src={
                activePatient?.jnskel === "L"
                  ? MaleImage
                  : activePatient?.jnskel === "P"
                  ? FemaleImage
                  : undefined // Tidak pakai src kalau gender tidak ada
              }
              sx={{
                width: 90,
                height: 90,
                backgroundColor: !activePatient?.jnskel
                  ? "grey.300" // Warna abu-abu untuk gender tidak diketahui
                  : activePatient?.jnskel === "L"
                  ? "#90caf9"
                  : "#f48fb1",
              }}
            >
              {!activePatient?.jnskel && <Person sx={{ fontSize: 50 }} />}
            </Avatar>
            {/* Informasi Pasien */}
            <Grid container spacing={2} flex={1}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Nomor Pasien:</strong>{" "}
                  {activePatient?.nomorpasien || "-"}
                </Typography>
                <Typography variant="body1">
                  <strong>Nama:</strong> {activePatient?.nmpasien || "-"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Alamat:</strong> {activePatient?.alamat || "-"}
                </Typography>
                <Typography variant="body1">
                  <strong>No. Telepon:</strong> {activePatient?.telp || "-"}
                </Typography>
              </Grid>
            </Grid>
            {/* Tombol Edit */}
            <Stack gap={2}>
              <Button
                variant="contained"
                onClick={() => handleDialog(EDIT_PATIENT)}
              >
                Ubah Data Pasien
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleDialog(ADD_QUEUE)}
              >
                Tambahkan ke antrian
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* RINCIAN PELAYANAN */}
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

      {dialog === EDIT_PATIENT && (
        <DialogPatientForm
          isOpen={true}
          editData={activePatient}
          handleDialog={handleDialog}
          refetch={refetch}
        />
      )}
      {dialog === ADD_QUEUE && (
        <DialogQueue
          isOpen={true}
          patient={activePatient}
          onClose={() => handleDialog(false)}
        />
      )}
    </Container>
  );
};

export default DetailPatient;
