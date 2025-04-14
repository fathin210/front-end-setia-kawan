import { Stack } from "@mui/material";
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
    <Stack gap={2} direction="row">
      <ListQueue />
      <ListPatient />
    </Stack>
  );
};

export default Home;
