import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
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
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useFetchMasterAction } from "../../hooks/useFetchMasterAction";
import { formatCurrency, safeArray } from "../../utils/common";
import moment from "moment";
import { useFetchKaryawan } from "../../hooks/useFetchKaryawan";
import { useUpdateQueue } from "../../hooks/useMutateQueue";
import { useFetchMasterPelayanan } from "../../hooks/useFetchMasterPelayanan";
import { kategoriMap } from "../../constants/variables";
import { useFetchShift } from "../../hooks/useFetchShift";
import { useFetchPDFInvoice } from "../../hooks/useFetchPDFInvoice";
import { Print } from "@mui/icons-material";
import { useFetchDeposit } from "../../hooks/useFetchDeposit";
import { Controller, useForm } from "react-hook-form";
import usePdfStore from "../../store/pdfStore";

const DialogQueueDetail = ({ isOpen, onClose, queue }) => {
  const { data: masterTindakan, isFetching: isFetchingMasterTindakan } =
    useFetchMasterAction();
  const { data: masterKaryawan } = useFetchKaryawan();
  const { data: masterPelayanan } = useFetchMasterPelayanan();
  const { data: masterShift } = useFetchShift();
  const { isFetching, refetch } = useFetchPDFInvoice(queue?.id, {
    enabled: false,
  });

  const { openDialog, setPdfURL, setLoading, setError } = usePdfStore();

  const mutation = useUpdateQueue();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    defaultValues: { ...queue, kdtindakan: "01" },
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

  const isDpExist = !!resolvedDP;
  const currentPelayanan = useMemo(() => {
    return safeArray(masterPelayanan).find((item) => {
      if (watch("kdshift") && watch("jml_gigi") && watch("tarif")) {
        return (
          item.kdshift === watch("kdshift") &&
          item.jml_gigi === watch("jml_gigi") &&
          item.kategori === kategoriMap[watch("tarif")]
        );
      }
    });
  }, [masterPelayanan, watch("kdshift"), watch("jml_gigi"), watch("tarif")]);

  const handleTarifChange = (e, field) => {
    const value = Number(e.target.value.replace(/\D/g, ""));
    field.onChange(value || "");
  };

  const handleBiayaPerbaikanChange = (e, field) => {
    const value = Number(e.target.value.replace(/\D/g, ""));
    field.onChange(value || "");
  };

  const handleTindakanChange = (e) => {
    const newKode = e.target.value;

    setValue("kdtindakan", newKode); // wajib untuk form state

    if (newKode === "03") {
      setValue("dp", 0);
      setValue("iddp", queue?.iddp || null);
      setValue("tarif", 0);
      setValue("batal_dp", !!queue?.iddp);
      setValue("jml_gigi", 0);
    } else {
      setValue("idkaryawan", resolvedDP?.idkaryawan || null);
      setValue("jml_gigi", resolvedDP?.jumlah_gigi || 0);
      setValue(
        "tarif",
        isDpExist && newKode !== "03" ? resolvedDP?.tarif_per_gigi : 0
      );
    }
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

  useEffect(() => {
    if (resolvedDP) {
      setValue("idkaryawan", resolvedDP.idkaryawan);
      setValue("jml_gigi", resolvedDP.jumlah_gigi);
      setValue("tarif", resolvedDP.tarif_per_gigi);
    }
  }, [resolvedDP, setValue]);

  return (
    <Dialog maxWidth="md" fullWidth open={isOpen}>
      <DialogTitle>Rincian Biaya</DialogTitle>
      <DialogContent>
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nama Pasien"
                  value={queue?.nmpasien || "-"}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              {/* Pilih Tindakan */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormLabel>Tindakan</FormLabel>
                  {isFetchingMasterTindakan ? (
                    <CircularProgress />
                  ) : (
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
                  )}
                  {errors.kdtindakan && (
                    <FormHelperText>{errors.kdtindakan.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Nama Teknisi */}
              {watch("kdtindakan") && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight="bold">
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
                    <Typography variant="h6" fontWeight="bold">
                      Pemasangan
                    </Typography>
                  </Grid>

                  {/* Tarif Per Gigi */}
                  <Grid item xs={12}>
                    <Controller
                      name="tarif"
                      control={control}
                      rules={{ required: "Tarif per gigi wajib dipilih" }}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <FormLabel>Tarif Per Gigi</FormLabel>
                          <RadioGroup
                            row
                            {...field}
                            onChange={(e) => handleTarifChange(e, field)}
                          >
                            <FormControlLabel
                              value={40000}
                              control={<Radio />}
                              label="40.000"
                            />
                            <FormControlLabel
                              value={60000}
                              control={<Radio />}
                              label="60.000"
                            />
                            <FormControlLabel
                              value={160000}
                              control={<Radio />}
                              label="160.000"
                            />
                          </RadioGroup>
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

                  {/* Komisi - read only */}
                  <Grid item xs={6} sm={4}>
                    <TextField
                      label="Kolektif"
                      fullWidth
                      type="number"
                      value={currentPelayanan?.komisi_kolektif || 0}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      label="Pribadi"
                      fullWidth
                      type="number"
                      value={currentPelayanan?.komisi_pribadi || 0}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </>
              )}

              {/* Perbaikan */}
              {["03", "04"].includes(watch("kdtindakan")) && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight="bold">
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
      </DialogContent>
      <DialogActions>
        <Grid container spacing={2} p={2}>
          <Grid item xs={12}>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
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
                  <TableRow>
                    <TableCell>
                      <Typography fontWeight="bold">Total Akhir ({totalSetelahDP >= 0 ? "Sisa Pembayaran" : "Kelebihan Pembayaran"})</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold">
                        {formatCurrency(totalSetelahDP)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="contained" onClick={onClose} color="secondary">
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
            </Box>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};

export default DialogQueueDetail;
