import {
  Alert,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Pagination,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Add, Close, Search } from "@mui/icons-material";
import PatientCard from "./PatientCard";
import { fetcher } from "../../utils/fetcher";
import { safeArray } from "../../utils/common";
import DialogPatientForm from "./DialogPatientForm";
import { useDebouncedCallback } from "use-debounce";
import { useQuery } from "@tanstack/react-query";

const fetchPatients = async ({ queryKey }) => {
  const [, { page, search, address }] = queryKey;
  const response = await fetcher(
    `${import.meta.env.VITE_API_BASE_URL
    }/pasien?page=${page}&limit=20&search=${search}&address=${address}`
  );
  return response;
};

const ListPatient = () => {
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [addressInput, setAddressInput] = useState("");

  const [search, setSearch] = useState(""); // untuk query/search backend
  const [address, setAddress] = useState(""); // untuk query/search backend

  // Debounced setter
  const debouncedUpdateSearch = useDebouncedCallback((val) => {
    setSearch(val);
    setPage(1)
  }, 500);

  const debouncedUpdateAddress = useDebouncedCallback((val) => {
    setAddress(val);
    setPage(1)
  }, 500);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedUpdateSearch(value);
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddressInput(value);
    debouncedUpdateAddress(value);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    localStorage.removeItem("search");
    debouncedUpdateSearch.cancel(); // optional, untuk menghentikan debounce
  };

  const clearAddress = () => {
    setAddressInput("");
    setAddress("");
    localStorage.removeItem("address");
    debouncedUpdateAddress.cancel(); // optional, untuk menghentikan debounce
  };

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["patients", { page, search, address }],
    queryFn: fetchPatients,
    keepPreviousData: true,
  });

  const handleDialog = (value) => setDialog(value);
  const handlePage = (_, value) => setPage(value);

  useEffect(() => {
    const savedSearch = localStorage.getItem("search");
    const savedAddress = localStorage.getItem("address");
    if (savedSearch) {
      setSearch(savedSearch);
      setSearchInput(savedSearch);
    }
    if (savedAddress) {
      setAddress(savedAddress);
      setAddressInput(savedAddress);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("search", search);
  }, [search]);

  useEffect(() => {
    localStorage.setItem("address", address);
  }, [address]);

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
          height: "calc(83vh - 8px)"
        }}
      >
        <Stack gap={3} sx={{ height: "100%" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">Daftar Pasien</Typography>
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
              value={searchInput}
              onChange={handleSearchChange}
              fullWidth
              autoComplete="off"
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {searchInput && (
                      <IconButton onClick={clearSearch}>
                        <Close />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              placeholder="Cari Alamat Pasien"
              name="address"
              value={addressInput}
              onChange={handleAddressChange}
              fullWidth
              autoComplete="off"
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {addressInput && (
                      <IconButton onClick={clearAddress}>
                        <Close />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <Stack gap={2} sx={{ flexGrow: 1, overflow: "auto", height: "50vh" }}>
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
