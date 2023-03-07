import * as React from "react";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Title from "../Typography/Title";
import {
  handleAddress,
  handleTimeStamp,
  handleCurrencyFormat,
} from "@/src/utils/stringUtility";
import { DisplayMintFee, getMintFee } from "@/src/utils/contractUtility";

function preventDefault(event) {
  event.preventDefault();
}

export default function TranscationTable(props) {
  const { rows, title, flexColumnName, ...rest } = props;
  return (
    <React.Fragment>
      <Title>{title}</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Timestamp</TableCell>
            <TableCell>Tx Type</TableCell>
            <TableCell>Tx Hash</TableCell>
            <TableCell>{flexColumnName}</TableCell>
            <TableCell align="right">Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{handleTimeStamp(row.timestamp)}</TableCell>
              <TableCell>{row.transcationType}</TableCell>
              <TableCell>
                {handleAddress(row.txHash)}{" "}
                <Link href={`https://goerli.etherscan.io/tx/${row?.txHash}`}>
                  (view)
                </Link>
              </TableCell>
              <TableCell>
                {handleAddress(row.flexColumn)}
                <Link
                  href={`https://goerli.etherscan.io/address/${row?.flexColumn}`}
                >
                  (view)
                </Link>
              </TableCell>

              <DisplayMintFee nftAddress={row.nftAddress} />
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Link color="primary" href="#" onClick={preventDefault} sx={{ mt: 3 }}>
        See more orders
      </Link>
    </React.Fragment>
  );
}
