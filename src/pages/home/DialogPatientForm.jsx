import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
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
      <DialogTitle>
        {editData ? "Edit Data Pasien" : "Registrasi Pasien Baru"}
      </DialogTitle>
      <IconButton
        aria-label="close"
        color="error"
        onClick={() => {
          handleDialog(null);
          reset(initialState);
        }}
        sx={(_) => ({
          position: "absolute",
          right: 8,
          top: 8,
        })}
      >
        <Close color="error" />
      </IconButton>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={3}>
            <Box>
              <Typography>Nama Pasien</Typography>
              <Controller
                name="nmpasien"
                control={control}
                rules={{ required: "Nama pasien wajib diisi" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    placeholder="Masukkan nama pasien"
                    fullWidth
                    error={!!errors.nmpasien}
                    helperText={errors.nmpasien?.message}
                  />
                )}
              />
            </Box>

            <Stack direction="row" justifyContent="space-between" gap={4}>
              <Box sx={{ flex: 1 }}>
                <Typography>Tempat Lahir</Typography>
                <Controller
                  name="temp_lahir"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Masukkan Tempat Lahir"
                      fullWidth
                    />
                  )}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography>Tanggal Lahir</Typography>
                <Controller
                  name="tgl_lahir"
                  control={control}
                  render={({ field }) => (
                    <DesktopDatePicker
                      {...field}
                      format="DD/MM/YYYY"
                      value={field.value || null}
                      onChange={(date) => field.onChange(date)}
                      sx={{ width: "100%" }}
                      slotProps={{
                        actionBar: { actions: ["today"] },
                      }}
                    />
                  )}
                />
              </Box>
            </Stack>
            <Box>
              <Typography>Alamat</Typography>
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
            </Box>

            <FormControl error={!!errors.jnskel}>
              <FormLabel>Jenis Kelamin</FormLabel>
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
                <p style={{ color: "red", fontSize: 12 }}>
                  {errors.jnskel.message}
                </p>
              )}
            </FormControl>

            <Box>
              <Typography>No. Telepon / HP</Typography>
              <Controller
                name="telp"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    placeholder="Masukkan Nomor Telepon"
                    type="tel"
                    fullWidth
                  />
                )}
              />
            </Box>
          </Stack>

          <DialogActions sx={{ mt: 4 }}>
            <Button variant="contained" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : editData ? "Perbarui" : "Simpan"}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogPatientForm;
