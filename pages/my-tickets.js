import * as React from "react";
import Box from "@mui/material/Box";

import Typography from "@mui/material/Typography";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";

import {
  DisplayMintedItems,
  DisplayBoughtItems,
  DisplayListedItems,
  DisplayRoyalitiesPaid,
  DisplayMintedItemsInTable,
  DisplayMyOwnItemsInTable,
} from "@/src/utils/queryUtility";
import { useAccount } from "wagmi";
import ClientOnly from "@/src/utils/clientOnly";

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

function HomeContent() {
  const { isConnected, address: signerAddress } = useAccount();

  return (
    <ClientOnly>
      {!isConnected ? (
        <div>Please connect to your wallet...</div>
      ) : (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                <DisplayMyOwnItemsInTable signerAddress={signerAddress} />
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                <DisplayMintedItemsInTable
                  title="Minted Items"
                  flexColumnName="Beneficiary"
                  signerAddress={signerAddress}
                />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                <DisplayMintedItems signerAddress={signerAddress} />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                <DisplayBoughtItems signerAddress={signerAddress} />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                <DisplayListedItems signerAddress={signerAddress} />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                <DisplayRoyalitiesPaid signerAddress={signerAddress} />
              </Paper>
            </Grid>
          </Grid>
          <Copyright sx={{ pt: 4 }} />
        </Container>
      )}
    </ClientOnly>
  );
}

export default function Home() {
  return <HomeContent />;
}
