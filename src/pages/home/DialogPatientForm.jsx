import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import moment from "moment";
import { useSubmitPatient } from "../../hooks/useMutatePatient";
import { useAddToQueueMutation } from "../../hooks/useMutateQueue";

const initialState = {
  nomorpasien: null,
  tgl_input: moment().format("YYYY-MM-DD"),
  noktp: null,
  nmpasien: null,
  temp_lahir: null,
  tgl_lahir: null,
  status: null,
  jnskel: null,
  nama_ortu: null,
  gol_darah: null,
  alamat: null,
  telp: null,
};

const DialogPatientForm = ({ isOpen, handleDialog, editData }) => {
  const [draft, setDraft] = useState(initialState);

  useEffect(() => {
    if (editData) {
      setDraft(editData);
    } else {
      setDraft(initialState);
    }
  }, [editData]);

  const handleChange = (event) =>
    setDraft({ ...draft, [event.target.name]: event.target.value });

  const { mutateAsync: addToQueue } = useAddToQueueMutation(() =>
    handleDialog(false)
  );

  const { mutateAsync, isPending } = useSubmitPatient({
    editData,
    onComplete: async (data) => {
      try {
        await addToQueue(data);
        setDraft(initialState);
      } catch (error) {}
    },
  });

  const handleSubmit = () => mutateAsync(draft);

  return (
    <Dialog maxWidth="md" fullWidth open={isOpen}>
      <DialogTitle>
        {editData ? "Edit Data Pasien" : "Registrasi Pasien Baru"}
      </DialogTitle>
      <DialogContent>
        <Stack gap={3}>
          <TextField
            autoComplete="off"
            value={draft?.nmpasien || ""}
            label="Nama Pasien"
            placeholder="Masukkan nama pasien"
            variant="standard"
            fullWidth
            name="nmpasien"
            onChange={handleChange}
          />
          <Stack direction="row" justifyContent="space-between" gap={4}>
            <TextField
              autoComplete="off"
              value={draft?.temp_lahir || ""}
              label="Tempat Lahir"
              placeholder="Masukkan Tempat Lahir"
              variant="standard"
              sx={{ flex: 1 }}
              name="temp_lahir"
              onChange={handleChange}
            />
            <DesktopDatePicker
              sx={{ flex: 1 }}
              format="DD/MM/YYYY"
              label="Tanggal Lahir"
              name="tgl_lahir"
              value={draft?.tgl_lahir ? moment(draft.tgl_lahir) : null}
              onChange={(value) =>
                setDraft({ ...draft, tgl_lahir: value.format("YYYY-MM-DD") })
              }
              slotProps={{
                actionBar: {
                  actions: ["today"],
                },
              }}
            />
          </Stack>
          <TextField
            autoComplete="off"
            value={draft?.alamat}
            label="Alamat"
            placeholder="Masukkan Alamat"
            variant="standard"
            fullWidth
            name="alamat"
            onChange={handleChange}
          />
          <FormControl>
            <FormLabel>Jenis Kelamin</FormLabel>
            <RadioGroup
              value={draft?.jnskel}
              row
              name="jnskel"
              onChange={handleChange}
            >
              <FormControlLabel
                value="L"
                control={<Radio />}
                label="Laki-laki"
              />
              <FormControlLabel
                value="P"
                control={<Radio />}
                label="Perempuan"
              />
            </RadioGroup>
          </FormControl>
          <TextField
            autoComplete="off"
            value={draft?.telp}
            name="telp"
            onChange={handleChange}
            label="No. Telepon / HP"
            placeholder="Masukkan Nomor Telepon"
            variant="standard"
            type="tel"
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            handleDialog(null);
            setDraft(initialState);
          }}
        >
          Tutup
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Menyimpan..." : editData ? "Perbarui" : "Simpan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogPatientForm;
