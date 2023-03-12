import * as React from "react";

import Box from "@mui/material/Box";

import Toolbar from "@mui/material/Toolbar";

import Typography from "@mui/material/Typography";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";

import Chart from "@/components/Charts/Chart";
import Deposits from "@/components/Deposits";
import Orders from "@/components/Tables/Orders";

import ClientOnly from "@/src/utils/clientOnly";

// project consts
import networkMapping from "@/constants/networkMapping.json";
import nftMarketplaceAbi from "@/constants/NftMarketplace.json";
import eventFactoryAbi from "@/constants/EventFactory.json";
import eventContractAbi from "@/constants/EventContract.json";
const nftMarketplaceAddress = networkMapping["5"]["NftMarketplace"].toString();
const eventFactoryAddress = networkMapping["5"]["EventFactory"].toString();

import { ethers, BigNumber } from "ethers";
import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useContractRead,
  useNetwork,
  erc20ABI,
} from "wagmi";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

function PaymentHistoryContent() {
  const { isConnected, address: signerAddress } = useAccount();
  const [proceedsInETH, setProceedsInETH] = React.useState(0);
  //0. read function getProceeds(address seller) external view returns (uint256)
  const { data: proceeds } = useContractRead({
    address: nftMarketplaceAddress,
    abi: nftMarketplaceAbi,
    functionName: "getProceeds",
    args: [signerAddress],
    chainId: 5,
    watch: true,
    onError(error) {
      console.log("Error", error);
    },
  });

  React.useEffect(() => {
    if (proceeds !== null && proceeds !== 0)
      try {
        setProceedsInETH(ethers.utils.formatEther(proceeds));
      } catch (error) {
        console.log(error);
      }
  }, [proceeds]);
  return (
    <Box
      component="main"
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
        flexGrow: 1,
        height: "100vh",
        overflow: "auto",
      }}
    >
      <Toolbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" color="inherit">
          Payment History - WIP: Only completed Recent Proceeds
        </Typography>
        <Grid container spacing={3}>
          {/* Chart */}
          <Grid item xs={12} md={8} lg={9}>
            <Paper
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 240,
              }}
            >
              <Chart />
            </Paper>
          </Grid>
          {/* Recent Deposits */}
          <Grid item xs={12} md={4} lg={3}>
            <Paper
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 240,
              }}
            >
              <Deposits
                proceeds={proceedsInETH}
                signerAddress={signerAddress}
              />
            </Paper>
          </Grid>
          {/* Recent Orders */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
              <Orders />
            </Paper>
          </Grid>
        </Grid>
        <Copyright sx={{ pt: 4 }} />
      </Container>
    </Box>
  );
}

export default function PaymentHistory() {
  return <PaymentHistoryContent />;
}
