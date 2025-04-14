import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { People, CalendarMonth, MonetizationOn } from "@mui/icons-material";
import { useFetchDashboard } from "../../hooks/useRekapPendapatan";

const InfoCard = ({ icon: Icon, title, value, color }) => {
  return (
    <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              backgroundColor: color,
              p: 1.5,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ color: "white" }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const CustomTooltipPendapatan = ({ active, payload }) => {
  if (active && payload?.length) {
    const { fullBulan, pendapatan } = payload[0].payload;
    return (
      <Card sx={{ p: 1 }}>
        <Typography variant="body2" fontWeight={600}>
          {fullBulan}
        </Typography>
        <Typography variant="body2">
          Pendapatan: Rp {pendapatan.toLocaleString()}
        </Typography>
      </Card>
    );
  }
  return null;
};

const CustomTooltipPasien = ({ active, payload }) => {
  if (active && payload?.length) {
    const { fullBulan, pasien } = payload[0].payload;
    return (
      <Card sx={{ p: 1 }}>
        <Typography variant="body2" fontWeight={600}>
          {fullBulan}
        </Typography>
        <Typography variant="body2">Pasien: {pasien} orang</Typography>
      </Card>
    );
  }
  return null;
};

const CustomTooltipGigi = ({ active, payload }) => {
  if (active && payload?.length) {
    const { fullBulan, jumlah_gigi } = payload[0].payload;
    return (
      <Card sx={{ p: 1 }}>
        <Typography variant="body2" fontWeight={600}>
          {fullBulan}
        </Typography>
        <Typography variant="body2">
          Jumlah Gigi: {jumlah_gigi.toLocaleString()}
        </Typography>
      </Card>
    );
  }
  return null;
};

const Dashboard = () => {
  const theme = useTheme();
  const { data, isLoading, isError } = useFetchDashboard();

  if (isLoading) {
    return (
      <Box
        p={3}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Gagal memuat data dashboard. Silakan coba lagi.
        </Alert>
      </Box>
    );
  }

  const totalPendapatanHariIni = data?.pendapatan_hari_ini?.jumlah || 0;

  const dataPendapatanBulanan =
    data?.grafik_pendapatan?.map((item) => ({
      bulan: item.bulan.split(" ")[0].slice(0, 3),
      fullBulan: item.bulan,
      pendapatan: item.jumlah_pendapatan,
    })) || [];

  const dataPasienBulanan =
    data?.grafik_pasien?.map((item) => ({
      bulan: item.bulan.split(" ")[0].slice(0, 3),
      fullBulan: item.bulan,
      pasien: item.jumlah_pasien,
    })) || [];

  const dataGigiBulanan =
    data?.grafik_gigi?.map((item) => ({
      bulan: item.bulan.split(" ")[0].slice(0, 3),
      fullBulan: item.bulan,
      jumlah_gigi: item.jumlah_gigi,
    })) || [];

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
          <InfoCard
            icon={People}
            title="Pasien Hari Ini"
            value={data?.jumlah_pendaftaran_hari_ini || 0}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <InfoCard
            icon={CalendarMonth}
            title="Pasien Bulan Ini"
            value={data?.jumlah_pendaftaran_bulan_ini || 0}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <InfoCard
            icon={MonetizationOn}
            title="Pendapatan Hari Ini"
            value={`Rp ${totalPendapatanHariIni.toLocaleString()}`}
            color={theme.palette.success.main}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Pendapatan per Bulan
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataPendapatanBulanan}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" />
                  <YAxis tickFormatter={(v) => `Rp ${v / 1000000}jt`} />
                  <Tooltip content={<CustomTooltipPendapatan />} />
                  <Legend />
                  <Bar
                    dataKey="pendapatan"
                    fill={theme.palette.primary.main}
                    name="Pendapatan"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Pasien per Bulan
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataPasienBulanan}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" />
                  <YAxis />
                  <Tooltip content={<CustomTooltipPasien />} />
                  <Legend />
                  <Bar
                    dataKey="pasien"
                    fill={theme.palette.secondary.main}
                    name="Jumlah Pasien"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="h6" mt={4}>
          Jumlah Gigi per Bulan
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dataGigiBulanan}>
            <defs>
              <linearGradient id="colorGigi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e57373" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#e57373" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bulan" />
            <YAxis />
            <Tooltip content={<CustomTooltipGigi />} />
            <Area
              type="monotone"
              dataKey="jumlah_gigi"
              stroke="#e57373"
              fillOpacity={1}
              fill="url(#colorGigi)"
              name="Jumlah Gigi"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Grid>
    </Box>
  );
};

export default Dashboard;
