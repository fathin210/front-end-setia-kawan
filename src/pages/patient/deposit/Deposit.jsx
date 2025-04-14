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
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  DialogContent,
} from "@mui/material";
import React, { useState } from "react";
import moment from "moment";
import { DatePicker, DesktopDatePicker } from "@mui/x-date-pickers";
import { safeArray } from "../../../utils/common";
import { useFetchDeposit } from "../../../hooks/useFetchDeposit";
import { Close, Delete, Edit, MoreVert, Print } from "@mui/icons-material";
import DialogDeposit from "../../home/DialogDeposit";
import { CONFIRM_DELETE, DEPOSIT, PRINT } from "../../../constants/variables";
import { useDeleteDeposit } from "../../../hooks/useMutateDeposit";
import { useFetchPDFDeposit } from "../../../hooks/useFetchPDFDeposit";
import Pdf from "../../../components/Pdf";

const Deposit = () => {
  const { data, error, isLoading } = useFetchDeposit();
  const deleteMutation = useDeleteDeposit();

  const [mode, setMode] = useState("harian");
  const [date, setDate] = useState(moment());
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialog, setDialog] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [pdfURL, setPdfURL] = useState("");

  const { isFetching, refetch } = useFetchPDFDeposit(selectedData?.iddp);

  const open = Boolean(anchorEl);
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCloseDialog = () => {
    setDialog(false);
    setSelectedData(null);
    handleClose();
  };

  const handleOpenDepositDialog = () => {
    setDialog(DEPOSIT);
    handleClose();
  };

  const handleOpenConfirmationDialog = () => {
    setDialog(CONFIRM_DELETE);
    handleClose();
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(selectedData);
      handleCloseDialog();
    } catch (error) {}
  };

  const handlePrintDeposit = async () => {
    const { data } = await refetch();
    if (data) {
      const url = URL.createObjectURL(data);
      setPdfURL(url);
      setDialog(PRINT);
    }
  };

  return (
    <Box p={2}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" mb={2}>
          Deposit
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
                <TableCell>Tanggal Diambil</TableCell>
                <TableCell>Invoice</TableCell>
                <TableCell>Nama Pasien</TableCell>
                <TableCell>No. Telpon</TableCell>
                <TableCell>Alamat</TableCell>
                <TableCell>Teknisi</TableCell>
                <TableCell>Jumlah Gigi</TableCell>
                <TableCell>Tarif Gigi</TableCell>
                <TableCell>Jumlah</TableCell>
                <TableCell>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {safeArray(data).map((row, idx) => (
                <TableRow hover key={row.iddp}>
                  <TableCell>{++idx}</TableCell>
                  <TableCell>
                    {row?.tanggal
                      ? moment(row.tanggal).format("DD/MM/YYYY")
                      : ""}
                  </TableCell>
                  <TableCell>
                    {row?.tanggal_diambil
                      ? moment(row.tanggal_diambil).format("DD/MM/YYYY")
                      : ""}
                  </TableCell>
                  <TableCell>#SK{row.nodp}#</TableCell>
                  <TableCell>{row.nmpasien}</TableCell>
                  <TableCell>{row.telp}</TableCell>
                  <TableCell>{row.alamat}</TableCell>
                  <TableCell>{row?.nama_karyawan}</TableCell>
                  <TableCell>{row.jumlah_gigi || ""}</TableCell>
                  <TableCell>{row?.tarif_per_gigi?.toLocaleString()}</TableCell>
                  <TableCell>{row?.jumlah?.toLocaleString()}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={(event) => {
                        setSelectedData(row);
                        handleMenuClick(event);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleOpenDepositDialog}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Ubah DP
        </MenuItem>
        <MenuItem onClick={handleOpenConfirmationDialog}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Hapus DP
        </MenuItem>
        <MenuItem onClick={handlePrintDeposit} disabled={isFetching}>
          {isFetching ? (
            <CircularProgress size={18} sx={{ mr: 1 }} />
          ) : (
            <Print fontSize="small" sx={{ mr: 1 }} />
          )}
          Cetak DP
        </MenuItem>
      </Menu>
      {dialog === DEPOSIT && (
        <DialogDeposit
          isOpen={dialog === DEPOSIT}
          data={selectedData}
          onClose={handleCloseDialog}
        />
      )}
      {dialog === CONFIRM_DELETE && (
        <Dialog open onClose={handleCloseDialog}>
          <DialogTitle>
            Apakah kamu yakin ingin menghapus rincian ini?
          </DialogTitle>
          <DialogActions>
            <Button variant="contained" onClick={handleCloseDialog}>
              Batal
            </Button>
            <Button
              variant="contained"
              onClick={handleDelete}
              color="error"
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {dialog === PRINT && (
        <Dialog open onClose={handleCloseDialog} fullWidth maxWidth="md">
          <DialogTitle>Cetak Kwitansi Deposit</DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={(theme) => ({
              position: "absolute",
              right: 8,
              top: 8,
              color: theme.palette.grey[500],
            })}
          >
            <Close />
          </IconButton>
          <DialogContent>
            <Pdf pdfURL={pdfURL} title="Kwitansi" />
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default Deposit;
