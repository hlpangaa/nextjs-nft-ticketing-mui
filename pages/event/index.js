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
import { GET_MY_EVENTS } from "@/constants/subgraphQueries";
import { useQuery } from "@apollo/client";
import EventCard from "@/components/Cards/EventCard";

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

// My Event Page
function EventList() {
  const { isConnected, address: signerAddress } = useAccount();

  const { loading, error, data } = useQuery(GET_MY_EVENTS, {
    variables: { creator: signerAddress },
  });

  console.log("inbound events:");
  console.log(data);

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
          display: "flex",
          flexDirection: "column",
          width: "100%",
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
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  minWidth: "400",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Signing in as {signerAddress}
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
                  !data.activeEvents ||
                  data.activeEvents.length === 0) &&
                  !loading && (
                    <Typography variant="body2" color="text.secondary">
                      You don't have event.
                    </Typography>
                  )}
                <Container
                  className="activeEventList"
                  maxWidth="lg"
                  sx={{ mt: 4, mb: 4 }}
                >
                  <Grid
                    container
                    spacing={3}
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                    }}
                  >
                    {data?.activeEvents.map((event) => (
                      // <Grid item xs={12} sm={6} md={4} lg={3}>
                      <Grid item xs={12} sm={8} md={6} lg={4}>
                        <Link href={`/event/${event.nft}`}>
                          <EventCard key={event.id} nftAddress={event.nft} />
                        </Link>
                      </Grid>
                    ))}
                  </Grid>
                </Container>
              </Paper>
            </Grid>
            <Copyright sx={{ pt: 4 }} />
          </Container>
        )}
      </Box>
    </ClientOnly>
  );
}

export default function Home() {
  return <EventList />;
}
