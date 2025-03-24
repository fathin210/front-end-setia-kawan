import { Female, Male, PersonAdd, Print } from "@mui/icons-material";
import { Button, Stack, Typography } from "@mui/material";
import React from "react";

const PatientCard = ({ data }) => {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #d0d5dd",
      }}
    >
      <Stack>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography>{data?.nama}</Typography>
          {data?.gender === "male" ? (
            <Male
              fontSize="12px"
              sx={{ background: "#2b7fff", borderRadius: "100%" }}
            />
          ) : (
            <Female
              fontSize="12px"
              sx={{ background: "#f6339a", borderRadius: "100%" }}
            />
          )}
        </Stack>
        <Typography variant="caption">No. Kartu {data?.no_kartu}</Typography>
        <Typography variant="caption">{data?.address}</Typography>
      </Stack>
      <Stack direction="row" gap={1}>
        <Button variant="contained" sx={{ p: 2, minWidth: 35, height: 35 }}>
          <PersonAdd fontSize="12px" />
        </Button>
        <Button
          variant="contained"
          sx={{ p: 2, minWidth: 35, height: 35, fontSize: "12px" }}
          color="warning"
        >
          i
        </Button>
        <Button
          variant="contained"
          sx={{ p: 2, minWidth: 35, height: 35 }}
          color="success"
        >
          <Print fontSize="12px" />
        </Button>
      </Stack>
    </Stack>
  );
};

export default PatientCard;
