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
import moment from "moment";
import { DatePicker } from "@mui/x-date-pickers";
import { formatCurrency, safeArray } from "../../../utils/common";
import { useFetchRekapPendapatan } from "../../../hooks/useRekapPendapatan";

moment.locale("id");

const SummaryEarning = () => {
  const theme = useTheme();
  const [mode, setMode] = useState("bulanan");
  const [date, setDate] = useState(moment());
  const { data, error, isLoading } = useFetchRekapPendapatan(
    mode,
    date.format("YYYY"),
    date.format("M")
  );

  const totalPemasangan = safeArray(data?.rekap).reduce(
    (sum, item) => sum + item.total_pemasangan,
    0
  );
  const totalPerbaikan = safeArray(data?.rekap).reduce(
    (sum, item) => sum + item.total_perbaikan,
    0
  );
  const totalJumlahPendapatan = safeArray(data?.rekap).reduce(
    (sum, item) => sum + item.jumlah_pendapatan,
    0
  );

  return (
    <Box p={2}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" mb={2}>
          Rekap Pendapatan
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Tabs
            value={mode}
            onChange={(_, newValue) => setMode(newValue)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Bulanan" value="bulanan" />
            <Tab label="Tahunan" value="tahunan" />
          </Tabs>

          {mode === "bulanan" ? (
            <DatePicker
              views={["month", "year"]}
              label="Pilih Bulan"
              maxDate={moment()}
              value={date}
              format="MM/YYYY"
              onChange={(value) => {
                if (value) setDate(moment(value));
              }}
            />
          ) : (
            <DatePicker
              views={["year"]}
              label="Pilih Tahun"
              maxDate={moment()}
              value={date}
              format="YYYY"
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
                <TableCell align="center">No</TableCell>
                <TableCell align="center">
                  {mode === "bulanan" ? "Tanggal Transaksi" : "Bulan"}
                </TableCell>
                <TableCell align="center">Pemasangan</TableCell>
                <TableCell align="center">Perbaikan</TableCell>
                <TableCell align="center">Jumlah Pendapatan</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {safeArray(data?.rekap).map((row, idx) => (
                <TableRow hover key={idx}>
                  <TableCell align="center">{++idx}</TableCell>
                  <TableCell align="center">
                    {mode === "bulanan"
                      ? row?.tanggal
                        ? moment(row.tanggal).format("DD/MM/YYYY")
                        : ""
                      : row?.bulan
                      ? moment(row.bulan, "MM").format("MMMM")
                      : ""}
                  </TableCell>
                  <TableCell align="center">
                    {row?.total_pemasangan?.toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    {row?.total_perbaikan?.toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    {row?.jumlah_pendapatan?.toLocaleString()}
                  </TableCell>
                  <TableCell align="center"></TableCell>
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
                <TableCell align="center">Jumlah</TableCell>
                <TableCell align="center">
                  {formatCurrency(totalPemasangan)}
                </TableCell>
                <TableCell align="center">
                  {formatCurrency(totalPerbaikan)}
                </TableCell>
                <TableCell align="center">
                  {formatCurrency(totalJumlahPendapatan)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default SummaryEarning;
