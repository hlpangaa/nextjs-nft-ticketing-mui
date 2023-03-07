import * as React from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  mainListItems,
  secondaryListItems,
} from "@/components/Navigations/listItems";
import Dashboard from "@/components/Delete/Dashboard";
import Chart from "@/components/Charts/Chart";
import Deposits from "@/components/Deposits";
import Orders from "@/components/Tables/Orders";
import Navigation from "@/components/Navigations/Navigation";
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

const mdTheme = createTheme();

function HomeContent() {
  const [open, setOpen] = React.useState(true);
  const { isConnected, address: signerAddress } = useAccount();

  return (
    <ClientOnly>
      <ThemeProvider theme={mdTheme}>
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          <Navigation />
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
            {!isConnected ? (
              <div>Please connect to your wallet...</div>
            ) : (
              <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
                      <Deposits />
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper
                      sx={{ p: 2, display: "flex", flexDirection: "column" }}
                    >
                      <DisplayMyOwnItemsInTable
                        title="Minted Items"
                        flexColumnName="Beneficiary"
                        minterAddress={signerAddress}
                      />
                    </Paper>
                  </Grid>
                  {/* Recent Orders */}
                  <Grid item xs={12}>
                    <Paper
                      sx={{ p: 2, display: "flex", flexDirection: "column" }}
                    >
                      <DisplayMintedItemsInTable
                        title="Minted Items"
                        flexColumnName="Beneficiary"
                        minterAddress={signerAddress}
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper
                      sx={{ p: 2, display: "flex", flexDirection: "column" }}
                    >
                      <DisplayMintedItems minterAddress="0x0A270fB0CEa1cCB113860B0Af6CbB98c1a0c04C8" />
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper
                      sx={{ p: 2, display: "flex", flexDirection: "column" }}
                    >
                      <DisplayBoughtItems buyerAddress="0x0A270fB0CEa1cCB113860B0Af6CbB98c1a0c04C8" />
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper
                      sx={{ p: 2, display: "flex", flexDirection: "column" }}
                    >
                      <DisplayListedItems sellerAddress="0x0A270fB0CEa1cCB113860B0Af6CbB98c1a0c04C8" />
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper
                      sx={{ p: 2, display: "flex", flexDirection: "column" }}
                    >
                      <DisplayRoyalitiesPaid buyerAddress="0x0A270fB0CEa1cCB113860B0Af6CbB98c1a0c04C8" />
                    </Paper>
                  </Grid>
                </Grid>
                <Copyright sx={{ pt: 4 }} />
              </Container>
            )}
          </Box>
        </Box>
      </ThemeProvider>
    </ClientOnly>
  );
}

export default function Home() {
  return <HomeContent />;
}
