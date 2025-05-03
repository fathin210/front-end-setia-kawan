import { Alert, Box, CircularProgress, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import moment from 'moment'
import React from 'react'
import { formatCurrency } from '../../../utils/common'

const HistoryPatient = ({ listQueue = {} }) => {
  const { isLoading, error, data: rincianData } = listQueue
  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Riwayat Rincian Pelayanan
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>

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
      {!isLoading && !error && rincianData?.length > 0 ? (
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2, boxShadow: 3 }}
        >
          <Table>
            <TableHead sx={{ background: "#1976d2" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  Tanggal Transaksi
                </TableCell>
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
                  Deposit
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  Keterangan
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rincianData.map((row) => {
                const isDeposit = row?.ket === "D" && row?.detail_deposit
                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      {row?.tanggal_pelaks
                        ? moment(row?.tanggal_pelaks).format("DD-MM-YYYY")
                        : ""}
                    </TableCell>
                    <TableCell>{row?.nama_tindakan || "-"}</TableCell>
                    <TableCell>{isDeposit ? row?.detail_deposit.karyawan.nmkaryawan : row?.nama_karyawan || "-"}</TableCell>
                    <TableCell>{isDeposit ? row.detail_deposit.jumlah_gigi : row?.jml_gigi || "-"}</TableCell>
                    <TableCell>{(isDeposit ? row?.detail_deposit.tarif_per_gigi : row?.tarif || 0).toLocaleString()}</TableCell>
                    <TableCell>{(row?.biaya_perbaikan || 0).toLocaleString()}</TableCell>
                    <TableCell>{formatCurrency(isDeposit ? row.detail_deposit.tarif_per_gigi * row.detail_deposit.jumlah_gigi : row.total_biaya + row.biaya_perbaikan)}</TableCell>
                    <TableCell>{isDeposit ? formatCurrency(row.detail_deposit.jumlah) : "-"}</TableCell>
                    <TableCell>{row?.nama_keterangan || "-"}</TableCell>
                  </TableRow>
                )
              })}
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
      )}</>
  )
}

export default HistoryPatient