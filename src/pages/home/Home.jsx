import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import React, { useState } from "react";
import Grid from "@mui/material/Grid2";
import ListPatient from "./ListPatient";

const dummy = [
  {
    id: 1,
    nama: "Fathin Al Ghifari",
    tindakan: "Pembersihan Karang Gigi",
    teknisi: "Dr. Rafi",
    jumlahGigi: 24,
    biayaPerGigi: 60000,
  },
  {
    id: 2,
    nama: "Naila Putri",
    tindakan: "Tambal Gigi",
    teknisi: "Dr. Siti",
    jumlahGigi: 2,
    biayaPerGigi: 150000,
  },
  {
    id: 3,
    nama: "Budi Santoso",
    tindakan: "Cabut Gigi",
    teknisi: "Dr. Arif",
    jumlahGigi: 1,
    biayaPerGigi: 250000,
  },
];

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
    <Grid container spacing={4} sx={{ height: "calc(88vh - 16px)" }}>
      <Grid item xs={12} md={8} sx={{ height: "100%", flexGrow: 1 }}>
        <Paper
          variant="outlined"
          square={false}
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            height: "100%",
          }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            {tabs.map((item) => (
              <Button
                key={item.key}
                variant="contained"
                color={selectedTab === item.key ? "primary" : "inherit"}
                sx={{ borderRadius: 8, px: 2, fontWeight: "medium" }}
                onClick={() => setSelectedTab(item.key)}
              >
                {item.label}
              </Button>
            ))}
          </Box>
          <Paper square={false} sx={{ p: 1, overflow: "auto", flex: 1 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No. Urut</TableCell>
                  <TableCell>Nama</TableCell>
                  <TableCell>Tindakan</TableCell>
                  <TableCell>Teknisi</TableCell>
                  <TableCell>Jumlah Gigi</TableCell>
                  <TableCell>Biaya Per Gigi</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dummy.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.nama}</TableCell>
                    <TableCell>{row.tindakan}</TableCell>
                    <TableCell>{row.teknisi}</TableCell>
                    <TableCell>{row.jumlahGigi}</TableCell>
                    <TableCell>
                      Rp. {row.biayaPerGigi.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      Rp. {(row.jumlahGigi * row.biayaPerGigi).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4} sx={{ height: "100%", flexGrow: 1 }}>
        <ListPatient />
      </Grid>
    </Grid>
  );
};

export default Home;
