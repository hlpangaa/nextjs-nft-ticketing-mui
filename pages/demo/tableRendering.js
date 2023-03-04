// materials ui packages
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

// datafeching
import { fetchBalance } from "@wagmi/core";

// react packages
import { useEffect, useState } from "react";

// material ui functions
function createData(decimals, formatted, symbol, value) {
  return { decimals, formatted, symbol, value };
}

// export async function getServerSideProps() {
//   const data = fetchBalance({
//     address: "0xA0Cf798816D4b9b9866b5330EEa46a18382f251e",
//   });

//   return { props: { data } };
// }

export default function BasicTable() {
  //declare data structure
  const initialRows = [
    createData("Frozen yoghurt", 1, 6.0, 24),
    createData("Ice cream sandwich", 2, 9.0, 37),
    createData("Eclair", 3, 16.0, 24),
    createData("Cupcake", 4, 3.7, 67),
    createData("Gingerbread", 5, 16.0, 49),
  ];

  let rows = initialRows;

  //declare hook

  // console.log(data);

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Dessert (100g serving)</TableCell>
            <TableCell align="right">Calories</TableCell>
            <TableCell align="right">Fat&nbsp;(g)</TableCell>
            <TableCell align="right">Carbs&nbsp;(g)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.decimals}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.decimals}
              </TableCell>
              <TableCell align="right">{row.formatted}</TableCell>
              <TableCell align="right">{row.symbol}</TableCell>
              <TableCell align="right">{row.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
