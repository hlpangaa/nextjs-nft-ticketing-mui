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
import { GET_OWNED_ITEMS } from "@/constants/subgraphQueries";
import { useQuery } from "@apollo/client";
import TicketCard from "@/components/Cards/TicketCard";

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
function TicketList() {
  const { isConnected, address: signerAddress } = useAccount();

  const { loading, error, data } = useQuery(GET_OWNED_ITEMS, {
    variables: { owner: signerAddress },
  });

  // console.log("inbound ticket:");
  // console.log(data);

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
                    <Typography variant="h6" color="inherit">
                      My Tickets Page
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Signing in as {signerAddress}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Viewing all tickets owned by signerAddress. Regardless it
                      is from Minting or purchasing.
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
                      !data.itemOwneds ||
                      data.itemOwneds.length === 0) &&
                      !loading && (
                        <Typography variant="body2" color="text.secondary">
                          You don not have ticket.
                        </Typography>
                      )}
                    <Container
                      className="ownedItemList"
                      maxWidth="lg"
                      sx={{ mt: 4, mb: 4 }}
                    >
                      {data?.itemOwneds.map((ticket) => (
                        <Grid item key={ticket.id}>
                          <TicketCard
                            key={ticket.id}
                            nftAddress={ticket.nftAddress}
                            tokenId={ticket.tokenId}
                          />
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
  return <TicketList />;
}
