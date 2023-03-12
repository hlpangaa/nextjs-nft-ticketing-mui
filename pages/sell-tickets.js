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
import { GET_ACTIVE_ITEMS } from "@/constants/subgraphQueries";
import { useQuery } from "@apollo/client";
import ListingCard from "@/components/Cards/ListingCard";

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

function TicketExchangePage() {
  const { isConnected, address: signerAddress } = useAccount();

  const { loading, error, data } = useQuery(GET_ACTIVE_ITEMS);

  // console.log("inbound active items:");
  // console.log(data);

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
                  width: "75vw",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Ticket Marketplace
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Signing in as {signerAddress}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Viewing all listed Items in NFT Marketplace
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Seller is allowed to update and delist the offer listing.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Buyer is allowed to buy ticket only.
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
                      Marketplace has no listing.
                    </Typography>
                  )}
                <Container
                  className="activeItemsList"
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
                    {data?.activeItems?.map((listing) => (
                      // <Grid item xs={12} sm={6} md={4} lg={3}>
                      <Grid item key={listing.id} xs={12} sm={8} md={6} lg={4}>
                        <ListingCard
                          id={listing.id}
                          nftAddress={listing.nftAddress}
                          tokenId={listing.tokenId}
                          listPrice={listing.price}
                          seller={listing.seller}
                          signerAddress={signerAddress}
                        />
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
  return <TicketExchangePage />;
}
