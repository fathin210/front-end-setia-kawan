import React, { useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Avatar,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Person } from "@mui/icons-material";
import useListQueue from "../../../hooks/useListQueue";
import DialogPatientForm from "../../home/DialogPatientForm";
import usePatientStore from "../../../store/patientStore";
import { ADD_QUEUE, CONFIRM_DELETE, EDIT_PATIENT } from "../../../constants/variables";
import DialogQueue from "../../home/DialogQueue";
import MaleImage from "../../../assets/male.png";
import FemaleImage from "../../../assets/female.png";
import HistoryPatient from "./HistoryPatient";
import { useDeletePatient } from "../../../hooks/useMutatePatient";
import { useNavigate } from "react-router-dom";

const DetailPatient = () => {
  const { activePatient, clearActivePatient } = usePatientStore();
  const deletePatient = useDeletePatient();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState(false);

  const handleDialog = (value) => setDialog(value);

  const listQueue = useListQueue("", activePatient?.nomorpasien, "all");

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
              <Button
                variant="contained"
                color="error"
                onClick={() => handleDialog(CONFIRM_DELETE)}
              >
                Hapus Data Pasien
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* RINCIAN PELAYANAN */}
      <HistoryPatient listQueue={listQueue} />

      {dialog === CONFIRM_DELETE && (
        <Dialog open>
          <DialogContent>
            <Typography>
              Apakah Anda yakin ingin menghapus data pasien ini?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="primary" onClick={() => setDialog(false)}>
              Tutup
            </Button>
            <Button
              variant="contained"
              onClick={async () => {
                try {
                  await deletePatient.mutateAsync({idpasien: activePatient?.idpasien});
                  setDialog(false);
                  clearActivePatient();
                  navigate("/");
                } catch (error) { }
              }}
              color="error"
              disabled={deletePatient.isPending}
            >
              {deletePatient.isPending ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {dialog === EDIT_PATIENT && (
        <DialogPatientForm
          isOpen={true}
          editData={activePatient}
          handleDialog={handleDialog}
          refetch={listQueue.refetch}
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
