import { Grid } from "@mui/material";
import React, { useState } from "react";
import ListPatient from "./ListPatient";
import ListQueue from "./ListQueue";

const tabs = [
  {
    label: "Semua",
    key: "all",
  },
  {
    label: "Belum Selesai",
    key: "pending",
  },
  {
    label: "Selesai",
    key: "done",
  },
];

const Home = () => {
  const [selectedTab, setSelectedTab] = useState("all");

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <ListQueue selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      </Grid>
      <Grid item xs={12} md={4}>
        <ListPatient selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      </Grid>
    </Grid>
  );
};

export default Home;
