import React from "react";
import { Grid, TextField } from "@mui/material";
import moment from "moment";

const PatientInfoSection = ({ queue }) => (
  <>
    <Grid item xs={12} sm={6}>
      <TextField
        label="Tanggal"
        value={queue?.tanggal_pelaks ? moment(queue.tanggal_pelaks).format("DD/MM/YYYY") : ""}
        fullWidth
        InputProps={{ readOnly: true }}
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        label="Nama Pasien"
        value={queue?.nama_pasien || queue?.nmpasien || "-"}
        fullWidth
        InputProps={{ readOnly: true }}
      />
    </Grid>
  </>
);

export default PatientInfoSection;