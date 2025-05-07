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
  IconButton,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useFetchMasterAction } from "../../../hooks/useFetchMasterAction";
import { formatCurrency, safeArray } from "../../../utils/common";
import moment from "moment";
import { useFetchKaryawan } from "../../../hooks/useFetchKaryawan";
import { useUpdateQueue } from "../../../hooks/useMutateQueue";
import { useFetchMasterPelayanan } from "../../../hooks/useFetchMasterPelayanan";
import { kategoriMap } from "../../../constants/variables";
import { useFetchShift } from "../../../hooks/useFetchShift";
import { useFetchPDFInvoice } from "../../../hooks/useFetchPDFInvoice";
import { Close, Print } from "@mui/icons-material";
import { useFetchDeposit } from "../../../hooks/useFetchDeposit";
import { useForm } from "react-hook-form";
import usePdfStore from "../../../store/pdfStore";
import useAlertStore from "../../../store/alertStore";
import useFetchQueue from "../../../hooks/useFetchQueue";
import PatientInfoSection from "./PatientInfoSection";
import TechnicianSection from "./TechnicianSection";
import TreatmentSection from "./TreatmentSection";
import { FORM_DEFAULTS } from "./constants";
import InstallationSection from "./InstallationSection";
import RepairSection from "./RepairSection";
import SummarySection from "./SummarySection";

const DialogQueueDetail = ({ isOpen, onClose, queueId }) => {

  // Form setup
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    reset,
  } = useForm({ defaultValues: FORM_DEFAULTS });

  // State and hooks initialization
  const { showAlert } = useAlertStore.getState();
  const { openDialog, setPdfURL, setLoading, setError } = usePdfStore();

  // Data fetching
  const { data: queue, isLoading: isQueueLoading } = useFetchQueue(queueId);
  const { data: masterTindakan, isFetching: isFetchingMasterTindakan } = useFetchMasterAction();
  const { data: masterKaryawan } = useFetchKaryawan();
  const { data: masterPelayanan } = useFetchMasterPelayanan();
  const { data: masterShift } = useFetchShift();
  const { isFetching: isPdfLoading, refetch: refetchPdf } = useFetchPDFInvoice(queue?.id, { enabled: false });
  const deposit = useFetchDeposit(watch("nomorpasien"), watch("iddp"));

  // Mutation
  const mutation = useUpdateQueue();

  // Derived state
  const [isPrintable, setIsPrintable] = useState(false);
  const resolvedDP = useMemo(() => getResolvedDP(deposit, queue), [deposit, queue]);
  const isDpExist = !!resolvedDP;

  // Calculations
  const totalPemasangan = calculateTotalPemasangan(watch("tarif"), watch("jml_gigi"));
  const totalPerbaikan = watch("biaya_perbaikan") || 0;
  const totalBiaya = totalPemasangan + totalPerbaikan;
  const dpAmount = resolvedDP?.jumlah || 0;
  const totalSetelahDP = calculateTotalAfterDP(watch("kdtindakan"), dpAmount, totalBiaya);

  // Effects
  useEffect(() => initializeForm(queue, reset), [queue, reset]);
  useEffect(() => updateTechnicianFields(resolvedDP, setValue), [resolvedDP, setValue]);
  useEffect(() => updateCommission(watch, masterPelayanan, setValue, queue), [watch("kdshift"), watch("kdtindakan"), watch("jml_gigi"), masterPelayanan, setValue, queue]);
  useEffect(() => {
    if (queue?.total_biaya > 0 || queue?.biaya_perbaikan > 0) {
      setIsPrintable(true);
    }
  }, [queue?.total_biaya, queue?.biaya_perbaikan]);

  // Handler functions
  const handleUpdateQueue = async () => {
    try {
      await mutation.mutateAsync(getSubmitData(watch(), resolvedDP, queue));
      setIsPrintable(true);
      showAlert("Data berhasil disimpan", "success");
    } catch (err) {
      console.error(err);
      showAlert(err?.message || "Gagal Menyimpan Data", "error");
    }
  };

  const handlePrintInvoice = async () => {
    try {
      openDialog("Kwitansi");
      setLoading(true);
      const { data } = await refetchPdf();
      if (data) {
        const url = URL.createObjectURL(data);
        setPdfURL(url);
        setLoading(false);
      }
    } catch (error) {
      setError(error?.message);
    }
  };

  if (isQueueLoading) return <CircularProgress />;

  return (
    <Dialog maxWidth="md" fullWidth open={isOpen}>
      <DialogTitle>
        Rincian Biaya
        <IconButton
          aria-label="close"
          onClick={onClose}
          color="error"
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close color="error" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit(handleUpdateQueue)}>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {/* Basic Info Section */}
              <PatientInfoSection queue={queue} />

              {/* Technician Section */}
              <TechnicianSection
                control={control}
                errors={errors}
                masterKaryawan={masterKaryawan}
                masterShift={masterShift}
                watch={watch}
                setValue={setValue}
              />

              {/* Treatment Section */}
              <TreatmentSection
                control={control}
                errors={errors}
                masterTindakan={masterTindakan}
                isFetchingMasterTindakan={isFetchingMasterTindakan}
                watch={watch}
                setValue={setValue}
                resolvedDP={resolvedDP}
                isDpExist={isDpExist}
              />

              {/* Installation Section (conditionally rendered) */}
              {["01", "04"].includes(watch("kdtindakan")) && (
                <InstallationSection
                  control={control}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                  masterPelayanan={masterPelayanan}
                />
              )}

              {/* Repair Section (conditionally rendered) */}
              {["03", "04"].includes(watch("kdtindakan")) && (
                <RepairSection
                  control={control}
                  errors={errors}
                />
              )}
            </Grid>
          </Box>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Box display="flex" flexDirection="column" width="100%" gap={2}>
          <SummarySection
            watch={watch}
            dpAmount={dpAmount}
            totalBiaya={totalBiaya}
            totalSetelahDP={totalSetelahDP}
            deposit={deposit}
          />
          <ActionButtons
            handleSubmit={handleSubmit}
            handleUpdateQueue={handleUpdateQueue}
            mutation={mutation}
            isPrintable={isPrintable}
            isPdfLoading={isPdfLoading}
            handlePrintInvoice={handlePrintInvoice}
          />
        </Box>
      </DialogActions>
    </Dialog>
  );
};

// Helper functions
const getResolvedDP = (deposit, queue) => {
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
};

const initializeForm = (queue, reset) => {
  if (queue) {
    reset({
      ...FORM_DEFAULTS,
      ...queue
    });
  }
};

const updateTechnicianFields = (resolvedDP, setValue) => {
  if (resolvedDP) {
    setValue("idkaryawan", resolvedDP.idkaryawan || '');
    setValue("jml_gigi", resolvedDP.jumlah_gigi || 0);
    setValue("tarif", resolvedDP.tarif_per_gigi || 0);
  }
};

export const updateCommission = (watch, masterPelayanan, setValue, queue) => {
  const shiftVal = watch("kdshift");
  const gigiVal = watch("jml_gigi");
  const tindakanVal = watch("kdtindakan");
  const tarifVal = watch("tarif");

  if (queue?.kdshift != shiftVal || queue?.jml_gigi != gigiVal || queue?.tarif != tarifVal) {

    if (shiftVal && gigiVal && tindakanVal) {
      const item = safeArray(masterPelayanan).find(
        (el) => el.kdshift === shiftVal &&
          el.jml_gigi === gigiVal &&
          el.kategori === kategoriMap[tarifVal]
      );

      if (item) {
        setValue("komisi_kolektif", item.komisi_kolektif || 0);
        setValue("komisi_pribadi", item.komisi_pribadi || 0);
      }
    }
  }
};

const calculateTotalPemasangan = (tarif, jmlGigi) => {
  return tarif && jmlGigi ? tarif * jmlGigi : 0;
};

const calculateTotalAfterDP = (kdtindakan, dpAmount, totalBiaya) => {
  return kdtindakan !== "03" && dpAmount > 0 ? totalBiaya - dpAmount : totalBiaya;
};

const getSubmitData = (formData, resolvedDP, queue) => ({
  ...formData,
  jam: formData.jam || moment().format("HH:mm:ss"),
  iddp: resolvedDP?.iddp || formData.iddp,
  dp: resolvedDP?.jumlah || formData.dp,
  status: "x",
  ket: queue?.ket ? queue.ket : "L"
});

// ActionButtons.jsx
const ActionButtons = ({
  handleSubmit,
  handleUpdateQueue,
  mutation,
  isPrintable,
  isPdfLoading,
  handlePrintInvoice
}) => (
  <Grid item xs={12}>
    <Box display="flex" justifyContent="flex-end" gap={2}>
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
          loading={isPdfLoading}
          onClick={handlePrintInvoice}
          color="success"
          variant="contained"
          startIcon={<Print />}
        >
          Cetak Kwitansi
        </Button>
      )}
    </Box>
  </Grid>
);

export default DialogQueueDetail;