import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Alert,
  Typography,
} from "@mui/material";
import { SwapHoriz } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import { fetcher } from "../../../utils/fetcher";
import { safeArray } from "../../../utils/common";
import { useMoveQueueMutation } from "../../../hooks/useMutateQueue";

const DialogMoveTransaction = ({ isOpen, onClose, transactions, currentNomorpasien }) => {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [error, setError] = useState("");
  const debouncedSetSearch = useDebouncedCallback(setSearch, 400);

  const { data, isFetching } = useQuery({
    queryKey: ["search_pasien_move", search],
    queryFn: () =>
      fetcher(
        `${import.meta.env.VITE_API_BASE_URL}/pasien?search=${search}&limit=10`
      ),
    enabled: isOpen && search.length > 0,
  });

  const options = safeArray(data?.data).filter(
    (item) => item.nomorpasien !== currentNomorpasien
  );

  const moveMutation = useMoveQueueMutation();
  const count = safeArray(transactions).length;

  const handleClose = () => {
    setSearch("");
    setSelectedPatient(null);
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedPatient) {
      setError("Pilih pasien tujuan terlebih dahulu.");
      return;
    }
    try {
      // Backend cuma sanggup pindah 1 transaksi per request, jadi kirim
      // paralel per transaksi terpilih
      await Promise.all(
        safeArray(transactions).map((item) =>
          moveMutation.mutateAsync({
            id: item.id,
            nomorpasien_tujuan: selectedPatient.nomorpasien,
          })
        )
      );
      handleClose();
    } catch {
      setError("Gagal memindahkan transaksi.");
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <SwapHoriz color="primary" />
        Pindahkan {count > 1 ? `${count} Transaksi` : "Transaksi"}
      </DialogTitle>
      <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <Typography variant="body2" color="text.secondary">
          {count > 1
            ? `${count} transaksi terpilih akan dipindahkan ke pasien lain.`
            : `Transaksi tanggal ${
                transactions?.[0]?.tanggal_pelaks
                  ? new Date(transactions[0].tanggal_pelaks).toLocaleDateString("id-ID")
                  : "-"
              } (#SK${transactions?.[0]?.nopendaftaran}#) akan dipindahkan ke pasien lain.`}{" "}
          Kalau transaksi punya deposit terkait, deposit-nya ikut dipindahkan juga.
        </Typography>
        <Autocomplete
          options={options}
          loading={isFetching}
          filterOptions={(x) => x}
          getOptionLabel={(option) =>
            option?.nmpasien ? `${option.nomorpasien} - ${option.nmpasien}` : ""
          }
          value={selectedPatient}
          onChange={(_, newValue) => setSelectedPatient(newValue)}
          onInputChange={(_, newInput) => debouncedSetSearch(newInput)}
          noOptionsText={search ? "Pasien tidak ditemukan" : "Ketik nama atau nomor pasien"}
          renderInput={(params) => (
            <TextField {...params} label="Cari Pasien Tujuan" placeholder="Nama atau nomor pasien" fullWidth />
          )}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} variant="outlined" color="inherit">
          Tutup
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={moveMutation.isLoading}
        >
          {moveMutation.isLoading ? "Memindahkan..." : "Pindahkan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogMoveTransaction;
