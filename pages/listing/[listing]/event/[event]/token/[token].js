import * as React from "react";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";

import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";

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
function HomeContent() {
  const { isConnected, address: signerAddress } = useAccount();

  const { loading, error, data } = useQuery(GET_OWNED_ITEMS, {
    variables: { owner: signerAddress },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  console.log("inbound data:");
  console.log(data);

  return (
    <ClientOnly>
      {!isConnected ? (
        <div>Please connect to your wallet...</div>
      ) : (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <div>Index Page</div>
          <Grid item xs={12} md={8} lg={9}>
            <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
              <Container
                className="ownedItemList"
                maxWidth="lg"
                sx={{ mt: 4, mb: 4 }}
              >
                {data.itemOwneds?.map((ticket) => (
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
    </ClientOnly>
  );
}

export default function Home() {
  return <HomeContent />;
}
