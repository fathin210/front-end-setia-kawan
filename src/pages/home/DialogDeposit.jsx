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
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Card,
  CardContent,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Box,
  IconButton,
} from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import moment from "moment";
import { useForm, Controller } from "react-hook-form";
import { useFetchKaryawan } from "../../hooks/useFetchKaryawan";
import { formatCurrency, safeArray } from "../../utils/common";
import {
  useCreateDeposit,
  useUpdateDeposit,
} from "../../hooks/useMutateDeposit";
import { useFetchPDFDeposit } from "../../hooks/useFetchPDFDeposit";
import { Close, Print } from "@mui/icons-material";
import { useAddToQueueMutation } from "../../hooks/useMutateQueue";
import usePdfStore from "../../store/pdfStore";
import { CONFIRM_DELETE } from "../../constants/variables";

const DialogDeposit = ({ isOpen, onClose, data }) => {
  const { data: masterKaryawan } = useFetchKaryawan();
  const mutation = useCreateDeposit();
  const editMutation = useUpdateDeposit();
  const addToQueue = useAddToQueueMutation();
  const { openDialog, setPdfURL, setLoading, setError } = usePdfStore();
  const [dialog, setDialog] = useState(false);

  const defaultValues = {
    ...data,
    tanggal: data?.tanggal || moment().format("YYYY-MM-DD"),
    tanggal_diambil: data?.tanggal_diambil || null,
    telp: data?.telp || "",
    jumlah: data?.jumlah || "",
    idkaryawan: data?.idkaryawan || null,
    jumlah_gigi: data?.jumlah_gigi || null,
    tarif_per_gigi: data?.tarif_per_gigi || "",
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    watch,
  } = useForm({ defaultValues });

  const jumlahTagihan = watch("tarif_per_gigi") * watch("jumlah_gigi");

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
      <Dialog open={isOpen} fullWidth maxWidth="sm">
        <DialogTitle>Input Deposit</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={(theme) => ({
            position: "absolute",
            right: 8,
            top: 8,
          })}
        >
          <Close color="error" />
        </IconButton>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12}>
              <Card>
                <CardContent>
                  <Typography variant="body1">
                    <strong>ID Pasien:</strong> {data?.nomorpasien || "-"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Nama:</strong> {data?.nama_pasien || data?.nmpasien || "-"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Alamat:</strong> {data?.alamat || "-"}
                  </Typography>
                </CardContent>
              </Card>
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
                <FormLabel>Tarif Per Gigi</FormLabel>
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
                      <FormControlLabel
                        control={<Radio />}
                        value={40000}
                        label="40.000"
                      />
                      <FormControlLabel
                        control={<Radio />}
                        value={60000}
                        label="60.000"
                      />
                      <FormControlLabel
                        control={<Radio />}
                        value={160000}
                        label="160.000"
                      />
                    </RadioGroup>
                  )}
                />
                {errors.tarif_per_gigi && (
                  <Typography color="error" variant="caption">
                    {errors.tarif_per_gigi.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Grid container spacing={2} p={2}>
            <Grid item xs={12}>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight="bold">
                          Jumlah Tagihan
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">
                          {formatCurrency(jumlahTagihan)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight="bold">Deposit</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">
                          - {formatCurrency(watch("jumlah"))}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight="bold">{jumlahTagihan - watch("jumlah") > 0 ? "Sisa Pembayaran" : "Kelebihan Pembayaran"}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">
                          {formatCurrency(jumlahTagihan - watch("jumlah"))}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
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
              </Box>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
      {dialog === CONFIRM_DELETE && (
        <Dialog open>
          <DialogContent>
            <Typography>
              {`Apakah kamu ingin mendaftarkan pasien ini di tanggal ${moment(
                watch("tanggal_diambil")
              ).format("DD/MM/YYYY")}?`}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="error" onClick={() => setDialog(false)}>
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
                } catch (error) { }
              }}
              color="success"
              disabled={addToQueue.isPending}
            >
              {addToQueue.isPending ? "Memproses..." : "Ya, daftarkan"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default DialogDeposit;
