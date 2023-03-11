import { useRouter } from "next/router";
import TicketCard from "@/components/Cards/TicketCard";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import QRCode from "qrcode.react";

const TicketDetailPage = () => {
  const router = useRouter();
  const { event, token } = router.query;

  const qrValue = `${event}-${token}`;

  return (
    <div>
      <h1>Ticket Details: {event}</h1>
      <h1>Token: {event}</h1>

      <Grid item xs={12} md={8} lg={9}>
        <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
          <Container
            className="Ticket Detail"
            maxWidth="lg"
            sx={{ mt: 4, mb: 4 }}
          >
            <Grid item>
              <TicketCard nftAddress={event} tokenId={token} />
            </Grid>
            <Grid item>
              <QRCode value={qrValue} />
            </Grid>
          </Container>
        </Paper>
      </Grid>
    </div>
  );
};

export default TicketDetailPage;
