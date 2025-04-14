import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  TableFooter,
  useTheme,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import React, { useState } from "react";
import useListQueue from "../../../hooks/useListQueue";
import moment from "moment";
import { DatePicker, DesktopDatePicker } from "@mui/x-date-pickers";
import { formatCurrency, safeArray } from "../../../utils/common";

const Earning = () => {
  const theme = useTheme();
  const [mode, setMode] = useState("harian");
  const [date, setDate] = useState(moment());
  const { data, error, isLoading } = useListQueue(
    date.format(mode === "harian" ? "YYYY-MM-DD" : "YYYY-MM"),
    ""
  );

  const totalJumlahGigi = safeArray(data).reduce(
    (sum, item) => sum + item.jml_gigi,
    0
  );
  const totalBiayaPasang = safeArray(data).reduce(
    (sum, item) => sum + item.total_biaya,
    0
  );
  const totalBiayaPerbaikan = safeArray(data).reduce(
    (sum, item) => sum + item.biaya_perbaikan,
    0
  );
  const totalPendapatan = totalBiayaPasang + totalBiayaPerbaikan;

  return (
    <Box p={2}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" mb={2}>
          Pendapatan
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Tabs
            value={mode}
            onChange={(_, newValue) => setMode(newValue)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Harian" value="harian" />
            <Tab label="Bulanan" value="bulanan" />
          </Tabs>

          {mode === "harian" ? (
            <DesktopDatePicker
              format="DD/MM/YYYY"
              label="Tanggal"
              value={date}
              onChange={(value) => {
                if (value) setDate(moment(value));
              }}
              slotProps={{
                actionBar: {
                  actions: ["today"],
                },
              }}
            />
          ) : (
            <DatePicker
              views={["year", "month"]}
              label="Pilih Bulan"
              maxDate={moment()}
              value={date}
              format="MM/YYYY"
              onChange={(value) => {
                if (value) setDate(moment(value));
              }}
            />
          )}
        </Stack>
      </Stack>
      {isLoading && (
        <Box display="flex" justifyContent="center" mt={3}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Terjadi kesalahan saat mengambil data: {error.message}
        </Alert>
      )}
      {!isLoading && !error && (
        <TableContainer
          component={Paper}
          sx={{ overflow: "auto", height: "75vh" }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Tanggal Transaksi</TableCell>
                <TableCell>Invoice</TableCell>
                <TableCell>Nama Pasien</TableCell>
                <TableCell>Tindakan</TableCell>
                <TableCell>Teknisi</TableCell>
                <TableCell>Jml Gigi</TableCell>
                <TableCell>Biaya Pasang</TableCell>
                <TableCell>Biaya Perbaikan</TableCell>
                <TableCell>Jumlah Pendapatan</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {safeArray(data).map((row, idx) => (
                <TableRow hover key={row.id}>
                  <TableCell align="right">{++idx}</TableCell>
                  <TableCell>
                    {row?.tanggal
                      ? moment(row.tanggal).format("DD/MM/YYYY")
                      : ""}
                  </TableCell>
                  <TableCell>#SK{row.nopendaftaran}#</TableCell>
                  <TableCell>{row.nmpasien}</TableCell>
                  <TableCell>{row.nama_tindakan}</TableCell>
                  <TableCell>{row.nama_karyawan}</TableCell>
                  <TableCell align="right">{row.jml_gigi}</TableCell>
                  <TableCell align="right">
                    {row.total_biaya.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    {row.biaya_perbaikan.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    {(row?.total_biaya + row?.biaya_perbaikan).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow
                sx={{
                  position: "sticky",
                  bottom: 0,
                  backgroundColor: theme.palette.background.paper, // Biar nggak transparan
                  zIndex: 1,
                }}
              >
                <TableCell></TableCell>
                <TableCell colSpan={5}>Jumlah</TableCell>
                <TableCell align="right">{totalJumlahGigi}</TableCell>
                <TableCell align="right">
                  {formatCurrency(totalBiayaPasang)}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(totalBiayaPerbaikan)}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(totalPendapatan)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Earning;
