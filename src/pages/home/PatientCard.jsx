import {
  Female,
  Male,
  MoreVert,
  Person,
  PersonAdd,
  Print,
} from "@mui/icons-material";
import {
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  CircularProgress,
  alpha,
} from "@mui/material";
import React, { useState } from "react";
import { useFetchPDFCard } from "../../hooks/useFetchPDFCard";
import { useNavigate } from "react-router-dom";
import ROUTES from "../../constants/routes";
import usePatientStore from "../../store/patientStore";
import { ADD_QUEUE, PRINT } from "../../constants/variables";
import DialogQueue from "./DialogQueue";
import usePdfStore from "../../store/pdfStore";
import { getInitials } from "../../utils/common";

const GENDER = {
  L: { label: "Laki-laki", icon: <Male fontSize="small" />, color: "#2b7fff" },
  P: { label: "Perempuan", icon: <Female fontSize="small" />, color: "#f6339a" },
};

const PatientCard = ({ data }) => {
  const navigate = useNavigate();
  const setActivePatient = usePatientStore((state) => state.setActivePatient);
  const { openDialog, setPdfURL, setLoading, setError } = usePdfStore();
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialog, setDialog] = useState(false);

  const open = Boolean(anchorEl);
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const { isFetching, refetch } = useFetchPDFCard(data.idpasien, data.nomorpasien, {
    enabled: false,
  });

  const handlePrintCard = async () => {
    try {
      openDialog("Kartu Pasien");
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

  const handleDetailPatient = () => {
    setActivePatient(data);
    handleClose();
    navigate(ROUTES.PATIENT_DETAIL);
  };

  const handleOpenQueueDialog = () => {
    setDialog(ADD_QUEUE);
    handleClose();
  };

  const gender = GENDER[data?.jnskel];

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        p: 2,
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
        transition: "all 0.2s",
        "&:hover": {
          borderColor: "primary.main",
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
        },
      }}
    >
      <Stack direction="row" alignItems="center" gap={2} sx={{ minWidth: 0, flex: 1 }}>
        <Avatar
          sx={{
            bgcolor: gender ? alpha(gender.color, 0.15) : "action.selected",
            color: gender ? gender.color : "text.secondary",
          }}
        >
          {getInitials(data?.nmpasien)}
        </Avatar>
        <Stack sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="body1" fontWeight={600} noWrap>
              {data?.nmpasien}
            </Typography>
            {gender && (
              <Chip
                size="small"
                icon={gender.icon}
                label={gender.label}
                sx={{
                  bgcolor: alpha(gender.color, 0.12),
                  color: gender.color,
                  "& .MuiChip-icon": { color: gender.color },
                }}
              />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            No. Kartu {data?.nomorpasien}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {data?.alamat || "-"}
          </Typography>
        </Stack>
      </Stack>

      {/* Button Menu */}
      <IconButton onClick={handleMenuClick}>
        <MoreVert />
      </IconButton>

      {/* Menu Dropdown */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleOpenQueueDialog}>
          <PersonAdd fontSize="small" sx={{ mr: 1 }} />
          Tambah Ke Antrian
        </MenuItem>
        <MenuItem onClick={handleDetailPatient}>
          <Person fontSize="small" sx={{ mr: 1 }} />
          Riwayat Pelayanan
        </MenuItem>
        <MenuItem onClick={handlePrintCard} disabled={isFetching}>
          {isFetching ? (
            <CircularProgress size={18} sx={{ mr: 1 }} />
          ) : (
            <Print fontSize="small" sx={{ mr: 1 }} />
          )}
          Cetak Kartu Pasien
        </MenuItem>
      </Menu>
      {dialog && (
        <DialogQueue isOpen patient={data} onClose={() => setDialog(false)} />
      )}
    </Stack>
  );
};

export default PatientCard;
