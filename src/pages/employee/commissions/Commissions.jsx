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
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Button,
} from "@mui/material";
import React, { useState } from "react";
import useListQueue from "../../../hooks/useListQueue";
import moment from "moment";
import { DatePicker, DesktopDatePicker } from "@mui/x-date-pickers";
import { formatCurrency, safeArray } from "../../../utils/common";
import { Visibility, VisibilityOff } from "@mui/icons-material";

// Helper untuk group by karyawan
const groupBy = (arr, key) => {
  const grouped = safeArray(arr).reduce((acc, item) => {
    const groupKey = item[key] ?? "null"; // jika null/undefined, pakai key khusus
    acc[groupKey] = [...(acc[groupKey] || []), item];
    return acc;
  }, {});

  // Optional: Susun ulang, taruh '__null__' di paling bawah
  const ordered = {};
  Object.keys(grouped)
    .filter((k) => k !== "null")
    .sort() // optional: bisa diurut abjad
    .forEach((k) => (ordered[k] = grouped[k]));

  if (grouped["null"]) {
    ordered["null"] = grouped["null"];
  }

  return ordered;
};

const Commissions = () => {
  const theme = useTheme();
  const [mode, setMode] = useState("harian");
  const [date, setDate] = useState(moment());
  const { data, error, isLoading } = useListQueue(
    date.format(mode === "harian" ? "YYYY-MM-DD" : "YYYY-MM"),
    ""
  );
  const [password, setPassword] = useState("");
  const [isPassed, setIsPassed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const groupedData = groupBy(data, "nama_karyawan");

  const totalJumlahGigi = safeArray(data).reduce(
    (sum, item) => sum + item.jml_gigi,
    0
  );
  const totalBiayaPasang = safeArray(data).reduce(
    (sum, item) => sum + item.total_biaya,
    0
  );
  const totalKomisiKolektif = safeArray(data).reduce(
    (sum, item) => sum + item.nkomisi_kolektif,
    0
  );
  const totalKomisiPribadi = safeArray(data).reduce(
    (sum, item) => sum + item.nkomisi_pribadi,
    0
  );
  const totalBiayaPerbaikan = safeArray(data).reduce(
    (sum, item) => sum + item.biaya_perbaikan,
    0
  );
  const totalKomisiPerbaikan = safeArray(data).reduce(
    (sum, item) => sum + item.komisi_perbaikan,
    0
  );
  const totalJumlahKomisiPribadi = safeArray(data).reduce((sum, item) => {
    return sum + item.nkomisi_pribadi + item.komisi_perbaikan;
  }, 0);
  const totalPendapatan = totalBiayaPasang + totalBiayaPerbaikan;
  const totalKomisi =
    totalKomisiKolektif + totalKomisiPribadi + totalKomisiPerbaikan;

  const totalGigi40 = safeArray(data).reduce((sum, item) => {
    if (item?.tarif === 40000) {
      return ++sum;
    }
    return sum;
  }, 0);
  const totalGigi60 = safeArray(data).reduce((sum, item) => {
    if (item?.tarif === 60000) {
      return ++sum;
    }
    return sum;
  }, 0);
  const totalGigi160 = safeArray(data).reduce((sum, item) => {
    if (item?.tarif === 160000) {
      return ++sum;
    }
    return sum;
  }, 0);

  const checkPassword = (event) => {
    event.preventDefault();
    if (password === "kancil08") {
      setIsPassed(true);
    }
  };

  if (!isPassed)
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        sx={{ height: "80%" }}
      >
        <Paper sx={{ p: 2, width: 400 }}>
          <form onSubmit={checkPassword}>
            <Typography>Masukkan Password</Typography>
            <TextField
              fullWidth
              type={isVisible ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setIsVisible(!isVisible)}>
                      {isVisible ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ my: 2 }}
            />
            <Button variant="contained" fullWidth type="submit">
              Simpan
            </Button>
          </form>
        </Paper>
      </Box>
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
          Laporan Komisi Karyawan
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
        <>
          <TableContainer
            component={Paper}
            sx={{ overflow: "auto", maxHeight: "75vh" }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No</TableCell>
                  <TableCell>Invoice</TableCell>
                  <TableCell>Tanggal Transaksi</TableCell>
                  <TableCell>Nama Pasien</TableCell>
                  <TableCell>Tindakan</TableCell>
                  <TableCell>Keterangan</TableCell>
                  <TableCell>Tarif / Gigi</TableCell>
                  <TableCell>Jml Gigi</TableCell>
                  <TableCell>Biaya Pasang</TableCell>
                  <TableCell>Komisi Kolektif</TableCell>
                  <TableCell>Komisi Pribadi</TableCell>
                  <TableCell>Biaya Perbaikan</TableCell>
                  <TableCell>Komisi Perbaikan</TableCell>
                  <TableCell>Jumlah Komisi Pribadi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(groupedData).map(([nama, rows], index) => {
                  const totalKomisiPribadi = rows.reduce(
                    (acc, r) => acc + (r?.nkomisi_pribadi || 0),
                    0
                  );
                  const totalKomisiPerbaikan = rows.reduce(
                    (acc, r) => acc + (r?.komisi_perbaikan || 0),
                    0
                  );
                  const totalJumlah = totalKomisiPribadi + totalKomisiPerbaikan;

                  return (
                    <React.Fragment key={nama}>
                      <TableRow hover>
                        <TableCell>{index + 1}.</TableCell>
                        <TableCell colSpan={8}>
                          <strong>
                            {nama === "null" ? "Belum diproses" : nama}
                          </strong>
                        </TableCell>
                        <TableCell />
                        <TableCell align="right">
                          {totalKomisiPribadi.toLocaleString()}
                        </TableCell>
                        <TableCell />
                        <TableCell align="right">
                          {totalKomisiPerbaikan.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          {totalJumlah.toLocaleString()}
                        </TableCell>
                      </TableRow>

                      {rows.map((row, idx) => (
                        <TableRow hover key={row.id}>
                          <TableCell align="right">
                            {mode === "harian"
                              ? String.fromCharCode(97 + idx)
                              : ++idx}
                          </TableCell>
                          <TableCell>#SK{row.nopendaftaran}#</TableCell>
                          <TableCell>
                            {row?.tanggal
                              ? moment(row.tanggal).format("DD/MM/YYYY")
                              : ""}
                          </TableCell>
                          <TableCell>{row.nmpasien}</TableCell>
                          <TableCell>{row.nama_tindakan}</TableCell>
                          <TableCell>{row.ket}</TableCell>
                          <TableCell align="right">
                            {row.tarif.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">{row.jml_gigi}</TableCell>
                          <TableCell align="right">
                            {row.total_biaya.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            {row.nkomisi_kolektif.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            {row?.nkomisi_pribadi?.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            {row.biaya_perbaikan.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            {row?.komisi_perbaikan.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            {(
                              row?.nkomisi_pribadi + row?.komisi_perbaikan
                            ).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  );
                })}
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
                  <TableCell colSpan={6}>Jumlah</TableCell>
                  <TableCell align="right">{totalJumlahGigi}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(totalBiayaPasang)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(totalKomisiKolektif)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(totalKomisiPribadi)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(totalBiayaPerbaikan)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(totalKomisiPerbaikan)}
                  </TableCell>
                  {/* komisi perbaikan lagi? */}
                  <TableCell align="right">
                    {formatCurrency(totalJumlahKomisiPribadi)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Stack gap={2} alignItems="center" sx={{ mt: 2 }}>
                <Typography variant="h6">REKAP TRANSAKSI</Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>Pemasangan</TableCell>
                        <TableCell>
                          {formatCurrency(totalBiayaPasang)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Perbaikan</TableCell>
                        <TableCell>
                          {formatCurrency(totalBiayaPerbaikan)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Pendapatan</TableCell>
                        <TableCell>
                          {formatCurrency(
                            totalBiayaPasang + totalBiayaPerbaikan
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Komisi Kolektif</TableCell>
                        <TableCell>
                          {formatCurrency(totalKomisiKolektif)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Komisi Pribadi</TableCell>
                        <TableCell>
                          {formatCurrency(totalKomisiPribadi)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Komisi Perbaikan</TableCell>
                        <TableCell>
                          {formatCurrency(totalKomisiPerbaikan)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Komisi</TableCell>
                        <TableCell>{formatCurrency(totalKomisi)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Pendapatan - Total Komisi</TableCell>
                        <TableCell>
                          {formatCurrency(totalPendapatan - totalKomisi)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack gap={2} alignItems="center" sx={{ mt: 2 }}>
                <Typography variant="h6">REKAP PER TARIF GIGI</Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Uraian</TableCell>
                        <TableCell>Jumlah</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Rp. 40.000</TableCell>
                        <TableCell>{totalGigi40}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Rp. 60.000</TableCell>
                        <TableCell>{totalGigi60}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Rp. 160.000</TableCell>
                        <TableCell>{totalGigi160}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Commissions;
