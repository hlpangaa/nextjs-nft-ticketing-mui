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

export default function Transcations(props) {
  const { data, ...rest } = props;

  // console.log(`inbound data`);
  // console.log(data);

  return (
    <React.Fragment>
      <Title>Transcations</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Timestamp</TableCell>
            <TableCell>Tx Type</TableCell>
            <TableCell>Tx Hash</TableCell>
            <TableCell>Direction</TableCell>
            <TableCell align="right">Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{handleTimeStamp(row.timestamp)}</TableCell>
              <TableCell>{row.transactionType}</TableCell>
              <TableCell>
                {handleAddress(row.txHash ? row.txHash : "")}{" "}
                <Link href={`https://goerli.etherscan.io/tx/${row?.txHash}`}>
                  (view)
                </Link>
              </TableCell>
              <TableCell>{row.direction}</TableCell>

              {row.transactionType === "Mint Fee Paid" ||
              row.transactionType === "Mint Fee Received" ? (
                <DisplayMintFee
                  direction={row.direction}
                  nftAddress={row.nftAddress}
                />
              ) : (
                <TableCell
                  align="right"
                  style={{ color: row.value < 0 ? "red" : "green" }}
                >
                  {row.value ? handleCurrencyFormat(row.value, "ETH") : 0} ETH
                </TableCell>
              )}
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
