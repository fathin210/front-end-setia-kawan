import { Close } from '@mui/icons-material'
import { Autocomplete, Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, FormControl, FormControlLabel, FormHelperText, FormLabel, Grid, IconButton, Radio, RadioGroup, TextField, Typography } from '@mui/material'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { safeArray } from '../../utils/common'
import { useFetchMasterAction } from '../../hooks/useFetchMasterAction'
import { useFetchKaryawan } from '../../hooks/useFetchKaryawan'
import { useUpdateQueue } from '../../hooks/useMutateQueue'
import useAlertStore from '../../store/alertStore'
import PatientInfoSection from './QueueDetailDialog/PatientInfoSection'
import TechnicianSection from './QueueDetailDialog/TechnicianSection'
import { useFetchShift } from '../../hooks/useFetchShift'

const DialogUbahAntrian = ({ isOpen, onClose, queue }) => {

  const { data: masterKaryawan } = useFetchKaryawan();
  const { data: masterTindakan } = useFetchMasterAction();
  const { data: masterShift } = useFetchShift();

  const { showAlert } = useAlertStore.getState()

  const mutation = useUpdateQueue();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
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
              <PatientInfoSection queue={queue} />
              <TechnicianSection
                control={control}
                errors={errors}
                masterKaryawan={masterKaryawan}
                masterShift={masterShift}
                watch={watch}
                setValue={setValue}
              />

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
                  <Button variant='contained' type="submit">Simpan</Button>
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