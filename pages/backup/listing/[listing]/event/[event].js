import * as React from "react";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import LinearProgress from "@mui/material/LinearProgress";

import { useAccount } from "wagmi";
import ClientOnly from "@/src/utils/clientOnly";
import { GET_ACTIVE_ITEMS_BY_ADD } from "@/constants/subgraphQueries";
import { useQuery } from "@apollo/client";
import TicketCard from "@/components/Cards/TicketCard";

//listing/all/event/[event]  - show a active items of a event
import { useRouter } from "next/router";

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

// My Ticket Page
function HomeContent() {
  const router = useRouter();
  const { isConnected, address: signerAddress } = useAccount();
  const { event } = router.query;
  if (typeof event == "string") {
    const isValidAddressLength = event.length == 42;
    if (!isValidAddressLength) {
      router.push("/sell-tickets");
    }
  }

  const { loading, error, data } = useQuery(GET_ACTIVE_ITEMS_BY_ADD, {
    variables: { nftAddress: event },
  });

  console.log("inbound ticket:");
  console.log(data);

  return (
    <ClientOnly>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid item xs={12} md={8} lg={9}>
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
              <Typography variant="body2" color="text.secondary">
                Please connect to your wallet...
              </Typography>
            ) : (
              <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid item xs={12} md={8} lg={9}>
                  <Paper
                    sx={{ p: 2, display: "flex", flexDirection: "column" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Signing in as {signerAddress}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      You are viewing active items of event {event}
                    </Typography>

                    {loading && (
                      <Box sx={{ width: "100%" }}>
                        <Typography variant="body2" color="text.secondary">
                          Loading
                        </Typography>
                        <LinearProgress />
                      </Box>
                    )}

                    {error && (
                      <Typography variant="body2" color="text.secondary">
                        Error : {error.message}
                      </Typography>
                    )}
                    {(!data ||
                      !data.activeItems ||
                      data.activeItems.length === 0) &&
                      !loading && (
                        <Typography variant="body2" color="text.secondary">
                          You don't have ticket.
                        </Typography>
                      )}
                    <Container
                      className="ownedItemList"
                      maxWidth="lg"
                      sx={{ mt: 4, mb: 4 }}
                    >
                      {data?.activeItems.map((ticket) => (
                        <Grid item>
                          <Link
                            href={`/event/${ticket.nftAddress}/token/${ticket.tokenId}`}
                          >
                            <TicketCard
                              key={ticket.id}
                              nftAddress={ticket.nftAddress}
                              tokenId={ticket.tokenId}
                            />
                          </Link>
                        </Grid>
                      ))}
                    </Container>
                  </Paper>
                </Grid>

                <Copyright sx={{ pt: 4 }} />
              </Container>
            )}
          </Box>
        </Grid>
      </Container>
    </ClientOnly>
  );
}

export default function Home() {
  return <HomeContent />;
}
