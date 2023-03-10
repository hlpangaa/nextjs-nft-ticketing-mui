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
  GET_OWNED_ITEMS,
  GET_MY_EVENTS,
} from "@/constants/subgraphQueries";
import Title from "@/components/Typography/Title";
import TranscationTable from "@/components/Tables/TranscationTable";
import { getMintFee } from "@/src/utils/contractUtility";
import ClientOnly from "@/src/utils/clientOnly";
import { useState, useEffect } from "react";
import RecentEventCard from "@/components/Cards/RecentEventCard";
import ExpandableCard from "@/components/Cards/ExpandableCard";
import {
  handleAddress,
  handleTimeStamp,
  handleCurrencyFormat,
} from "@/src/utils/stringUtility";
import ActionAreaCard from "@/components/Cards/ActionAreaCard";
import ActionAreaCardPreview from "@/components/Cards/ActionAreaCardPreview";

/** Pages
 * 1. My Event
 * - 1.1 Event I created
 * - 1.2 Event I disabled
 * - 1.3 MintedFee record that paid me
 * - 1.4 Royality that paid me
 * 2. Craete Event - doesn't need queryUtility
 * 3. My Tickets
 * - 3.1 NFT that I owned (enumable) *********
 * - [3.2] NFT that I minted
 * - 3.3 NFT that I bought
 * - 3.4 NFT that I listed in P2P market
 * - 3.5 Royalities that I paid
 * - 3.6 Fund that I can withdraw (contract) ************
 * - 3.7 NFT that I sold XXXXXX
 * 4. Mint Ticket - entry point should come from others or need to input nft address
 * 5. Sell Tickets
 * - 5.1 all active listing
 * 6. Recent Events
 * - 6.1 all active events
 *
 * Display type:
 * Record purpose - block, timestamp ,Txhash, transcation type, counter party
 * invoice purpose - price/ amount - listing/minted/bought
 * URI
 *  */

// I wish to know the information of my comming events
export function DisplayMyOwnItemsInTable(props) {
  const { signerAddress, ...rest } = props;

  const { loading, error, data } = useQuery(GET_OWNED_ITEMS, {
    variables: { owner: signerAddress.toString() },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  const rows = data.itemOwneds.map((obj) => ({
    ...obj,
    id: obj.id,
    timestamp: obj.timestamp.toString(),
    nftAddress: obj.nftAddress,
    owner: obj.owner,
    transcationType: "Mint",
    tokenId: obj.tokenId,
    txHash: obj.txHash,
    blockNumber: obj.blockNumber,
    gasPrice: obj.gasPrice,
  }));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Title>My Tickets </Title>
      <Grid container spacing={4}>
        {rows.map((row) => (
          <ActionAreaCard key={row.id} row={row} />
        ))}
      </Grid>
    </Container>
  );
}

// 1.3 My Event: DisplayCreatedEvents => (nft) => call query for itemMinted + call contract for mintedFee
export function DisplayMintedItems(signerAddress) {
  const { loading, error, data } = useQuery(GET_MINTED_ITEMS, {
    variables: { minter: signerAddress.toString() },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Title>Minted Items</Title>
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
// [3.2] My Ticket (account as minter)
export function DisplayMintedItemsInTable(props) {
  const { title, flexColumnName, signerAddress, ...rest } = props;

  const { loading, error, data } = useQuery(GET_MINTED_ITEMS, {
    variables: { minter: signerAddress.toString() },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  const rows = data.itemMinteds.map((obj) => ({
    ...obj,
    id: obj.id,
    timestamp: obj.timestamp.toString(),
    hash: obj.nftAddress,
    flexColumn: obj.beneficiary,
    transcationType: "Mint",
    value: "",
    txHash: obj.txHash,
    blockNumber: obj.blockNumber,
    gasPrice: obj.gasPrice,
  }));

  return (
    <>
      {loading ? (
        <div>is Loading</div>
      ) : (
        <TranscationTable
          title={title}
          flexColumnName={flexColumnName}
          rows={rows}
        ></TranscationTable>
      )}
    </>
  );
}

// 1.4 My Event(account as receiver)
// 3.5 My Ticket(account as buyer)
export function DisplayRoyalitiesPaid(buyerAddress) {
  const { loading, error, data } = useQuery(GET_ROYALITIES_PAID, {
    variables: { buyer: buyerAddress.toString() },
  });
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Title>Royalities Paid</Title>
      {/* <Grid container spacing={4}>
        {data.royalityPaids.map(({ id, tokenId, nftAddress }) => (
          <FeaturedPost
            key={id}
            date="01 Jan 2023"
            title={tokenId}
            description={nftAddress}
          ></FeaturedPost>
        ))}
      </Grid> */}
    </Container>
  );
}

// 5.1 Sell Tickets page (get top 20) - ok
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

// [3.3] My Ticket (account as buyer)
export function DisplayBoughtItems(buyerAddress) {
  const { loading, error, data } = useQuery(GET_BOUGHT_ITEMS, {
    variables: { buyer: buyerAddress.toString() },
  });
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Title>Bought Items</Title>
      <Grid container spacing={4}>
        {data.itemBoughts.map(({ id, tokenId, nftAddress }) => (
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

export function DisplayCanceledItems() {
  const { loading, error, data } = useQuery(GET_CANCELED_ITEMS);
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
//[3.4] My Ticket (account as seller)
export function DisplayListedItems(sellerAddress) {
  const { loading, error, data } = useQuery(GET_LISTED_ITEMS, {
    variables: { seller: sellerAddress.toString() },
  });
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Title>Listed Items</Title>
      <Grid container spacing={4}>
        {data.itemListeds.map(({ item }) => (
          <FeaturedPost />
        ))}
      </Grid>
    </Container>
  );
}

// [6.1] Recent Events (get top 20)
export function DisplayActiveEvents(props) {
  const { signerAddress, ...rest } = props;

  const { loading, error, data } = useQuery(GET_ACTIVE_EVENTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  const rows = data.activeEvents.map((obj) => ({
    ...obj,
    id: obj.id,
    timestamp: handleTimeStamp(obj.timestamp),
    nftAddress: obj.nft,
    creator: obj.creator,
    transcationType: "Recent Events",
    value: "",
    txHash: obj.txHash,
    blockNumber: obj.blockNumber,
    gasPrice: obj.gasPrice,
  }));
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Title>Recent Event </Title>
      <Grid container spacing={4}>
        {rows.map((row) => (
          <ActionAreaCard key={row.id} row={row} />
        ))}
      </Grid>
    </Container>
  );
}
//RecentEventCard

// 1.1 My Events: (account = creator)=>(nft)
export function DisplayCreatedEvents(props) {
  const { signerAddress, ...rest } = props;
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState(null);

  const { loading, error, data } = useQuery(GET_MY_EVENTS, {
    variables: { creator: signerAddress.toString() },
  });
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  console.log("inbound data:");
  console.log(data);
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {data.activeEvents.map((item) => (
          <ActionAreaCardPreview key={item.id} item={item} />
        ))}
      </Grid>
    </Container>
  );
}
// 1.2 My Events: (account = caller)=>(nft)
export function DisplayDisabledEvents(userAddress) {
  const { loading, error, data } = useQuery(GET_DISABLED_EVENTS);
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
