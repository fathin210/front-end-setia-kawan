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
  IconButton,
  TableContainer,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useFetchMasterAction } from "../../hooks/useFetchMasterAction";
import { formatCurrency, safeArray } from "../../utils/common";
import moment from "moment";
import { useFetchKaryawan } from "../../hooks/useFetchKaryawan";
import { useUpdateQueue } from "../../hooks/useMutateQueue";
import { useFetchMasterPelayanan } from "../../hooks/useFetchMasterPelayanan";
import { kategoriMap, PRINT } from "../../constants/variables";
import { useFetchShift } from "../../hooks/useFetchShift";
import { useFetchPDFInvoice } from "../../hooks/useFetchPDFInvoice";
import Pdf from "../../components/Pdf";
import { Close, Print } from "@mui/icons-material";
import { useFetchDeposit } from "../../hooks/useFetchDeposit";

const DialogQueueDetail = ({ isOpen, onClose, queue }) => {
  const { data: masterTindakan } = useFetchMasterAction();
  const { data: masterKaryawan } = useFetchKaryawan();
  const { data: masterPelayanan } = useFetchMasterPelayanan();
  const { data: masterShift } = useFetchShift();
  const { isFetching, refetch } = useFetchPDFInvoice(queue?.id, {
    enabled: false,
  });

  const mutation = useUpdateQueue();

  const [draft, setDraft] = useState(queue || {});
  const deposit = useFetchDeposit(draft?.nomorpasien, draft?.iddp);
  const [pdfURL, setPdfURL] = useState("");
  const [dialog, setDialog] = useState(false);
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
  }, [deposit.data, deposit.isSuccess, queue]);

  const isDpExist = !!resolvedDP;
  const currentPelayanan = useMemo(() => {
    return safeArray(masterPelayanan).find((item) => {
      if (draft?.kdshift && draft?.jml_gigi && draft?.tarif) {
        return (
          item.kdshift === draft.kdshift &&
          item.jml_gigi === draft.jml_gigi &&
          item.kategori === kategoriMap[draft.tarif]
        );
      }
    });
  }, [masterPelayanan, draft?.kdshift, draft?.jml_gigi, draft?.tarif]);

  const handleTarifChange = (e) => {
    const value = Number(e.target.value.replace(/\D/g, ""));
    setDraft((prev) => ({ ...prev, tarif: value || "" }));
  };

  const handleBiayaPerbaikanChange = (e) => {
    const value = Number(e.target.value.replace(/\D/g, ""));
    setDraft((prev) => ({ ...prev, biaya_perbaikan: value || "" }));
  };

  const handleTindakanChange = (e) => {
    const newKode = e.target.value;
    if (newKode === "03") {
      setDraft({
        ...queue,
        kdtindakan: newKode,
        dp: 0,
        iddp: queue?.iddp,
        tarif: 0,
        batal_dp: queue?.iddp ? true : false,
        jml_gigi: 0,
      });
    } else {
      setDraft({
        ...draft,
        idkaryawan: resolvedDP?.idkaryawan || null,
        jml_gigi: resolvedDP?.jumlah_gigi || 0,
        tarif: isDpExist && newKode !== "03" ? resolvedDP?.tarif_per_gigi : 0,
        kdtindakan: newKode,
      });
    }
  };

  const handlePrintInvoice = async () => {
    const { data } = await refetch();
    if (data) {
      const url = URL.createObjectURL(data);
      setPdfURL(url);
      setDialog(PRINT);
    }
  };

  const handleUpdateQueue = async () => {
    try {
      await mutation.mutateAsync({
        ...draft,
        jam: draft?.jam || moment().format("HH:mm:ss"),
        iddp: resolvedDP?.iddp || draft?.iddp,
        dp: resolvedDP?.jumlah || draft?.dp,
        status: "x",
      });
      setDraft({
        ...draft,
        jam: draft?.jam || moment().format("HH:mm:ss"),
        iddp: resolvedDP?.iddp || draft?.iddp,
        dp: resolvedDP?.jumlah || draft?.dp,
        status: "x",
      });
      setIsPrintable(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDialogClose = () => setDialog(false);

  const totalPemasangan =
    draft?.tarif && draft?.jml_gigi ? draft.tarif * draft.jml_gigi : 0;
  const totalPerbaikan = draft?.biaya_perbaikan || 0;
  const totalBiaya = totalPemasangan + totalPerbaikan;

  const dpAmount = useMemo(() => resolvedDP?.jumlah || 0, [resolvedDP]);

  const totalSetelahDP = useMemo(() => {
    return draft?.kdtindakan !== "03" && dpAmount > 0
      ? Math.max(0, totalBiaya - dpAmount)
      : totalBiaya;
  }, [totalBiaya, dpAmount]);

  useEffect(() => {
    if (currentPelayanan) {
      setDraft((prev) => ({
        ...prev,
        komisi_kolektif: currentPelayanan.komisi_kolektif || 0,
        komisi_pribadi: currentPelayanan.komisi_pribadi || 0,
      }));
    }
  }, [currentPelayanan]);

  useEffect(() => {
    if (resolvedDP) {
      setDraft((prev) => ({
        ...prev,
        idkaryawan: resolvedDP.idkaryawan,
        jml_gigi: resolvedDP.jumlah_gigi,
      }));
    }
  }, [resolvedDP]);

  return (
    <>
      <Dialog maxWidth="md" fullWidth open={isOpen} onClose={onClose}>
        <DialogTitle>Rincian Biaya</DialogTitle>
        <DialogContent>
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
                  <FormLabel>Layanan</FormLabel>
                  <RadioGroup
                    row
                    value={draft?.kdtindakan || ""}
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
                </FormControl>
              </Grid>

              {/* Nama Teknisi */}
              {draft?.kdtindakan && (
                <Grid item xs={12}>
                  <Autocomplete
                    options={safeArray(masterKaryawan)}
                    getOptionLabel={(option) => option?.nmkaryawan || ""}
                    value={
                      safeArray(masterKaryawan).find(
                        (emp) => emp.idkaryawan === draft?.idkaryawan
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      setDraft((prev) => ({
                        ...prev,
                        idkaryawan: newValue?.idkaryawan,
                      }))
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Nama Teknisi" fullWidth />
                    )}
                  />
                </Grid>
              )}

              {/* Pemasangan */}
              {["01", "04"].includes(draft?.kdtindakan) && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight="bold">
                      Pemasangan
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <FormLabel>Tarif Per Gigi</FormLabel>
                      <RadioGroup
                        row
                        value={draft?.tarif || ""}
                        onChange={handleTarifChange}
                      >
                        <FormControlLabel
                          control={<Radio />}
                          value="40000"
                          label="40.000"
                        />
                        <FormControlLabel
                          control={<Radio />}
                          value="60000"
                          label="60.000"
                        />
                        <FormControlLabel
                          control={<Radio />}
                          value="160000"
                          label="160.000"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={Array.from({ length: 28 }, (_, i) => i + 1)}
                      getOptionLabel={(opt) => String(opt)}
                      value={draft?.jml_gigi || null}
                      onChange={(_, newValue) =>
                        setDraft((prev) => ({
                          ...prev,
                          jml_gigi: newValue || "",
                        }))
                      }
                      renderInput={(params) => (
                        <TextField {...params} label="Jumlah Gigi" fullWidth />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      options={safeArray(masterShift)}
                      getOptionLabel={(opt) => opt?.nmshift || ""}
                      value={
                        safeArray(masterShift).find(
                          (item) => item.kdshift == draft?.kdshift
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        setDraft((prev) => ({
                          ...prev,
                          kdshift: String(newValue?.kdshift),
                        }))
                      }
                      renderInput={(params) => (
                        <TextField {...params} label="Jam Layanan" fullWidth />
                      )}
                    />
                  </Grid>
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
              {["03", "04"].includes(draft?.kdtindakan) && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight="bold">
                      Perbaikan
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={safeArray(masterShift)}
                      getOptionLabel={(opt) => opt?.nmshift || ""}
                      value={
                        safeArray(masterShift).find(
                          (item) => item.kdshift == draft?.kdshift
                        ) || null
                      }
                      onChange={(_, newValue) =>
                        setDraft((prev) => ({
                          ...prev,
                          kdshift: String(newValue?.kdshift),
                        }))
                      }
                      renderInput={(params) => (
                        <TextField {...params} label="Jam Layanan" fullWidth />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <FormLabel>Biaya Perbaikan</FormLabel>
                      <Stack direction="row" spacing={2}>
                        <RadioGroup
                          row
                          value={draft?.biaya_perbaikan || ""}
                          onChange={handleBiayaPerbaikanChange}
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
                        <TextField
                          label="Harga"
                          variant="standard"
                          value={
                            draft?.biaya_perbaikan
                              ? formatCurrency(draft.biaya_perbaikan)
                              : ""
                          }
                          onChange={handleBiayaPerbaikanChange}
                        />
                      </Stack>
                    </FormControl>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Grid container spacing={2} p={2}>
            <Grid item xs={12}>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableBody>
                    {/* Tampilkan hanya jika ada DP */}
                    {draft?.kdtindakan !== "03" && dpAmount > 0 && (
                      <>
                        <TableRow>
                          <TableCell>
                            <Typography>Total Sebelum DP</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography>
                              {formatCurrency(totalBiaya)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography>
                              Deposit di tanggal{" "}
                              {moment(deposit.data?.tanggal).format(
                                "DD/MM/YYYY"
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography>
                              - {formatCurrency(dpAmount)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </>
                    )}

                    {/* Total Akhir selalu ditampilkan */}
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight="bold">Total Akhir</Typography>
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
                  onClick={handleUpdateQueue}
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

      {/* Dialog Preview PDF */}
      <Dialog
        open={dialog === PRINT}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Cetak Kwitansi</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleDialogClose}
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
    </>
  );
};

export default DialogQueueDetail;
