import { useQuery } from "@apollo/client";
import FeaturedPost from "@/components/Cards/FeaturedPost";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import {
  GET_ACTIVE_ITEMS,
  GET_ACTIVE_EVENTS,
  GET_BOUGHT_ITEMS,
  GET_CANCELED_ITEMS,
  GET_LISTED_ITEMS,
  GET_MINTED_ITEMS,
  GET_ROYALITIES_PAID,
  GET_CREATED_EVENTS,
  GET_DISABLED_EVENTS,
  GET_OWNERSHIP_TRANSFERRED_ITEMS,
} from "@/constants/subgraphQueries";

export function DisplayMintedItems() {
  const { loading, error, data } = useQuery(GET_MINTED_ITEMS);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {data.itemMinteds.map(({ id, tokenId, nftAddress }) => (
          <FeaturedPost
            key={id}
            date="01 Jan 2023"
            title={tokenId}
            description={nftAddress}
          ></FeaturedPost>
        ))}
      </Grid>
    </Container>
  );
}

export function DisplayActiveItems() {
  const { loading, error, data } = useQuery(GET_ACTIVE_ITEMS);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {data.activeItems.map(({ id, tokenId, nftAddress }) => (
          <FeaturedPost
            key={id}
            date="01 Jan 2023"
            title={tokenId}
            description={nftAddress}
          ></FeaturedPost>
        ))}
      </Grid>
    </Container>
  );
}

export function DisplayActiveEvents() {
  const { loading, error, data } = useQuery(GET_ACTIVE_EVENTS);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {data.activeEvents.map(({ id, tokenId, nftAddress }) => (
          <FeaturedPost
            key={id}
            date="01 Jan 2023"
            title={tokenId}
            description={nftAddress}
          ></FeaturedPost>
        ))}
      </Grid>
    </Container>
  );
}
