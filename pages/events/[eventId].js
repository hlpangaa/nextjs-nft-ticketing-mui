import { useRouter } from "next/router";
import { VendingMachine } from "@/components/Forms/VendingMachine";
import EventCard from "@/components/Cards/EventCard";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

export default function EventDetail() {
  const router = useRouter();
  const { eventId } = router.query;

  return (
    <div>
      <h1>Event Details: {eventId}</h1>

      <Grid item xs={12} md={8} lg={9}>
        <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
          <Container
            className="VendingMachine"
            maxWidth="lg"
            sx={{ mt: 4, mb: 4 }}
          >
            <Grid container spacing={4}>
              <Grid item>
                <VendingMachine nftAddress={eventId} />
              </Grid>
              <Grid item>
                <EventCard nftAddress={eventId} />
              </Grid>
            </Grid>
          </Container>
        </Paper>
      </Grid>
    </div>
  );
}
