import {
  Alert,
  Button,
  CircularProgress,
  InputAdornment,
  Pagination,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Add, Search } from "@mui/icons-material";
import PatientCard from "./PatientCard";
import { fetcher } from "../../utils/fetcher";
import { safeArray } from "../../utils/common";
import DialogPatientForm from "./DialogPatientForm";
import { useDebouncedCallback } from "use-debounce";
import { useQuery } from "@tanstack/react-query";

const fetchPatients = async ({ queryKey }) => {
  const [, { page, search, address }] = queryKey;
  const response = await fetcher(
    `${
      import.meta.env.VITE_API_BASE_URL
    }/pasien?page=${page}&limit=20&search=${search}&address=${address}`
  );
  return response;
};

const ListPatient = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [address, setAddress] = useState("");
  const [dialog, setDialog] = useState(null);

  const debouncedSetSearch = useDebouncedCallback(
    (value) => setSearch(value),
    500
  );
  const debouncedSetAddress = useDebouncedCallback(
    (value) => setAddress(value),
    500
  );

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["patients", { page, search, address }],
    queryFn: fetchPatients,
    keepPreviousData: true,
  });

  const handleDialog = (value) => setDialog(value);
  const handlePage = (_, value) => setPage(value);

  return (
    <>
      <Paper
        variant="outlined"
        square={false}
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          height: "100%",
        }}
      >
        <Stack gap={4} sx={{ height: "100%" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography>Daftar Pasien</Typography>
            <Button
              onClick={() => handleDialog("add_new_patient")}
              startIcon={<Add />}
              variant="contained"
              color="success"
            >
              Registrasi Pasien Baru
            </Button>
          </Stack>
          <Stack direction="row" justifyContent="space-between" gap={2}>
            <TextField
              placeholder="Cari Pasien (Daftar Lengkap)"
              name="search"
              onChange={(event) => debouncedSetSearch(event.target.value)}
              fullWidth
              autoComplete="off"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              placeholder="Cari Alamat Pasien"
              name="address"
              fullWidth
              onChange={(event) => debouncedSetAddress(event.target.value)}
              autoComplete="off"
            />
          </Stack>

          <Stack gap={3} sx={{ flexGrow: 1, overflow: "auto", height: "54vh" }}>
            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                Terjadi kesalahan saat mengambil data: {error.message}
              </Alert>
            ) : isLoading ? (
              <CircularProgress sx={{ m: "auto" }} />
            ) : (
              safeArray(data?.data).map((item, index) => (
                <PatientCard data={item} key={index} />
              ))
            )}
          </Stack>
          <Pagination
            color="primary"
            shape="rounded"
            page={page}
            onChange={handlePage}
            count={data?.total_pages}
          />
        </Stack>
      </Paper>
      <DialogPatientForm
        isOpen={dialog === "add_new_patient"}
        handleDialog={handleDialog}
        refetch={refetch}
      />
    </>
  );
};

export default ListPatient;
