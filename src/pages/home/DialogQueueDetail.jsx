import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Autocomplete,
  Typography,
  Grid,
  DialogActions,
  Button,
  TableContainer,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  FormHelperText,
  alpha,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useFetchMasterAction } from "../../hooks/useFetchMasterAction";
import { formatCurrency, safeArray } from "../../utils/common";
import moment from "moment";
import { useFetchKaryawan } from "../../hooks/useFetchKaryawan";
import { useUpdateQueue } from "../../hooks/useMutateQueue";
import { useFetchMasterPelayanan } from "../../hooks/useFetchMasterPelayanan";
import { useFetchJenisGigi } from "../../hooks/useFetchJenisGigi";
import { useFetchShift } from "../../hooks/useFetchShift";
import { useFetchPDFInvoice } from "../../hooks/useFetchPDFInvoice";
import { Print, ReceiptLong } from "@mui/icons-material";
import { useFetchDeposit } from "../../hooks/useFetchDeposit";
import { Controller, useForm } from "react-hook-form";
import usePdfStore from "../../store/pdfStore";

const readOnlySx = { "& .MuiInputBase-input": { bgcolor: "action.hover" } };

const DialogQueueDetail = ({ isOpen, onClose, queue }) => {
  const { data: masterTindakan, isFetching: isFetchingMasterTindakan } =
    useFetchMasterAction();
  const { data: masterKaryawan, isLoading: isLoadingKaryawan } =
    useFetchKaryawan();
  const { data: masterPelayanan, isLoading: isLoadingPelayanan } =
    useFetchMasterPelayanan();
  const { data: masterShift, isLoading: isLoadingShift } = useFetchShift();
  const { data: jenisGigi, isLoading: isLoadingJenisGigi } =
    useFetchJenisGigi();
  const { isFetching, refetch } = useFetchPDFInvoice(queue?.id, {
    enabled: false,
  });

  // Tunggu semua master data (terutama jenis gigi) siap sebelum nampilin
  // form — kalau nggak, radio "Tarif Per Gigi" bisa kebuka sebelum data
  // kelar di-fetch dan gagal ke-auto-select.
  const isMasterDataLoading =
    isFetchingMasterTindakan ||
    isLoadingKaryawan ||
    isLoadingPelayanan ||
    isLoadingShift ||
    isLoadingJenisGigi;

  const { openDialog, setPdfURL, setLoading, setError } = usePdfStore();

  const mutation = useUpdateQueue();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm({
    // "01" cuma default buat antrian baru yang belum punya tindakan sama
    // sekali — kalau queue udah punya kdtindakan (lagi diedit), pakai itu.
    defaultValues: { ...queue, kdtindakan: queue?.kdtindakan || "01" },
  });

  const deposit = useFetchDeposit(watch("nomorpasien"), watch("iddp"));
  const [isPrintable, setIsPrintable] = useState(
    queue?.total_biaya > 0 || queue?.biaya_perbaikan > 0
  );

  // Fallback ke queue jika deposit gagal atau tidak ada
  const resolvedDP = useMemo(() => {
    if (deposit.isSuccess && deposit?.data?.jumlah > 0) return deposit.data;
    if (queue?.dp && queue?.dp > 0) {
      return {
        jumlah: queue.dp,
        idkaryawan: queue.idkaryawan,
        jumlah_gigi: queue.jml_gigi,
        tarif_per_gigi: queue.tarif,
        iddp: queue.iddp,
      };
    }
    return null;
  }, [deposit, queue]);

  const currentPelayanan = useMemo(() => {
    return safeArray(masterPelayanan).find((item) => {
      if (watch("kdshift") && watch("jml_gigi") && watch("id_jenis_gigi")) {
        return (
          item.kdshift === watch("kdshift") &&
          item.jml_gigi === watch("jml_gigi") &&
          item.id_jenis_gigi === watch("id_jenis_gigi")
        );
      }
    });
  }, [masterPelayanan, watch("kdshift"), watch("jml_gigi"), watch("id_jenis_gigi")]);

  const findJenisGigiByTarif = (tarif) =>
    safeArray(jenisGigi).find((item) => Number(item.tarif) === Number(tarif));

  const handleJenisGigiChange = (e, field) => {
    const id = Number(e.target.value);
    field.onChange(id || "");
    const matched = safeArray(jenisGigi).find((item) => item.id === id);
    setValue("tarif", matched?.tarif || 0);
  };

  const handleBiayaPerbaikanChange = (e, field) => {
    const value = Number(e.target.value.replace(/\D/g, ""));
    field.onChange(value || "");
  };

  const handleTindakanChange = (e) => {
    const newKode = e.target.value;

    setValue("kdtindakan", newKode); // wajib untuk form state

    // Reset field di bawah Tindakan — nggak ada nilai yang nyangkut dari
    // pilihan tindakan sebelumnya. Teknisi dikecualikan, tetap dipertahankan.
    setValue("tarif", 0);
    setValue("id_jenis_gigi", "");
    setValue("jml_gigi", 0);
    setValue("kdshift", "");
    setValue("komisi_kolektif", 0);
    setValue("komisi_pribadi", 0);
    setValue("biaya_perbaikan", 0);
    setValue("biaya_perbaikan_custom", "");
    setValue("dp", 0);
    setValue("iddp", newKode === "03" ? queue?.iddp || null : null);
    setValue("batal_dp", newKode === "03" ? !!queue?.iddp : false);
  };

  const handlePrintInvoice = async () => {
    try {
      openDialog("Kwitansi");
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

  const handleUpdateQueue = async () => {
    try {
      await mutation.mutateAsync({
        ...watch(),
        jam: watch("jam") || moment().format("HH:mm:ss"),
        iddp: resolvedDP?.iddp || watch("iddp"),
        dp: resolvedDP?.jumlah || watch("dp"),
        status: "x",
      });
      setIsPrintable(true);
    } catch (err) {
      console.error(err);
    }
  };

  const totalPemasangan =
    watch("tarif") && watch("jml_gigi")
      ? watch("tarif") * watch("jml_gigi")
      : 0;
  const totalPerbaikan = watch("biaya_perbaikan") || 0;
  const totalBiaya = totalPemasangan + totalPerbaikan;

  const dpAmount = useMemo(() => resolvedDP?.jumlah || 0, [resolvedDP]);

  const totalSetelahDP = useMemo(() => {
    return watch("kdtindakan") !== "03" && dpAmount > 0
      ? totalBiaya - dpAmount
      : totalBiaya;
  }, [totalBiaya, dpAmount, watch("kdtindakan")]);

  useEffect(() => {
    if (currentPelayanan) {
      setValue("komisi_kolektif", currentPelayanan.komisi_kolektif || 0);
      setValue("komisi_pribadi", currentPelayanan.komisi_pribadi || 0);
    }
  }, [currentPelayanan, setValue]);

  // Data queue lama cuma nyimpen `tarif` (angka), belum ada `id_jenis_gigi`.
  // Cocokkan ke jenis gigi begitu master-nya kelar di-fetch, biar radio
  // "Tarif Per Gigi" ke-select waktu buka dialog edit. Kalau ada DP, DP yang
  // jadi sumber tarif (prioritas lebih tinggi daripada tarif queue lama).
  // `jenisGigi`/`resolvedDP` bisa kelar fetch belakangan (async, urutan nggak
  // pasti) — effect ini sengaja jalan ulang tiap salah satunya berubah, dan
  // nggak pernah nimpa id_jenis_gigi yang udah berhasil ke-set, supaya tetap
  // "nyoba lagi" begitu data yang telat itu akhirnya masuk.
  useEffect(() => {
    if (resolvedDP) {
      setValue("idkaryawan", resolvedDP.idkaryawan);
      setValue("jml_gigi", resolvedDP.jumlah_gigi);
      setValue("tarif", resolvedDP.tarif_per_gigi);
    }

    if (watch("id_jenis_gigi")) return;

    const sourceTarif = resolvedDP?.tarif_per_gigi ?? queue?.tarif;
    const matched = findJenisGigiByTarif(sourceTarif);
    if (matched) setValue("id_jenis_gigi", matched.id);
  }, [resolvedDP, queue, jenisGigi, setValue]);

  return (
    <Dialog maxWidth="md" fullWidth open={isOpen}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <ReceiptLong color="primary" />
        Rincian Biaya
      </DialogTitle>
      <DialogContent dividers>
        {isMasterDataLoading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
        <>
        <form onSubmit={handleSubmit(handleUpdateQueue)}>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {/* Tanggal dan Nama Pasien */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Tanggal"
                  value={
                    queue?.tanggal_pelaks
                      ? moment(queue.tanggal_pelaks).format("DD/MM/YYYY")
                      : ""
                  }
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={readOnlySx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nama Pasien"
                  value={queue?.nama_pasien || "-"}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={readOnlySx}
                />
              </Grid>

              {/* Pilih Tindakan */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormLabel required>Tindakan</FormLabel>
                  <Controller
                    name="kdtindakan"
                    control={control}
                    rules={{ required: "Tindakan wajib dipilih" }}
                    render={({ field }) => (
                      <RadioGroup
                        row
                        {...field}
                        onChange={handleTindakanChange}
                      >
                        {safeArray(masterTindakan).map((item) => (
                          <FormControlLabel
                            key={item?.kdtindakan}
                            control={<Radio />}
                            value={item?.kdtindakan}
                            label={item?.nmtindakan}
                          />
                        ))}
                      </RadioGroup>
                    )}
                  />
                  {errors.kdtindakan && (
                    <FormHelperText>{errors.kdtindakan.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Nama Teknisi */}
              {watch("kdtindakan") && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Teknisi
                    </Typography>
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
                              (emp) => emp.idkaryawan === field.value
                            ) || null
                          }
                          onChange={(_, newValue) => {
                            field.onChange(newValue?.idkaryawan || "");
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Nama Teknisi"
                              fullWidth
                              error={Boolean(errors.idkaryawan)}
                              helperText={errors.idkaryawan?.message}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>
                </>
              )}

              {["01", "04"].includes(watch("kdtindakan")) && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Pemasangan
                    </Typography>
                  </Grid>

                  {/* Tarif Per Gigi */}
                  <Grid item xs={12}>
                    <Controller
                      name="id_jenis_gigi"
                      control={control}
                      rules={{ required: "Tarif per gigi wajib dipilih" }}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <FormLabel required>Tarif Per Gigi</FormLabel>
                          <RadioGroup
                            row
                            {...field}
                            onChange={(e) => handleJenisGigiChange(e, field)}
                          >
                            {safeArray(jenisGigi).map((item) => (
                              <FormControlLabel
                                key={item.id}
                                value={item.id}
                                control={<Radio />}
                                label={formatCurrency(item.tarif)}
                              />
                            ))}
                          </RadioGroup>
                          {errors.id_jenis_gigi && (
                            <FormHelperText error>
                              {errors.id_jenis_gigi.message}
                            </FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>

                  {/* Jumlah Gigi */}
                  <Grid item xs={12}>
                    <Controller
                      name="jml_gigi"
                      control={control}
                      rules={{ required: "Jumlah gigi wajib dipilih" }}
                      render={({ field }) => (
                        <Autocomplete
                          options={Array.from({ length: 28 }, (_, i) => i + 1)}
                          getOptionLabel={(opt) => String(opt)}
                          value={field.value || null}
                          onChange={(_, newValue) =>
                            field.onChange(newValue || null)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Jumlah Gigi"
                              fullWidth
                              error={!!errors.jml_gigi}
                              helperText={errors.jml_gigi?.message}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>

                  {/* Shift */}
                  <Grid item xs={12} sm={4}>
                    <Controller
                      name="kdshift"
                      control={control}
                      rules={{ required: "Shift wajib dipilih" }}
                      render={({ field }) => (
                        <Autocomplete
                          options={safeArray(masterShift)}
                          getOptionLabel={(opt) => opt?.nmshift || ""}
                          value={
                            safeArray(masterShift).find(
                              (item) => item.kdshift == field.value
                            ) || null
                          }
                          onChange={(_, newValue) => {
                            field.onChange(String(newValue?.kdshift));
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Jam Layanan"
                              fullWidth
                              error={!!errors.kdshift}
                              helperText={errors.kdshift?.message}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>

                  {/* Komisi - otomatis dari t_pelayanan, tapi tetap bisa ditimpa manual */}
                  <Grid item xs={6} sm={4}>
                    <Controller
                      name="komisi_pribadi"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Pribadi"
                          fullWidth
                          type="number"
                          value={field.value || 0}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Controller
                      name="komisi_kolektif"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Kolektif"
                          fullWidth
                          type="number"
                          value={field.value || 0}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                        />
                      )}
                    />
                  </Grid>
                </>
              )}

              {/* Perbaikan */}
              {["03", "04"].includes(watch("kdtindakan")) && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Perbaikan
                    </Typography>
                  </Grid>

                  {/* Shift */}
                  <Grid item xs={12}>
                    <Controller
                      name="kdshift"
                      control={control}
                      rules={{ required: "Jam layanan wajib dipilih" }}
                      render={({ field }) => (
                        <Autocomplete
                          options={safeArray(masterShift)}
                          getOptionLabel={(opt) => opt?.nmshift || ""}
                          value={
                            safeArray(masterShift).find(
                              (item) => item.kdshift == field.value
                            ) || null
                          }
                          onChange={(_, newValue) =>
                            field.onChange(newValue?.kdshift)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Jam Layanan"
                              fullWidth
                              error={!!errors.kdshift}
                              helperText={errors.kdshift?.message}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>

                  {/* Biaya Perbaikan */}
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <FormLabel>Biaya Perbaikan</FormLabel>
                      <Stack direction="row" spacing={2}>
                        {/* Radio Buttons for Biaya */}
                        <Controller
                          name="biaya_perbaikan"
                          control={control}
                          render={({ field }) => (
                            <RadioGroup
                              row
                              {...field}
                              onChange={(e) =>
                                handleBiayaPerbaikanChange(e, field)
                              }
                            >
                              {[30000, 50000, 80000, 100000].map((val) => (
                                <FormControlLabel
                                  key={val}
                                  control={<Radio />}
                                  value={val}
                                  label={formatCurrency(val)}
                                />
                              ))}
                            </RadioGroup>
                          )}
                        />

                        {/* TextField for Custom Biaya */}
                        <Controller
                          name="biaya_perbaikan_custom"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Harga"
                              variant="standard"
                              value={
                                field.value ? formatCurrency(field.value) : ""
                              }
                              onChange={(e) =>
                                handleBiayaPerbaikanChange(e, field)
                              }
                            />
                          )}
                        />
                      </Stack>
                    </FormControl>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </form>

        {/* Ringkasan Biaya */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" fontWeight={600} mb={1}>
          Ringkasan Biaya
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableBody>
              {/* Tampilkan hanya jika ada DP */}
              {watch("kdtindakan") !== "03" && dpAmount > 0 && (
                <>
                  <TableRow>
                    <TableCell>
                      <Typography>Total Sebelum DP</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography>{formatCurrency(totalBiaya)}</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography>
                        Deposit di tanggal{" "}
                        {moment(deposit.data?.tanggal).format("DD/MM/YYYY")}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography>- {formatCurrency(dpAmount)}</Typography>
                    </TableCell>
                  </TableRow>
                </>
              )}

              {/* Total Akhir selalu ditampilkan */}
              <TableRow
                sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06) }}
              >
                <TableCell>
                  <Typography fontWeight={700}>
                    Total Akhir ({totalSetelahDP >= 0 ? "Sisa Pembayaran" : "Kelebihan Pembayaran"})
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight={700} color={totalSetelahDP < 0 ? "error.main" : "text.primary"}>
                    {formatCurrency(totalSetelahDP)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Tutup
        </Button>
        <Button
          onClick={handleSubmit(handleUpdateQueue)}
          color="primary"
          variant="contained"
          disabled={mutation.isLoading}
        >
          {mutation.isLoading ? "Menambahkan..." : "Simpan"}
        </Button>
        {isPrintable && (
          <Button
            loading={isFetching}
            onClick={handlePrintInvoice}
            color="success"
            variant="contained"
            disabled={!isPrintable}
            startIcon={<Print />}
          >
            Cetak Kwitansi
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DialogQueueDetail;
