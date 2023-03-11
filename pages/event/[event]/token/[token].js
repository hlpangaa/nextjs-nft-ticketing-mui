import * as React from "react";
import { useRouter } from "next/router";
import TicketCard from "@/components/Cards/TicketCard";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import QRCode from "qrcode.react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { useAccount } from "wagmi";
import ClientOnly from "@/src/utils/clientOnly";
import { UriViewer } from "@/components/Tables/UriViewer";
import Router from "next/router";

const TicketDetailPage = () => {
  const router = useRouter();
  const { event, token } = router.query;
  const { isConnected, address: signerAddress } = useAccount();
  const [showJson, setShowJson] = React.useState(false);
  if (typeof event == "string") {
    const isValidAddressLength = event.length == 42;
    if (!isValidAddressLength) {
      Router.push("/recent-events");
    }
  }
  const qrValue = `${event}-${token}-${signerAddress}`;

  function handleShowJson() {
    setShowJson(!showJson);
  }

  return (
    <ClientOnly>
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
            <Grid item xs={12} md={8} lg={9}>
              <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                <Typography variant="body2" color="text.secondary">
                  Viewing event detail of token {token} in {event}
                </Typography>
                <Container
                  className="Ticket Detail"
                  maxWidth="lg"
                  sx={{ mt: 4, mb: 4 }}
                >
                  <Grid xs={12}>
                    <Grid item xs={8}>
                      <TicketCard nftAddress={event} tokenId={token} />
                    </Grid>
                    <Grid item xs={4}>
                      <Paper
                        sx={{ p: 2, display: "flex", flexDirection: "column" }}
                      >
                        <Typography variant="h6" gutterBottom>
                          Scan QR Code to entry
                        </Typography>
                        <QRCode value={qrValue} />
                        <Typography variant="body2" color="text.secondary">
                          &nbsp;&nbsp;
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          it's the combination of the event contract hash, token
                          id and signerAddress
                        </Typography>
                        <Box
                          sx={{ display: "flex", justifyContent: "flex-end" }}
                        >
                          <Button
                            style={{ marginTop: 24 }}
                            variant="contained"
                            sx={{ mt: 3, ml: 1 }}
                            // disabled={!sendTx || isTxLoading || isTxStarted}
                            className="button"
                            onClick={handleShowJson}
                          >
                            {!showJson
                              ? "Display Ticket URI"
                              : "Hidden Ticket URI"}
                          </Button>
                          <Button
                            style={{ marginTop: 24 }}
                            variant="contained"
                            sx={{ mt: 3, ml: 1 }}
                            // disabled={!sendTx || isTxLoading || isTxStarted}
                            className="button"
                            href="/sell-ticket"
                          >
                            Ticket Swap
                          </Button>
                        </Box>
                        {showJson ? (
                          <UriViewer nftAddress={event} tokenId={token} />
                        ) : (
                          <></>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                </Container>
              </Paper>
            </Grid>
          </Container>
        )}
      </Box>
    </ClientOnly>
  );
};

export default TicketDetailPage;
