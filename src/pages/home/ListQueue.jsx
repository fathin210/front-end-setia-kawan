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
  TableHead,
  TableRow,
  TextField,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import { formatCurrency, safeArray } from "../../utils/common";
import { useDebouncedCallback } from "use-debounce";
import { MoreVert, Search } from "@mui/icons-material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import moment from "moment";
import useListQueue from "../../hooks/useListQueue";
import DialogQueueDetail from "./DialogQueueDetail";
import {
  ADD_QUEUE_DETAIL,
  CLEAR_QUEUE,
  CONFIRM_DELETE,
  DEPOSIT,
} from "../../constants/variables";
import {
  useClearQueueMutation,
  useDeleteQueue,
} from "../../hooks/useMutateQueue";
import DialogDeposit from "./DialogDeposit";

const ListQueue = () => {
  const [date, setDate] = useState(moment().format("YYYY-MM-DD"));
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [status, setStatus] = useState("process");

  const debouncedSetSearch = useDebouncedCallback((value) => {
    setSearch(value);
  }, 500);

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

  const handleDialogOpen = (dialog) => {
    setDialog(dialog);
  };

  const handleDialogClose = () => {
    setDialog(false);
    setSelectedQueue(null);
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
      <Paper sx={{ p: 2, flexGrow: 1, overflow: "auto", height: "86vh" }}>
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
        <Stack direction="row" gap={2} alignItems="center">
          <TextField
            placeholder="Cari Pasien (Tindakan Hari Ini)"
            name="search"
            onChange={(event) => debouncedSetSearch(event.target.value)}
            fullWidth
            autoComplete="off"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
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
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>No.</TableCell>
                <TableCell>Nama</TableCell>
                <TableCell>Tindakan</TableCell>
                <TableCell>Teknisi</TableCell>
                <TableCell>Jumlah Gigi</TableCell>
                <TableCell>Biaya Per Gigi</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Biaya Perbaikan</TableCell>
                <TableCell>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {safeArray(data).map((row, index) => (
                <TableRow key={row?.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row?.nmpasien || "-"}</TableCell>
                  <TableCell>{row?.nama_tindakan || "-"}</TableCell>
                  <TableCell>{row?.nama_karyawan || "-"}</TableCell>
                  <TableCell>{row?.jml_gigi || "-"}</TableCell>
                  <TableCell>
                    {row?.tarif ? formatCurrency(row?.tarif) : "-"}
                  </TableCell>
                  <TableCell>
                    {row?.total_biaya ? formatCurrency(row.total_biaya) : "-"}
                  </TableCell>
                  <TableCell>
                    {row?.biaya_perbaikan
                      ? formatCurrency(row.biaya_perbaikan)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
            handleDialogOpen(ADD_QUEUE_DETAIL);
            handleMenuClose();
          }}
        >
          Rincian Biaya
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDialogOpen(CONFIRM_DELETE);
            handleMenuClose();
          }}
        >
          Hapus Rincian
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDialogOpen(CLEAR_QUEUE);
            handleMenuClose();
          }}
        >
          Reset Data Rincian
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDialogOpen(DEPOSIT);
            handleMenuClose();
          }}
        >
          Deposit
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

      {dialog === CONFIRM_DELETE && (
        <Dialog open onClose={handleDialogClose}>
          <DialogTitle>
            Apakah kamu yakin ingin menghapus rincian ini?
          </DialogTitle>
          <DialogActions>
            <Button variant="contained" onClick={handleDialogClose}>
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
          <DialogTitle>
            Apakah kamu yakin ingin mereset data rincian ini?
          </DialogTitle>
          <DialogActions>
            <Button variant="contained" onClick={handleDialogClose}>
              Tutup
            </Button>
            <Button
              variant="contained"
              onClick={() => clearQueue(selectedQueue)}
              color="error"
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
    </>
  );
};

export default ListQueue;
