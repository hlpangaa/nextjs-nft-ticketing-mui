import * as React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import Navigation from "@/components/Navigations/Navigation";

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

const mdTheme = createTheme();

// My Event Page
function HomeContent() {
  const { isConnected, address: signerAddress } = useAccount();
  const [selectedEvent, setSelectedEvent] = React.useState(null);
  const [events, setEvents] = React.useState(null);

  const { loading, error, data } = useQuery(GET_MY_EVENTS, {
    variables: { creator: signerAddress },
  });
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  console.log("inbound events:");
  console.log(events);

  return (
    <ClientOnly>
      <ThemeProvider theme={mdTheme}>
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
              {/* <Grid container spacing={3}> */}
              <div>Index Page</div>
              <Grid item xs={12} md={8} lg={9}>
                <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                  <Container
                    className="activeEventList"
                    maxWidth="lg"
                    sx={{ mt: 4, mb: 4 }}
                  >
                    <Grid container spacing={4}>
                      {data.activeEvents.map((event) => (
                        <Grid item>
                          <Link href={`/events/${event.nft}`}>
                            <EventCard key={event.id} nftAddress={event.nft} />
                          </Link>
                        </Grid>
                      ))}
                    </Grid>
                  </Container>
                </Paper>
              </Grid>
              {/* </Grid> */}
              <Copyright sx={{ pt: 4 }} />
            </Container>
          )}
        </Box>
      </ThemeProvider>
    </ClientOnly>
  );
}

export default function Home() {
  return <HomeContent />;
}
