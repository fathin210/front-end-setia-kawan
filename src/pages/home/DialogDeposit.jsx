import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  TextField,
  Autocomplete,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import moment from "moment";
import { useFetchKaryawan } from "../../hooks/useFetchKaryawan";
import { formatCurrency, safeArray } from "../../utils/common";
import {
  useCreateDeposit,
  useUpdateDeposit,
} from "../../hooks/useMutateDeposit";

const DialogDeposit = ({ isOpen, onClose, data }) => {
  const { data: masterKaryawan } = useFetchKaryawan();
  const mutation = useCreateDeposit();
  const editMutation = useUpdateDeposit();

  const [draft, setDraft] = useState({
    ...data,
    tanggal: data?.tanggal ? data.tanggal : moment().format("YYYY-MM-DD"),
  });

  const handleSubmit = async () => {
    try {
      const mutationFunc = (draft?.iddp ? editMutation : mutation).mutateAsync(
        draft
      );
      await mutationFunc();
      onClose();
    } catch (error) {}
  };

  const handleTarifChange = (event) => {
    const rawValue = event.target.value.replace(/\D/g, "");
    setDraft((prevState) => ({
      ...prevState,
      tarif_per_gigi: rawValue ? Number(rawValue) : "",
    }));
  };

  const handleJumlahDeposit = (event) => {
    const rawValue = event.target.value.replace(/\D/g, "");
    setDraft((prevState) => ({
      ...prevState,
      jumlah: rawValue ? Number(rawValue) : "",
    }));
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Input Deposit</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <Card>
              <CardContent>
                <Typography variant="body1">
                  <strong>ID Pasien:</strong> {draft?.nomorpasien || "-"}
                </Typography>
                <Typography variant="body1">
                  <strong>Nama:</strong> {draft?.nmpasien || "-"}
                </Typography>
                <Typography variant="body1">
                  <strong>Alamat:</strong> {draft?.alamat || "-"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <DesktopDatePicker
              sx={{ width: "100%" }}
              format="DD/MM/YYYY"
              label="Tanggal Input"
              value={draft?.tanggal ? moment(draft?.tanggal) : null}
              onChange={(value) => {
                if (value) {
                  setDraft({
                    ...draft,
                    tanggal: moment(value).format("YYYY-MM-DD"),
                  });
                }
              }}
              slotProps={{
                actionBar: {
                  actions: ["today"],
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DesktopDatePicker
              sx={{ width: "100%" }}
              format="DD/MM/YYYY"
              label="Tanggal Diambil"
              value={
                draft?.tanggal_diambil ? moment(draft?.tanggal_diambil) : null
              }
              onChange={(value) => {
                if (value) {
                  setDraft({
                    ...draft,
                    tanggal_diambil: moment(value).format("YYYY-MM-DD"),
                  });
                }
              }}
              slotProps={{
                actionBar: {
                  actions: ["today"],
                },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Nomor Telpon"
              value={draft?.telp}
              fullWidth
              onChange={(e) =>
                setDraft({
                  ...draft,
                  telp: e.target.value,
                })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Jumlah Deposit"
              value={draft?.jumlah ? formatCurrency(draft.jumlah) : ""}
              fullWidth
              onChange={handleJumlahDeposit}
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              options={safeArray(masterKaryawan)}
              getOptionLabel={(option) => option?.nmkaryawan || ""}
              value={
                safeArray(masterKaryawan).find(
                  (emp) => emp.idkaryawan == draft?.idkaryawan
                ) || null
              }
              onChange={(_, newValue) =>
                setDraft((prevState) => ({
                  ...prevState,
                  idkaryawan: newValue?.idkaryawan,
                }))
              }
              renderInput={(params) => (
                <TextField {...params} label="Nama Teknisi" fullWidth />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              options={Array.from({ length: 28 }, (_, index) => index + 1)}
              getOptionLabel={(option) => String(option)}
              value={draft?.jumlah_gigi || null}
              onChange={(_, newValue) =>
                setDraft((prevState) => ({
                  ...prevState,
                  jumlah_gigi: newValue || "",
                }))
              }
              renderInput={(params) => (
                <TextField {...params} label="Jumlah Gigi" fullWidth />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <FormLabel>Tarif Per Gigi</FormLabel>
              <Stack direction="row" spacing={2}>
                <RadioGroup
                  row
                  value={draft?.tarif_per_gigi || ""}
                  onChange={handleTarifChange}
                >
                  <FormControlLabel
                    control={<Radio />}
                    value="40000"
                    label="40.000"
                  />
                  <FormControlLabel
                    control={<Radio />}
                    value="60000"
                    label="60.000"
                  />
                  <FormControlLabel
                    control={<Radio />}
                    value="160000"
                    label="160.000"
                  />
                </RadioGroup>
              </Stack>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Batal
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={mutation.isLoading}
        >
          {mutation.isLoading ? "Menambahkan..." : "Simpan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogDeposit;
