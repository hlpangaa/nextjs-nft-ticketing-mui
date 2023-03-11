import { useRouter } from "next/router";
import { VendingMachine } from "@/components/Forms/VendingMachine";
import { Minter } from "@/components/Forms/Minter";
import EventCard from "@/components/Cards/EventCard";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";

import ClientOnly from "@/src/utils/clientOnly";
import { useAccount } from "wagmi";

export default function EventDetail() {
  const router = useRouter();
  const { event } = router.query;
  const { isConnected, address: signerAddress } = useAccount();

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
                  Viewing event detail of {event}
                </Typography>
                <Container
                  className="VendingMachine"
                  maxWidth="lg"
                  sx={{ mt: 4, mb: 4 }}
                >
                  <Grid container spacing={4}>
                    <Grid item>
                      <Minter nftAddress={event} />
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
}
