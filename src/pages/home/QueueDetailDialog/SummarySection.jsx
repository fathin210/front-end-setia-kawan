import React from "react";
import { Grid, Table, TableBody, TableCell, TableContainer, TableRow, Paper, Typography } from "@mui/material";
import moment from "moment";
import { formatCurrency } from "../../../utils/common";

const SummarySection = ({ watch, dpAmount, totalBiaya, totalSetelahDP, deposit }) => (
  <Grid item xs={12}>
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableBody>
          {watch("kdtindakan") !== "03" && dpAmount > 0 && (
            <>
              <TableRow>
                <TableCell>
                  <Typography>Total Sebelum DP</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography>{formatCurrency(totalBiaya)}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography>
                    Deposit di tanggal{" "}
                    {moment(deposit.data?.tanggal).format("DD/MM/YYYY")}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography>- {formatCurrency(dpAmount)}</Typography>
                </TableCell>
              </TableRow>
            </>
          )}

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
);

export default SummarySection;