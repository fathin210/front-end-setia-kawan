import React, { useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Box,
  Stack,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  Pagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { DeleteOutline, Person, SwapHoriz, WarningAmber } from "@mui/icons-material";
import { safeArray } from "../../../utils/common";
import useListQueue from "../../../hooks/useListQueue";
import DialogPatientForm from "../../home/DialogPatientForm";
import usePatientStore from "../../../store/patientStore";
import { useDeletePatient } from "../../../hooks/useMutatePatient";
import { ADD_QUEUE, EDIT_PATIENT } from "../../../constants/variables";
import ROUTES from "../../../constants/routes";
import DialogQueue from "../../home/DialogQueue";
import DialogMoveTransaction from "./DialogMoveTransaction";
import HistoryPatient from "./HistoryPatient";
import MaleImage from "../../../assets/male.png";
import FemaleImage from "../../../assets/female.png";

const DetailPatient = () => {
  const { activePatient } = usePatientStore();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState(false);
  const [moveTarget, setMoveTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [page, setPage] = useState(1);
  const deleteMutation = useDeletePatient();

  const handleDialog = (value) => setDialog(value);

  const {
    data: rincianRes,
    error,
    isLoading,
    refetch,
  } = useListQueue("", "", undefined, page, undefined, activePatient?.nomorpasien);

  const rincianData = rincianRes?.data;

  const allSelected =
    safeArray(rincianData).length > 0 &&
    selectedIds.length === rincianData.length;

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : safeArray(rincianData).map((row) => row.id));
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeletePatient = async () => {
    try {
      await deleteMutation.mutateAsync(activePatient.idpasien);
      setConfirmDelete(false);
      navigate(ROUTES.HOME);
    } catch {
      setConfirmDelete(false);
    }
  };

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
                variant="outlined"
                color="error"
                startIcon={<DeleteOutline />}
                onClick={() => setConfirmDelete(true)}
              >
                Hapus Pasien
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* RINCIAN PELAYANAN */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Riwayat Rincian Pelayanan
          </Typography>
          <Divider sx={{ my: 2 }} />
        </Box>
        {selectedIds.length > 0 && (
          <Button
            variant="contained"
            startIcon={<SwapHoriz />}
            onClick={() =>
              setMoveTarget(
                safeArray(rincianData).filter((row) => selectedIds.includes(row.id))
              )
            }
          >
            Pindahkan Terpilih ({selectedIds.length})
          </Button>
        )}
      </Box>

      <HistoryPatient
        listQueue={{ data: rincianData, error, isLoading }}
        showTitle={false}
        enableActions
        selectedIds={selectedIds}
        onToggleSelectAll={toggleSelectAll}
        onToggleSelectRow={toggleSelectRow}
        onMoveRow={(row) => setMoveTarget([row])}
      />

      {!isLoading && !error && rincianRes?.total_pages > 1 && (
        <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
          <Pagination
            color="primary"
            shape="rounded"
            page={page}
            onChange={(_, value) => setPage(value)}
            count={rincianRes.total_pages}
          />
        </Box>
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
      {moveTarget && (
        <DialogMoveTransaction
          isOpen={true}
          transactions={moveTarget}
          currentNomorpasien={activePatient?.nomorpasien}
          onClose={() => {
            setMoveTarget(null);
            setSelectedIds([]);
          }}
        />
      )}

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmber color="error" />
          Hapus pasien "{activePatient?.nmpasien}"?
        </DialogTitle>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" color="inherit" onClick={() => setConfirmDelete(false)}>
            Tutup
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeletePatient}
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? "Menghapus..." : "Ya, Hapus"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DetailPatient;
