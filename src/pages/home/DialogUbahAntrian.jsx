import { Close } from '@mui/icons-material'
import { Autocomplete, Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, FormControl, FormControlLabel, FormHelperText, FormLabel, Grid, IconButton, Radio, RadioGroup, TextField, Typography } from '@mui/material'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { safeArray } from '../../utils/common'
import { useFetchMasterAction } from '../../hooks/useFetchMasterAction'
import { useFetchKaryawan } from '../../hooks/useFetchKaryawan'
import { useUpdateQueue } from '../../hooks/useMutateQueue'
import useAlertStore from '../../store/alertStore'

const DialogUbahAntrian = ({ isOpen, onClose, queue }) => {

  const { data: masterKaryawan } = useFetchKaryawan();
  const { data: masterTindakan } = useFetchMasterAction();

  const { showAlert } = useAlertStore.getState()

  const mutation = useUpdateQueue();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    register
  } = useForm({
    defaultValues: { ...queue },
  });

  const handleTindakanChange = (e, field) => {
    const newKode = e.target.value;
    field.onChange(newKode);
  }

  const handleUpdateQueue = async (formData) => {
    try {
      await mutation.mutateAsync(formData);
      onClose()
    } catch (err) {
      console.error(err);
      showAlert(err?.message || "Gagal Menyimpan Data", "error");
    }
  };

  return (
    <Dialog maxWidth="md" fullWidth open={isOpen}>
      <DialogTitle>Ubah Antrian</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        color="error"
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
        }}
      >
        <Close color="error" />
      </IconButton>
      <DialogContent>
        <form onSubmit={handleSubmit(handleUpdateQueue)}>
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography>ID Pasien</Typography>
                <TextField slotProps={{
                  input: {
                    readOnly: true
                  }
                }}
                  fullWidth
                  {...register("nomorpasien")}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>Nama Pasien</Typography>
                <TextField slotProps={{
                  input: {
                    readOnly: true
                  }
                }}
                  fullWidth
                  {...register("nomorpasien")}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold">
                  Teknisi
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
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
                        field.onChange(newValue?.idkaryawan || undefined);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Nama Teknisi"
                          error={Boolean(errors.idkaryawan)}
                          helperText={errors.idkaryawan?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              {/* Pilih Tindakan */}
              <Grid item xs={12}>
                <Controller
                  name="kdtindakan"
                  control={control}
                  render={({ field }) => (
                    <FormControl error={!!errors.kdtindakan}>
                      <FormLabel>Tindakan</FormLabel>
                      <RadioGroup
                        row
                        {...field}
                        onChange={(e) => handleTindakanChange(e, field)}
                      >
                        {safeArray(masterTindakan).map((item) => (
                          <FormControlLabel
                            key={item?.kdtindakan}
                            control={<Radio />}
                            value={item?.kdtindakan}
                            label={item?.nmtindakan}
                          />
                        ))}
                      </RadioGroup>
                      {errors.kdtindakan && (
                        <FormHelperText>{errors.kdtindakan.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="end">
                  <Button variant='contained' type="submit">Ubah Antrian</Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default DialogUbahAntrian