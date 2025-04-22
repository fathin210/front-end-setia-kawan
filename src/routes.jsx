// src/routes.js
import React from "react";
import {
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  MonetizationOn,
  People,
  Person as PersonIcon,
  RequestQuote,
  Settings,
} from "@mui/icons-material";
import DetailPatient from "./pages/patient/detail-patient/DetailPatient";
import Home from "./pages/home/Home";
import ROUTES from "./constants/routes";
import AdminEmployee from "./pages/employee/admin-employee/AdminEmployee";
import Commissions from "./pages/employee/commissions/Commissions";
import TarifKomisiGigi from "./pages/settings/tarif-komisi-gigi/TarifKomisiGigi";
import KomisiKaryawan from "./pages/settings/komisi-karyawan/KomisiKaryawan";
import Earning from "./pages/earning/earning/Earning";
import SummaryEarning from "./pages/earning/summary-earning/SummaryEarning";
import Dashboard from "./pages/dashboard/Dashboard";
import Deposit from "./pages/patient/deposit/Deposit";
import Login from "./pages/login/Login";

export const routes = [
  {
    path: ROUTES.DASHBOARD,
    element: <Dashboard />,
    text: "Dashboard",
    icon: <DashboardIcon />,
    roles: ["admin"],
    showInSidebar: true,
  },
  {
    path: ROUTES.HOME,
    element: <Home />,
    text: "Home",
    icon: <HomeIcon />,
    roles: ["admin", "user"],
    showInSidebar: true,
  },
  {
    text: "Pasien",
    icon: <PersonIcon />,
    roles: ["admin", "user"],
    children: [
      {
        path: ROUTES.PATIENT_DETAIL,
        element: <DetailPatient />,
        text: "Detail Pasien",
        icon: <PersonIcon />,
        roles: ["admin", "user"],
        showInSidebar: true,
      },
      {
        path: ROUTES.DEPOSIT,
        element: <Deposit />,
        text: "Deposit (Uang Muka)",
        icon: <RequestQuote />,
        roles: ["admin", "user"],
        showInSidebar: true,
      },
    ],
    showInSidebar: true,
  },
  {
    text: "Karyawan",
    icon: <People />,
    roles: ["admin", "user"], // hanya admin
    children: [
      {
        path: ROUTES.ADMIN_EMPLOYEE,
        element: <AdminEmployee />,
        text: "Daftar Karyawan",
        icon: <People />,
        roles: ["admin", "user"],
        showInSidebar: true,
      },
      {
        path: ROUTES.EMPLOYEE_COMMISSIONS,
        element: <Commissions />,
        text: "Laporan Komisi Karyawan",
        icon: <RequestQuote />,
        roles: ["admin", "user"],
        showInSidebar: true,
      },
    ],
    showInSidebar: true,
  },
  {
    text: "Pendapatan",
    icon: <RequestQuote />,
    roles: ["admin"], // hanya admin
    children: [
      {
        path: ROUTES.PENDAPATAN,
        element: <Earning />,
        text: "Pendapatan",
        icon: <MonetizationOn />,
        roles: ["admin"],
        showInSidebar: true,
      },
      {
        path: ROUTES.REKAP_PENDAPATAN,
        element: <SummaryEarning />,
        text: "Rekap Pendapatan",
        icon: <RequestQuote />,
        roles: ["admin"],
        showInSidebar: true,
      },
    ],
    showInSidebar: true,
  },
  {
    text: "Pengaturan",
    icon: <Settings />,
    roles: ["admin"], // hanya admin
    children: [
      {
        path: ROUTES.TARIF_KOMISI_GIGI,
        element: <TarifKomisiGigi />,
        text: "Tarif dan Komisi 'Per' Gigi",
        icon: <MonetizationOn />,
        roles: ["admin"],
        showInSidebar: true,
      },
      {
        path: ROUTES.KOMISI_KARYAWAN_PER_SHIFT,
        element: <KomisiKaryawan />,
        text: "Komisi / Shift",
        icon: <RequestQuote />,
        roles: ["admin"],
        showInSidebar: true,
      },
    ],
    showInSidebar: true,
  },
  {
    path: ROUTES.LOGIN,
    element: <Login />,
    text: "Login",
    roles: [],
    showInSidebar: false,
  },
];

export const filterRoutesByRole = (routes, role) => {
  return routes
    .filter((route) => !route.roles || route.roles.includes(role))
    .map((route) => ({
      ...route,
      children: route.children
        ? filterRoutesByRole(route.children, role)
        : undefined,
    }));
};
