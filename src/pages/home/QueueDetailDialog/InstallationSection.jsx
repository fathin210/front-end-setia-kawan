import React from "react";
import { Autocomplete, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, TextField, Typography } from "@mui/material"
import { Controller } from "react-hook-form";
import { TARIFF_OPTIONS } from "./constants";
import { updateCommission } from "./DialogQueueDetail";

const InstallationSection = ({
  control,
  errors,
  watch,
  setValue,
  masterPelayanan
}) => {
  const handleTarifChange = (e, field) => {
    const value = Number(e.target.value.replace(/\D/g, ""));
    field.onChange(value);

    const gigiVal = watch("jml_gigi");
    const shiftVal = watch("kdshift");
    if (gigiVal && shiftVal) {
      updateCommission(watch, masterPelayanan, setValue);
    }
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" fontWeight="bold">
          Pemasangan
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="tarif"
          control={control}
          rules={{
            required: "Tarif per gigi wajib dipilih",
            validate: v => Number(v) > 0 || "Tarif tidak boleh 0"
          }}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.tarif}>
              <FormLabel>Tarif Per Gigi</FormLabel>
              <RadioGroup
                row
                {...field}
                onChange={(e) => handleTarifChange(e, field)}
              >
                {TARIFF_OPTIONS.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio />}
                    label={option.label}
                  />
                ))}
              </RadioGroup>
              {errors.tarif && (
                <FormHelperText>{errors.tarif.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <Controller
          name="jml_gigi"
          control={control}
          rules={{
            required: "Jumlah gigi wajib dipilih",
            validate: value => (value >= 1 ? true : "Jumlah gigi minimal 1")
          }}
          render={({ field }) => (
            <Autocomplete
              options={Array.from({ length: 28 }, (_, i) => i + 1)}
              getOptionLabel={(opt) => String(opt)}
              value={field.value || null}
              onChange={(_, newValue) => {
                const nextVal = newValue || 0;
                field.onChange(nextVal);
                const shiftVal = watch("kdshift");
                if (shiftVal) {
                  updateCommission(watch, masterPelayanan, setValue);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Jumlah Gigi"
                  fullWidth
                  error={!!errors.jml_gigi}
                  helperText={errors.jml_gigi?.message}
                />
              )}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <Controller
          name="komisi_kolektif"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Komisi Kolektif"
              fullWidth
              type="number"
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Controller
          name="komisi_pribadi"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Komisi Pribadi"
              fullWidth
              type="number"
            />
          )}
        />
      </Grid>
    </>
  );
};

export default InstallationSection;