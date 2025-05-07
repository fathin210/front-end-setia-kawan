import React from "react";
import { Grid, TextField, Typography } from "@mui/material";
import { Controller } from "react-hook-form";
import { Autocomplete } from "@mui/material";
import { updateCommission } from "./DialogQueueDetail";
import { safeArray } from "../../../utils/common";

const TechnicianSection = ({ control, errors, masterKaryawan, masterShift, watch, setValue }) => (
  <>
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
            value={safeArray(masterKaryawan).find((emp) => emp.idkaryawan === field.value) || null}
            onChange={(_, newValue) => field.onChange(newValue?.idkaryawan || '')}
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
    <Grid item xs={12} sm={6}>
      <Controller
        name="kdshift"
        control={control}
        rules={{
          required: "Shift wajib dipilih",
          validate: (value) => !!value || "Shift wajib dipilih"
        }}
        render={({ field }) => (
          <Autocomplete
            options={safeArray(masterShift)}
            getOptionLabel={(opt) => opt?.nmshift || ""}
            value={safeArray(masterShift).find((item) => item.kdshift == field.value) || null}
            onChange={(_, newValue) => {
              const nextVal = newValue?.kdshift ? String(newValue?.kdshift) : '';
              field.onChange(nextVal);
              const gigiVal = watch("jml_gigi");
              if (gigiVal && nextVal) {
                updateCommission(watch, masterPelayanan, setValue);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Jam Layanan"
                fullWidth
                error={!!errors.kdshift}
                helperText={errors.kdshift?.message}
              />
            )}
          />
        )}
      />
    </Grid>
  </>
);

export default TechnicianSection;