import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import { PersonAdd } from "@mui/icons-material";
import moment from "moment";
import { useForm, Controller } from "react-hook-form";
import { useSubmitPatient } from "../../hooks/useMutatePatient";
import { useAddToQueueMutation } from "../../hooks/useMutateQueue";
import { Close } from "@mui/icons-material";

const initialState = {
  nomorpasien: null,
  tgl_input: moment().format("YYYY-MM-DD"),
  noktp: null,
  nmpasien: "",
  temp_lahir: "",
  tgl_lahir: null,
  status: null,
  jnskel: "",
  nama_ortu: null,
  gol_darah: null,
  alamat: "",
  telp: "",
};

const DialogPatientForm = ({ isOpen, handleDialog, editData }) => {
  const { mutateAsync: addToQueue } = useAddToQueueMutation();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: initialState,
  });

  const { mutateAsync } = useSubmitPatient({
    editData,
    onComplete: async (data) => {
      try {
        if (!editData) {
          await addToQueue(data);
        }
        reset(initialState);
        handleDialog(false);
      } catch (error) { }
    },
  });

  useEffect(() => {
    if (editData) {
      const formatted = {
        ...editData,
        tgl_lahir: editData.tgl_lahir ? moment(editData.tgl_lahir) : null,
      };
      reset(formatted);
    } else {
      reset(initialState);
    }
  }, [editData, reset]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      tgl_lahir: data.tgl_lahir
        ? moment(data.tgl_lahir).format("YYYY-MM-DD")
        : null,
    };
    await mutateAsync(payload);
  };

  return (
    <Dialog maxWidth="md" fullWidth open={isOpen}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <PersonAdd color="primary" />
        {editData ? "Edit Data Pasien" : "Registrasi Pasien Baru"}
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit(onSubmit)} id="patient-form">
          <Stack gap={3}>
            <Stack gap={2}>
              <Typography variant="overline" color="text.secondary">
                Data Diri
              </Typography>
              <Controller
                name="nmpasien"
                control={control}
                rules={{ required: "Nama pasien wajib diisi" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nama Pasien"
                    placeholder="Masukkan nama pasien"
                    required
                    fullWidth
                    error={!!errors.nmpasien}
                    helperText={errors.nmpasien?.message}
                  />
                )}
              />

              <FormControl error={!!errors.jnskel}>
                <FormLabel required>Jenis Kelamin</FormLabel>
                <Controller
                  name="jnskel"
                  control={control}
                  rules={{ required: "Jenis kelamin wajib dipilih" }}
                  render={({ field }) => (
                    <RadioGroup row {...field}>
                      <FormControlLabel
                        value="L"
                        control={<Radio />}
                        label="Laki-laki"
                      />
                      <FormControlLabel
                        value="P"
                        control={<Radio />}
                        label="Perempuan"
                      />
                    </RadioGroup>
                  )}
                />
                {errors.jnskel && (
                  <FormHelperText>{errors.jnskel.message}</FormHelperText>
                )}
              </FormControl>

              <Stack direction="row" justifyContent="space-between" gap={4}>
                <Controller
                  name="temp_lahir"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Tempat Lahir"
                      placeholder="Masukkan Tempat Lahir"
                      sx={{ flex: 1 }}
                    />
                  )}
                />
                <Controller
                  name="tgl_lahir"
                  control={control}
                  render={({ field }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Tanggal Lahir"
                      format="DD/MM/YYYY"
                      value={field.value || null}
                      onChange={(date) => field.onChange(date)}
                      sx={{ flex: 1 }}
                      slotProps={{
                        actionBar: { actions: ["today"] },
                      }}
                    />
                  )}
                />
              </Stack>
            </Stack>

            <Stack gap={2}>
              <Typography variant="overline" color="text.secondary">
                Kontak &amp; Alamat
              </Typography>
              <Controller
                name="alamat"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Alamat"
                    placeholder="Masukkan Alamat"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="telp"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="No. Telepon / HP"
                    placeholder="Masukkan Nomor Telepon"
                    type="tel"
                    fullWidth
                  />
                )}
              />
            </Stack>
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => {
            handleDialog(null);
            reset(initialState);
          }}
        >
          Tutup
        </Button>
        <Button
          variant="contained"
          type="submit"
          form="patient-form"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Menyimpan..." : editData ? "Perbarui" : "Simpan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogPatientForm;
