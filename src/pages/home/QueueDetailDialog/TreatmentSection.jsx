import React from "react";
import {
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { safeArray } from "../../../utils/common";

/**
 * TreatmentSection component for selecting treatment options.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.control - Control object from react-hook-form.
 * @param {Object} props.errors - Errors object from react-hook-form.
 * @param {Array} props.masterTindakan - Array of treatment options.
 * @param {boolean} props.isFetchingMasterTindakan - Loading state for fetching treatment options.
 * @param {Function} props.watch - Watch function from react-hook-form.
 * @param {Function} props.setValue - Set value function from react-hook-form.
 * @param {Object} props.resolvedDP - Resolved deposit data.
 * @param {boolean} props.isDpExist - Flag indicating if deposit exists.
 */

const TreatmentSection = ({
  control,
  errors,
  masterTindakan,
  isFetchingMasterTindakan,
  watch,
  setValue,
  resolvedDP,
  isDpExist
}) => {
  const handleTindakanChange = (e, field) => {
    const newKode = e.target.value;
    field.onChange(newKode);

    if (newKode === "03") {
      setValue("dp", 0);
      setValue("iddp", watch("iddp") || null);
      setValue("tarif", 0);
      setValue("batal_dp", !!watch("iddp"));
      setValue("jml_gigi", 0);
      setValue("komisi_kolektif", 0);
      setValue("komisi_pribadi", 0);
      setValue("nkomisi_kolektif", 0);
      setValue("nkomisi_pribadi", 0);
    } else {
      setValue("jml_gigi", resolvedDP?.jumlah_gigi || 0);
      setValue(
        "tarif",
        isDpExist && newKode !== "03" ? resolvedDP?.tarif_per_gigi : 0
      );
    }
    setValue("biaya_perbaikan", 0);
    setValue("komisi_perbaikan", 0);
  };

  return (
    <Grid item xs={12}>
      <Controller
        name="kdtindakan"
        control={control}
        rules={{ required: "Tindakan wajib dipilih" }}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.kdtindakan}>
            <FormLabel>Tindakan</FormLabel>
            {isFetchingMasterTindakan ? (
              <CircularProgress />
            ) : (
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
            )}
            {errors.kdtindakan && (
              <FormHelperText>{errors.kdtindakan.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />
    </Grid>
  );
};

export default TreatmentSection;