import React from "react";
import {
  Grid,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Stack,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { formatCurrency } from "../../../utils/common";
import { REPAIR_COST_OPTIONS } from "./constants";

const RepairSection = ({ control, errors }) => {
  const handleBiayaPerbaikanChange = (e, field) => {
    const value = Number(e.target.value.replace(/\D/g, ""));
    field.onChange(value);
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" fontWeight="bold">
          Perbaikan
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="biaya_perbaikan"
          control={control}
          rules={{
            required: "Biaya perbaikan wajib diisi",
            validate: (value) => Number(value) > 0 || "Biaya tidak boleh 0",
          }}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.biaya_perbaikan}>
              <FormLabel>Biaya Perbaikan</FormLabel>
              <Stack direction="row" spacing={2}>
                <RadioGroup
                  row
                  {...field}
                  onChange={(e) => handleBiayaPerbaikanChange(e, field)}
                >
                  {REPAIR_COST_OPTIONS.map((val) => (
                    <FormControlLabel
                      key={val}
                      control={<Radio />}
                      value={val}
                      label={formatCurrency(val)}
                    />
                  ))}
                </RadioGroup>

                <TextField
                  {...field}
                  label="Harga"
                  variant="standard"
                  error={!!errors.biaya_perbaikan}
                  helperText={errors.biaya_perbaikan?.message}
                  value={field.value ? formatCurrency(field.value) : ""}
                  onChange={(e) => handleBiayaPerbaikanChange(e, field)}
                />
              </Stack>
            </FormControl>
          )}
        />
      </Grid>
    </>
  );
};

export default RepairSection;