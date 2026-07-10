import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Autocomplete,
  FormControl,
  FormLabel,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Stack,
  Divider,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Box,
  alpha,
} from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import moment from "moment";
import { useForm, Controller } from "react-hook-form";
import { useFetchKaryawan } from "../../hooks/useFetchKaryawan";
import { useFetchJenisGigi } from "../../hooks/useFetchJenisGigi";
import { formatCurrency, safeArray } from "../../utils/common";
import {
  useCreateDeposit,
  useUpdateDeposit,
} from "../../hooks/useMutateDeposit";
import { useFetchPDFDeposit } from "../../hooks/useFetchPDFDeposit";
import { Print, RequestQuote } from "@mui/icons-material";
import { useAddToQueueMutation } from "../../hooks/useMutateQueue";
import usePdfStore from "../../store/pdfStore";
import { CONFIRM_DELETE } from "../../constants/variables";

const DialogDeposit = ({ isOpen, onClose, data }) => {
  const { data: masterKaryawan } = useFetchKaryawan();
  const { data: jenisGigi } = useFetchJenisGigi();
  const mutation = useCreateDeposit();
  const editMutation = useUpdateDeposit();
  const addToQueue = useAddToQueueMutation();
  const { openDialog, setPdfURL, setLoading, setError } = usePdfStore();
  const [dialog, setDialog] = useState(false);

  // Kalau `data` datang dari row antrian (daftar) yang udah punya deposit,
  // field deposit-nya (jumlah, tarif_per_gigi, dst) nyempil di
  // `data.detail_deposit` (hasil include Dp di backend), bukan flat di `data`.
  const deposit = data?.detail_deposit || data || {};

  const defaultValues = {
    ...data,
    tanggal: deposit?.tanggal || data?.tanggal || moment().format("YYYY-MM-DD"),
    tanggal_diambil: deposit?.tanggal_diambil || null,
    telp: deposit?.telp || data?.telp || "",
    jumlah: deposit?.jumlah || "",
    idkaryawan: deposit?.idkaryawan || null,
    jumlah_gigi: deposit?.jumlah_gigi || null,
    tarif_per_gigi: deposit?.tarif_per_gigi || "",
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({ defaultValues });

  const jumlahTagihan = watch("tarif_per_gigi") * watch("jumlah_gigi");
  const sisaPembayaran = jumlahTagihan - watch("jumlah");

  const [iddpResult, setIddpResult] = useState(data?.iddp);

  const { isFetching, refetch } = useFetchPDFDeposit(iddpResult);

  const onSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        tanggal: moment(formData.tanggal).format("YYYY-MM-DD"),
        tanggal_diambil: formData.tanggal_diambil
          ? moment(formData.tanggal_diambil).format("YYYY-MM-DD")
          : null,
      };
      const mutationFunc = (data?.iddp ? editMutation : mutation).mutateAsync;
      const result = await mutationFunc(payload);
      if (result?.iddp) {
        setIddpResult(result.iddp);
      }

      if (!data?.iddp && result?.iddp) {
        setDialog(CONFIRM_DELETE);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePrintDeposit = async () => {
    try {
      openDialog("Kwitansi Deposit");
      setLoading(true);
      const { data } = await refetch();
      if (data) {
        const url = URL.createObjectURL(data);
        setPdfURL(url);
        setLoading(false);
      }
    } catch (error) {
      setError(error?.message);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <RequestQuote color="primary" />
          Input Deposit
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12}>
              <Stack
                direction="row"
                flexWrap="wrap"
                gap={3}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    ID Pasien
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {data?.nomorpasien || "-"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Nama
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {data?.nama_pasien || "-"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Alamat
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {data?.alamat || "-"}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="tanggal"
                control={control}
                rules={{ required: "Tanggal wajib diisi" }}
                render={({ field }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Tanggal Input"
                    format="DD/MM/YYYY"
                    onChange={(val) => field.onChange(val)}
                    value={field.value ? moment(field.value) : null}
                    sx={{ width: "100%" }}
                    slotProps={{ actionBar: { actions: ["today"] } }}
                  />
                )}
              />
              {errors.tanggal && (
                <Typography color="error" variant="caption">
                  {errors.tanggal.message}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="tanggal_diambil"
                control={control}
                rules={{ required: "Tanggal diambil wajib diisi" }}
                render={({ field }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Tanggal Diambil"
                    format="DD/MM/YYYY"
                    onChange={(val) => field.onChange(val)}
                    value={field.value ? moment(field.value) : null}
                    sx={{ width: "100%" }}
                    slotProps={{ actionBar: { actions: ["today"] } }}
                    minDate={moment()}
                  />
                )}
              />
              {errors.tanggal_diambil && (
                <Typography color="error" variant="caption">
                  {errors.tanggal_diambil.message}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="telp"
                control={control}
                rules={{ required: "Nomor telpon wajib diisi" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Nomor Telepon"
                    autoComplete="off"
                  />
                )}
              />
              {errors.telp && (
                <Typography color="error" variant="caption">
                  {errors.telp.message}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="jumlah"
                control={control}
                rules={{ required: "Jumlah deposit wajib diisi" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Jumlah Deposit"
                    value={field.value ? formatCurrency(field.value) : ""}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, "");
                      field.onChange(rawValue ? Number(rawValue) : "");
                    }}
                    autoComplete="off"
                  />
                )}
              />
              {errors.jumlah && (
                <Typography color="error" variant="caption">
                  {errors.jumlah.message}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="idkaryawan"
                control={control}
                rules={{ required: "Teknisi wajib dipilih" }}
                render={({ field }) => (
                  <Autocomplete
                    options={safeArray(masterKaryawan)}
                    getOptionLabel={(option) => option?.nmkaryawan || ""}
                    value={
                      safeArray(masterKaryawan).find(
                        (emp) => emp.idkaryawan == field.value
                      ) || null
                    }
                    onChange={(_, val) => field.onChange(val?.idkaryawan)}
                    renderInput={(params) => (
                      <TextField {...params} label="Nama Teknisi" fullWidth />
                    )}
                  />
                )}
              />
              {errors.idkaryawan && (
                <Typography color="error" variant="caption">
                  {errors.idkaryawan.message}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="jumlah_gigi"
                control={control}
                rules={{ required: "Jumlah gigi wajib diisi" }}
                render={({ field }) => (
                  <Autocomplete
                    options={Array.from({ length: 28 }, (_, i) => i + 1)}
                    getOptionLabel={(option) => String(option)}
                    value={field.value || null}
                    onChange={(_, val) => field.onChange(val || "")}
                    renderInput={(params) => (
                      <TextField {...params} label="Jumlah Gigi" fullWidth />
                    )}
                  />
                )}
              />
              {errors.jumlah_gigi && (
                <Typography color="error" variant="caption">
                  {errors.jumlah_gigi.message}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={Boolean(errors.tarif_per_gigi)}>
                <FormLabel required>Tarif Per Gigi</FormLabel>
                <Controller
                  name="tarif_per_gigi"
                  control={control}
                  rules={{ required: "Tarif per gigi wajib dipilih" }}
                  render={({ field }) => (
                    <RadioGroup
                      row
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      {safeArray(jenisGigi).map((item) => (
                        <FormControlLabel
                          key={item.id}
                          control={<Radio />}
                          value={item.tarif}
                          label={formatCurrency(item.tarif)}
                        />
                      ))}
                    </RadioGroup>
                  )}
                />
                {errors.tarif_per_gigi && (
                  <FormHelperText>{errors.tarif_per_gigi.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>

          {/* Ringkasan */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            Ringkasan
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Typography>Jumlah Tagihan</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography>{formatCurrency(jumlahTagihan)}</Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography>Deposit</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography>- {formatCurrency(watch("jumlah"))}</Typography>
                  </TableCell>
                </TableRow>
                <TableRow
                  sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06) }}
                >
                  <TableCell>
                    <Typography fontWeight={700}>
                      {sisaPembayaran >= 0 ? "Sisa Pembayaran" : "Kelebihan Pembayaran"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      fontWeight={700}
                      color={sisaPembayaran < 0 ? "error.main" : "text.primary"}
                    >
                      {formatCurrency(sisaPembayaran)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">
            Tutup
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            color="primary"
            variant="contained"
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Menambahkan..." : "Simpan"}
          </Button>
          {iddpResult && (
            <Button
              loading={isFetching}
              onClick={handlePrintDeposit}
              color="success"
              variant="contained"
              disabled={!iddpResult}
              startIcon={<Print />}
            >
              Cetak Deposit
            </Button>
          )}
        </DialogActions>
      </Dialog>
      {dialog === CONFIRM_DELETE && (
        <Dialog open onClose={() => setDialog(false)}>
          <DialogTitle>Daftarkan ke Antrian?</DialogTitle>
          <DialogContent>
            <Typography>
              {`Apakah kamu ingin mendaftarkan pasien ini di tanggal ${moment(
                watch("tanggal_diambil")
              ).format("DD/MM/YYYY")}?`}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="outlined" color="inherit" onClick={() => setDialog(false)}>
              Tutup
            </Button>
            <Button
              variant="contained"
              onClick={async () => {
                try {
                  await addToQueue.mutateAsync({
                    ...data,
                    tanggal_pelaks: watch("tanggal_diambil"),
                  });
                  setDialog(false);
                } catch {
                  setDialog(false);
                }
              }}
              color="primary"
              disabled={addToQueue.isPending}
            >
              {addToQueue.isPending ? "Memproses..." : "Ya, Daftarkan"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default DialogDeposit;
