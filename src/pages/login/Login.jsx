import React, { useEffect, useState } from "react";
import {
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CssBaseline,
  CircularProgress,
} from "@mui/material";
import { useLogin } from "../../hooks/useLogin";
import LoginImage from "../../assets/login-image.png";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { mutate: login, isLoading, isError, error } = useLogin();
  const navigate = useNavigate();

  const { token } = useAuthStore();

  const [draft, setDraft] = useState({
    username: null,
    password: null,
  });

  const handleChange = (event) =>
    setDraft({ ...draft, [event.target.name]: event.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    login(draft);
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  return (
    <Grid container sx={{ height: "100vh" }}>
      <CssBaseline />
      {/* Form Section */}
      <Grid
        item
        xs={12}
        md={5}
        component={Paper}
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 4,
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: "100%",
            maxWidth: 400,
            p: 4,
            boxShadow: 3,
            borderRadius: 3,
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Selamat Datang 👋
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Silakan masuk untuk melanjutkan
          </Typography>

          <TextField
            margin="normal"
            label="Username"
            name="username"
            fullWidth
            required
            autoComplete="off"
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            label="Password"
            name="password"
            type="password"
            fullWidth
            required
            onChange={handleChange}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              mt: 3,
              borderRadius: 2,
              py: 1.5,
              fontWeight: "bold",
              textTransform: "none",
              transition: "all 0.3s",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            {isLoading && <CircularProgress />}
            Masuk
          </Button>
          {isError && <Typography color="error">{error?.message}</Typography>}
        </Box>
      </Grid>

      {/* Illustration Section */}
      <Grid
        item
        xs={false}
        md={7}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          component="img"
          src={LoginImage} // ganti dengan file ilustrasi kamu
          alt="Login Illustration"
          sx={{
            height: "100%",
            width: "100%",
            objectFit: "fill",
            borderRadius: 2,
          }}
        />
      </Grid>
    </Grid>
  );
};

export default Login;
