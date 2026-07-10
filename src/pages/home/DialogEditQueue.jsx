import React from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Autocomplete,
  Typography,
  Grid,
  DialogActions,
  Button,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import moment from "moment";
import { useForm, Controller } from "react-hook-form";
import { Edit } from "@mui/icons-material";
import { useFetchMasterAction } from "../../hooks/useFetchMasterAction";
import { useFetchKaryawan } from "../../hooks/useFetchKaryawan";
import { useUpdateQueueTindakan } from "../../hooks/useMutateQueue";
import { safeArray } from "../../utils/common";

const readOnlySx = { "& .MuiInputBase-input": { bgcolor: "action.hover" } };

const DialogEditQueue = ({ isOpen, onClose, queue }) => {
  const { data: masterTindakan, isFetching: isFetchingMasterTindakan } =
    useFetchMasterAction();
  const { data: masterKaryawan, isLoading: isLoadingKaryawan } =
    useFetchKaryawan();
  const mutation = useUpdateQueueTindakan();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      kdtindakan: queue?.kdtindakan || "",
      idkaryawan: queue?.idkaryawan || null,
    },
  });

  const isMasterDataLoading = isFetchingMasterTindakan || isLoadingKaryawan;

  const onSubmit = async (formData) => {
    try {
      await mutation.mutateAsync({ id: queue?.id, ...formData });
      onClose();
    } catch {
      // alert kegagalan sudah ditangani mutation
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Edit color="primary" />
        Ubah Antrian
      </DialogTitle>
      <DialogContent dividers>
        {isMasterDataLoading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <form id="edit-queue-form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Tanggal"
                  value={
                    queue?.tanggal_pelaks
                      ? moment(queue.tanggal_pelaks).format("DD/MM/YYYY")
                      : ""
                  }
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={readOnlySx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nama Pasien"
                  value={queue?.nama_pasien || "-"}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={readOnlySx}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormLabel required>Tindakan</FormLabel>
                  <Controller
                    name="kdtindakan"
                    control={control}
                    rules={{ required: "Tindakan wajib dipilih" }}
                    render={({ field }) => (
                      <RadioGroup row {...field}>
                        {safeArray(masterTindakan).map((item) => (
                          <FormControlLabel
                            key={item?.kdtindakan}
                            control={<Radio />}
                            value={item?.kdtindakan}
                            label={item?.nmtindakan}
                          />
                        ))}
                      </RadioGroup>
                    )}
                  />
                  {errors.kdtindakan && (
                    <FormHelperText error>{errors.kdtindakan.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="subtitle1" fontWeight={600} mb={1}>
                  Teknisi
                </Typography>
                <Controller
                  name="idkaryawan"
                  control={control}
                  rules={{ required: "Teknisi wajib dipilih" }}
                  render={({ field }) => (
                    <Autocomplete
                      options={safeArray(masterKaryawan)}
                      getOptionLabel={(option) => option?.nmkaryawan || ""}
                      value={
                        safeArray(masterKaryawan).find(
                          (emp) => emp.idkaryawan === field.value
                        ) || null
                      }
                      onChange={(_, newValue) => {
                        field.onChange(newValue?.idkaryawan || "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Nama Teknisi"
                          fullWidth
                          error={Boolean(errors.idkaryawan)}
                          helperText={errors.idkaryawan?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Tutup
        </Button>
        <Button
          variant="contained"
          type="submit"
          form="edit-queue-form"
          disabled={mutation.isLoading || isMasterDataLoading}
        >
          {mutation.isLoading ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogEditQueue;
