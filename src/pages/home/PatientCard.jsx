import {
  Close,
  Female,
  Male,
  MonetizationOn,
  MoreVert,
  Person,
  PersonAdd,
  Print,
} from "@mui/icons-material";
import {
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import React, { useState } from "react";
import { useFetchPDFCard } from "../../hooks/useFetchPDFCard";
import { useNavigate } from "react-router-dom";
import ROUTES from "../../constants/routes";
import usePatientStore from "../../store/patientStore";
import { ADD_QUEUE, DEPOSIT, PRINT } from "../../constants/variables";
import DialogQueue from "./DialogQueue";
import Pdf from "../../components/Pdf";
import DialogDeposit from "./DialogDeposit";

const PatientCard = ({ data }) => {
  const navigate = useNavigate();
  const setActivePatient = usePatientStore((state) => state.setActivePatient);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [pdfURL, setPdfURL] = useState("");

  const open = Boolean(anchorEl);
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleDialogClose = () => setOpenDialog(false);

  const { isFetching, refetch } = useFetchPDFCard(data.idpasien, {
    enabled: false,
  });

  const handlePrintCard = async () => {
    const { data } = await refetch();
    if (data) {
      const url = URL.createObjectURL(data);
      setPdfURL(url);
      setOpenDialog(PRINT);
    }
  };

  const handleDetailPatient = () => {
    setActivePatient(data);
    handleClose();
    navigate(ROUTES.PATIENT_DETAIL);
  };

  const handleOpenQueueDialog = () => {
    setOpenDialog(ADD_QUEUE);
    handleClose();
  };

  const handleOpenDepositDialog = () => {
    setOpenDialog(DEPOSIT);
    handleClose();
  };

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #d0d5dd",
      }}
    >
      <Stack sx={{ width: 250 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="body1">{data?.nmpasien}</Typography>
          {data?.jnskel === "L" ? (
            <Male
              fontSize="small"
              sx={{ background: "#2b7fff", borderRadius: "100%" }}
            />
          ) : data?.jnskel === "P" ? (
            <Female
              fontSize="small"
              sx={{ background: "#f6339a", borderRadius: "100%" }}
            />
          ) : null}
        </Stack>
        <Typography variant="caption">No. Kartu {data?.nomorpasien}</Typography>
        <Typography variant="caption">{data?.alamat || "-"}</Typography>
      </Stack>

      {/* Button Menu */}
      <Stack direction="row" gap={1}>
        <IconButton onClick={handleMenuClick}>
          <MoreVert />
        </IconButton>
      </Stack>

      {/* Menu Dropdown */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleOpenQueueDialog}>
          <PersonAdd fontSize="small" sx={{ mr: 1 }} />
          Tambah Ke Antrian
        </MenuItem>
        <MenuItem onClick={handleDetailPatient}>
          <Person fontSize="small" sx={{ mr: 1 }} />
          Detail Pasien
        </MenuItem>
        <MenuItem onClick={handlePrintCard} disabled={isFetching}>
          {isFetching ? (
            <CircularProgress size={18} sx={{ mr: 1 }} />
          ) : (
            <Print fontSize="small" sx={{ mr: 1 }} />
          )}
          Cetak Kartu Pasien
        </MenuItem>
        <MenuItem onClick={handleOpenDepositDialog}>
          <MonetizationOn fontSize="small" sx={{ mr: 1 }} />
          Deposit
        </MenuItem>
      </Menu>
      {openDialog && (
        <>
          <Dialog
            open={openDialog === PRINT}
            onClose={() => {
              handleDialogClose();
              handleClose();
            }}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle>Cetak Kartu Pasien</DialogTitle>
            <IconButton
              aria-label="close"
              onClick={() => {
                handleDialogClose();
                handleClose();
              }}
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
              <Pdf pdfURL={pdfURL} title="Kartu Pasien" />
            </DialogContent>
          </Dialog>
          <DialogQueue
            isOpen={openDialog === ADD_QUEUE}
            patient={data}
            onClose={() => setOpenDialog(false)}
          />
          <DialogDeposit
            isOpen={openDialog === DEPOSIT}
            data={data}
            onClose={() => setOpenDialog(false)}
          />
        </>
      )}
    </Stack>
  );
};

export default PatientCard;
