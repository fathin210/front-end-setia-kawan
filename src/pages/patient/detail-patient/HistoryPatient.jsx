import {
  Alert,
  Box,
  Checkbox,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { SwapHoriz } from "@mui/icons-material";
import moment from "moment";
import React from "react";
import { formatCurrency, safeArray } from "../../../utils/common";

const HistoryPatient = ({
  listQueue = {},
  showTitle = true,
  enableActions = false,
  selectedIds = [],
  onToggleSelectAll,
  onToggleSelectRow,
  onMoveRow,
}) => {
  const { isLoading, error, data: rincianData } = listQueue;
  const rows = safeArray(rincianData);
  const allSelected = rows.length > 0 && selectedIds.length === rows.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  return (
    <>
      {showTitle && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Riwayat Rincian Pelayanan
          </Typography>
          <Divider sx={{ my: 2 }} />
        </Box>
      )}

      {/* STATE LOADING */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* STATE ERROR */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Terjadi kesalahan saat mengambil data: {error.message}
        </Alert>
      )}

      {/* TABLE RINCIAN */}
      {!isLoading && !error && rows.length > 0 ? (
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2, boxShadow: 3 }}
        >
          <Table>
            <TableHead sx={{ background: "#1976d2" }}>
              <TableRow>
                {enableActions && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      sx={{ color: "#fff" }}
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={onToggleSelectAll}
                    />
                  </TableCell>
                )}
                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  Tanggal Transaksi
                </TableCell>
                {enableActions && (
                  <>
                    <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                      Invoice
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                      Nama Pasien
                    </TableCell>
                  </>
                )}
                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  Tindakan
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  Teknisi
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  Jumlah Gigi
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  Tarif Gigi
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  Biaya Perbaikan
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  Total Biaya
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  Keterangan
                </TableCell>
                {enableActions && (
                  <TableCell
                    sx={{ fontWeight: "bold", color: "#fff" }}
                    align="center"
                  >
                    Aksi
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} selected={selectedIds.includes(row.id)}>
                  {enableActions && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.includes(row.id)}
                        onChange={() => onToggleSelectRow(row.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    {row?.tanggal_pelaks
                      ? moment(row?.tanggal_pelaks).format("DD-MM-YYYY")
                      : ""}
                  </TableCell>
                  {enableActions && (
                    <>
                      <TableCell>#SK{row.nopendaftaran}#</TableCell>
                      <TableCell>{row.nama_pasien}</TableCell>
                    </>
                  )}
                  <TableCell>{row?.nama_tindakan || "-"}</TableCell>
                  <TableCell>{row?.nama_karyawan || "-"}</TableCell>
                  <TableCell>{row?.jml_gigi || "-"}</TableCell>
                  <TableCell>{(row?.tarif || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    {(row?.biaya_perbaikan || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(row.total_biaya + row.biaya_perbaikan)}
                  </TableCell>
                  <TableCell>
                    {(enableActions ? row?.ket : row?.nama_keterangan) || "-"}
                  </TableCell>
                  {enableActions && (
                    <TableCell align="center">
                      <Tooltip title="Pindahkan transaksi ke pasien lain">
                        <IconButton
                          onClick={() => onMoveRow(row)}
                          color="primary"
                        >
                          <SwapHoriz fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        !isLoading &&
        !error && (
          <Typography sx={{ textAlign: "center", color: "gray", mt: 3 }}>
            Tidak ada data rincian pelayanan.
          </Typography>
        )
      )}
    </>
  );
};

export default HistoryPatient;
