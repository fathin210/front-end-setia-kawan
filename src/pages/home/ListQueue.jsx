import React, { useState } from "react";
import {
  Box,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Typography,
  Autocomplete,
  alpha,
} from "@mui/material";
import { formatCurrency, safeArray } from "../../utils/common";
import { useDebouncedCallback } from "use-debounce";
import {
  MoreVert,
  Search,
  Close,
  ReceiptLong,
  DeleteOutline,
  RestartAlt,
  RequestQuote,
  WarningAmber,
  EventBusy,
  Flag,
  Edit,
} from "@mui/icons-material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import moment from "moment";
import useListQueue from "../../hooks/useListQueue";
import { useFetchStatus } from "../../hooks/useFetchStatus";
import DialogQueueDetail from "./DialogQueueDetail";
import DialogEditQueue from "./DialogEditQueue";
import {
  ADD_QUEUE_DETAIL,
  CLEAR_QUEUE,
  CONFIRM_DELETE,
  DEPOSIT,
  EDIT_STATUS,
  EDIT_QUEUE,
} from "../../constants/variables";
import {
  useClearQueueMutation,
  useDeleteQueue,
  useUpdateQueueStatus,
} from "../../hooks/useMutateQueue";
import DialogDeposit from "./DialogDeposit";

const ListQueue = () => {
  const [date, setDate] = useState(moment().format("YYYY-MM-DD"));
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [dialog, setDialog] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [status, setStatus] = useState("process");

  const debouncedUpdateSearch = useDebouncedCallback((value) => {
    setSearch(value);
  }, 500);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedUpdateSearch(value);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    debouncedUpdateSearch.cancel(); // optional, untuk menghentikan debounce
  };


  const { data, error, isLoading } = useListQueue(
    date,
    search,
    status === "finish" ? "x" : ""
  );
  const { mutate: clearQueue, isLoading: isClearing } = useClearQueueMutation({
    onComplete: () => {
      setDialog(false);
      setSelectedQueue(null);
    },
  });

  const { mutateAsync: deleteQueue } = useDeleteQueue();
  const { data: masterStatus } = useFetchStatus();
  const updateStatusMutation = useUpdateQueueStatus();
  const [selectedStatus, setSelectedStatus] = useState(null);

  const handleDialogOpen = (dialog) => {
    setDialog(dialog);
  };

  const handleDialogClose = () => {
    setDialog(false);
    setSelectedQueue(null);
    setSelectedStatus(null);
  };

  const handleMenuOpen = (event, queue) => {
    setAnchorEl(event.currentTarget);
    setSelectedQueue(queue);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Paper
        variant="outlined"
        sx={{ p: 2, flexGrow: 1, overflow: "auto", height: "86vh" }}
      >
        <Tabs
          value={status}
          onChange={(_, newValue) => setStatus(newValue)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ mb: 2 }}
        >
          <Tab label="Proses" value="process" />
          <Tab label="Selesai" value="finish" />
        </Tabs>
        <Stack direction="row" gap={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            placeholder="Cari Pasien (Tindakan Hari Ini)"
            name="search"
            value={searchInput}
            onChange={handleSearchChange}
            fullWidth
            autoComplete="off"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="start">
                    {searchInput && (
                      <IconButton onClick={clearSearch}>
                        <Close />
                      </IconButton>
                    )}
                  </InputAdornment>
                )
              }
            }}
            sx={{ flex: 1 }}
          />
          <DesktopDatePicker
            sx={{ flex: 1 }}
            format="DD/MM/YYYY"
            label="Tanggal Rincian"
            value={date ? moment(date) : null}
            onChange={(value) => {
              if (value) {
                setDate(moment(value).format("YYYY-MM-DD"));
              }
            }}
            slotProps={{
              actionBar: {
                actions: ["today"],
              },
            }}
          />
        </Stack>

        {isLoading ? (
          <Box display="flex" justifyContent="center" mt={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            Terjadi kesalahan saat mengambil data: {error.message}
          </Alert>
        ) : safeArray(data).length === 0 ? (
          <Stack alignItems="center" justifyContent="center" gap={1} sx={{ py: 6, color: "text.secondary" }}>
            <EventBusy fontSize="large" />
            <Typography variant="body2">
              Tidak ada antrian {status === "finish" ? "yang selesai" : "yang diproses"} hari ini
            </Typography>
          </Stack>
        ) : (
          <TableContainer sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                  }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>No.</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Nama</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tindakan</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Teknisi</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Jumlah Gigi</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Biaya Per Gigi</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Total</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Biaya Perbaikan</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {safeArray(data).map((row, index) => (
                  <TableRow key={row?.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row?.nama_pasien || "-"}</TableCell>
                    <TableCell>{row?.nama_tindakan || "-"}</TableCell>
                    <TableCell>{row?.nama_karyawan || "-"}</TableCell>
                    <TableCell align="right">{row?.jml_gigi || "-"}</TableCell>
                    <TableCell align="right">
                      {row?.tarif ? formatCurrency(row?.tarif) : "-"}
                    </TableCell>
                    <TableCell align="right">
                      {row?.total_biaya ? formatCurrency(row.total_biaya) : "-"}
                    </TableCell>
                    <TableCell align="right">
                      {row?.biaya_perbaikan
                        ? formatCurrency(row.biaya_perbaikan)
                        : "-"}
                    </TableCell>
                    <TableCell>{row?.nama_keterangan || "-"}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Menu Aksi */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleDialogOpen(EDIT_QUEUE);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          Ubah Antrian
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDialogOpen(ADD_QUEUE_DETAIL);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <ReceiptLong fontSize="small" />
          </ListItemIcon>
          Rincian Biaya
        </MenuItem>
        <MenuItem
          onClick={() => {
            setSelectedStatus(
              safeArray(masterStatus).find(
                (item) => item.kdstatus === selectedQueue?.ket
              ) || null
            );
            handleDialogOpen(EDIT_STATUS);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Flag fontSize="small" />
          </ListItemIcon>
          Ubah Status
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDialogOpen(DEPOSIT);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <RequestQuote fontSize="small" />
          </ListItemIcon>
          Deposit
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDialogOpen(CLEAR_QUEUE);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <RestartAlt fontSize="small" />
          </ListItemIcon>
          Reset Data Rincian
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDialogOpen(CONFIRM_DELETE);
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <DeleteOutline fontSize="small" color="error" />
          </ListItemIcon>
          Hapus Rincian
        </MenuItem>
      </Menu>

      {/* DialogQueueDetail */}
      {dialog === ADD_QUEUE_DETAIL && (
        <DialogQueueDetail
          isOpen={dialog === ADD_QUEUE_DETAIL}
          onClose={handleDialogClose}
          queue={selectedQueue} // Pass data antrian yang dipilih ke dialog
        />
      )}

      {dialog === EDIT_QUEUE && (
        <DialogEditQueue
          isOpen={true}
          onClose={handleDialogClose}
          queue={selectedQueue}
        />
      )}

      {dialog === CONFIRM_DELETE && (
        <Dialog open onClose={handleDialogClose}>
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarningAmber color="error" />
            Apakah kamu yakin ingin menghapus rincian ini?
          </DialogTitle>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="outlined" color="inherit" onClick={handleDialogClose}>
              Tutup
            </Button>
            <Button
              variant="contained"
              onClick={async () => {
                try {
                  await deleteQueue(selectedQueue?.id);
                  handleDialogClose();
                } catch (error) {
                  handleDialogClose();
                }
              }}
              color="error"
              disabled={isClearing}
            >
              Ya, Hapus
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {dialog === CLEAR_QUEUE && (
        <Dialog open onClose={handleDialogClose}>
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarningAmber color="error" />
            Apakah kamu yakin ingin mereset data rincian ini?
          </DialogTitle>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="outlined" color="inherit" onClick={handleDialogClose}>
              Tutup
            </Button>
            <Button
              variant="contained"
              onClick={() => clearQueue(selectedQueue)}
              color="error"
              disabled={isClearing}
            >
              {isClearing ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {dialog === DEPOSIT && (
        <DialogDeposit
          isOpen={true}
          data={selectedQueue}
          onClose={handleDialogClose}
        />
      )}
      {dialog === EDIT_STATUS && (
        <Dialog open onClose={handleDialogClose} fullWidth maxWidth="xs">
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Flag color="primary" />
            Ubah Status Antrian
          </DialogTitle>
          <DialogContent dividers sx={{ pt: 2 }}>
            <Autocomplete
              options={safeArray(masterStatus)}
              getOptionLabel={(option) => option?.nmstatus || ""}
              value={selectedStatus}
              onChange={(_, newValue) => setSelectedStatus(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Status" fullWidth />
              )}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="outlined" color="inherit" onClick={handleDialogClose}>
              Tutup
            </Button>
            <Button
              variant="contained"
              disabled={!selectedStatus || updateStatusMutation.isLoading}
              onClick={async () => {
                try {
                  await updateStatusMutation.mutateAsync({
                    id: selectedQueue?.id,
                    ket: selectedStatus?.kdstatus,
                  });
                  handleDialogClose();
                } catch {
                  // alert kegagalan sudah ditangani mutation
                }
              }}
            >
              {updateStatusMutation.isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default ListQueue;
