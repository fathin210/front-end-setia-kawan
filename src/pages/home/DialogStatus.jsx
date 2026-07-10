import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Autocomplete,
  TextField,
  IconButton,
  FormHelperText,
  Typography,
} from "@mui/material";
import { useUpdateStatus } from "../../hooks/useMutateQueue";
import { safeArray } from "../../utils/common";
import { useFetchKaryawan } from "../../hooks/useFetchKaryawan";
import { status } from "../../constants/variables";
import { Controller, useForm } from "react-hook-form";
import { Close } from "@mui/icons-material";

const DialogStatus = ({ isOpen, onClose, queue }) => {
  const { data: masterKaryawan } = useFetchKaryawan();
  const mutation = useUpdateStatus(onClose);

  console.log("queue", queue);

  const { handleSubmit, watch, control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      ket: null,
      idkaryawan: null,
      ...queue,
    },
  })

  const onSubmit = async (data) => {
    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Ubah Status</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
        })}
      >
        <Close color="error" />
      </IconButton>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2}>
            <Typography>Status</Typography>
            <Controller
              control={control}
              name="ket"
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={safeArray(status)}
                  getOptionLabel={(option) => option?.nmstatus || ""}
                  value={
                    safeArray(status).find(
                      (emp) => emp.kdstatus === field.value
                    ) || null
                  }
                  onChange={(_, newValue) =>
                    field.onChange(newValue?.kdstatus)
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Status" fullWidth />
                  )}
                />)
              }
            />
            {["F", "G"].includes(watch("ket")) && (
              <>
                <Typography>Teknisi</Typography>
                <Controller
                  name="idkaryawan"
                  control={control}
                  rules={{
                    required: "Teknisi Wajib Dipilih"
                  }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={safeArray(masterKaryawan)}
                      getOptionLabel={(option) => option?.nmkaryawan || ""}
                      value={
                        safeArray(masterKaryawan).find(
                          (emp) => emp.idkaryawan === field.value
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        field.onChange(newValue?.idkaryawan)
                      }
                      renderInput={(params) => (
                        <TextField {...params} label="Nama Teknisi" fullWidth />
                      )}
                    />
                  )}
                />
                {errors?.idkaryawan &&
                  <FormHelperText error>{errors.idkaryawan.message}</FormHelperText>}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            color="primary"
            variant="contained"
            disabled={mutation.isLoading || watch("ket") === null}
          >
            {mutation.isLoading ? "Menambahkan..." : "Simpan"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DialogStatus;
