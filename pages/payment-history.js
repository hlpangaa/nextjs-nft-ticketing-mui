import * as React from "react";

import Box from "@mui/material/Box";

import Toolbar from "@mui/material/Toolbar";

import Typography from "@mui/material/Typography";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";

import Chart from "@/components/Charts/Chart";
import Deposits from "@/components/Deposits";
import Orders from "@/components/Tables/Orders";

import ClientOnly from "@/src/utils/clientOnly";
import Transcations from "@/components/Tables/Transcations";

// project consts
import networkMapping from "@/constants/networkMapping.json";
import nftMarketplaceAbi from "@/constants/NftMarketplace.json";
import eventFactoryAbi from "@/constants/EventFactory.json";
import eventContractAbi from "@/constants/EventContract.json";
const nftMarketplaceAddress = networkMapping["5"]["NftMarketplace"].toString();
const eventFactoryAddress = networkMapping["5"]["EventFactory"].toString();

import { ethers, BigNumber } from "ethers";
import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useContractRead,
  useNetwork,
  erc20ABI,
} from "wagmi";

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
  GET_MINTED_ITEMS_BY_ADDRESS_ARRAY,
  GET_ROYALITIES_BY_RECEIVER,
} from "@/constants/subgraphQueries";
import { useQuery } from "@apollo/client";

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

function PaymentHistoryContent() {
  const { isConnected, address: signerAddress } = useAccount();
  const [proceedsInETH, setProceedsInETH] = React.useState(0);

  // ----------------------Contracet Read function---------------------------------------------
  //0. read function getProceeds(address seller) external view returns (uint256)
  const { data: proceeds } = useContractRead({
    address: nftMarketplaceAddress,
    abi: nftMarketplaceAbi,
    functionName: "getProceeds",
    args: [signerAddress],
    chainId: 5,
    watch: true,
    onError(error) {
      console.log("Error", error);
    },
  });

  ///-------------------------------Graph QL for Transcation Table---------------------------------------------

  // ------------------------1. get raw data------------------------

  // Payout
  // Transcation 1 - mintedPaidData: GET_MINTED_ITEMS(minter) return itemMinteds {txhash, timestamp, direction(payout), value(null) }
  // Transcation 2 - boughtPaidData: GET_BOUGHT_ITEMS(buyer) return itemBoughts {txhash, timestamp, direction(payout), value(price)}
  // Transcation 3 - royalitiesPaidData: GET_ROYALITIES_PAID(buyer) return royalityPaids {txhash, timestamp, direction(payout), value(royaltyAmount)}

  // Receive
  // Transcation 0 - createdEventsData: GET_CREATED_EVENTS(creator) return contractCreateds {nft}
  // Transcation 1 - mintedReceivedData: GET_MINTED_ITEMS_BY_ADDRESS(nftAddress) return itemMinteds {txhash, timestamp, direction(receive), value(null) }
  // Transcation 2 - boughtReceivedData: GET_BOUGHT_ITEMS_BY_SELLER(seller) return itemBoughts {txhash, timestamp, direction(receive), value(price)}
  // Transcation 3 - royalitiesReceivedData: GET_ROYALITIES_BY_RECEIVER(receiver) return royalityPaids {txhash, timestamp, direction(receive), value(royaltyAmount)}

  const { data: mintedPaidData } = useQuery(GET_MINTED_ITEMS, {
    variables: { minter: signerAddress },
  });

  const { data: boughtPaidData } = useQuery(GET_BOUGHT_ITEMS, {
    variables: { buyer: signerAddress },
  });

  const { data: royalitiesPaidData } = useQuery(GET_ROYALITIES_PAID, {
    variables: { buyer: signerAddress },
  });

  const { data: createdEventsData } = useQuery(GET_CREATED_EVENTS, {
    variables: { creator: signerAddress },
  });

  const nftAddresses = createdEventsData?.contractCreateds?.map(
    (event) => event.nft
  );

  const { data: mintedReceivedData } = useQuery(
    GET_MINTED_ITEMS_BY_ADDRESS_ARRAY,
    {
      variables: { nftAddress: nftAddresses },
    }
  );

  // Need rework indexing: issue when no seller param in envent...
  // const { data: boughtReceivedData } = useQuery(GET_BOUGHT_ITEMS_BY_SELLER, {
  //   variables: { buyer: signerAddress },
  // });

  const { data: royalitiesReceivedData } = useQuery(
    GET_ROYALITIES_BY_RECEIVER,
    {
      variables: { receiver: signerAddress },
    }
  );

  //------------------------ 2. re-map data------------------------

  const transactions = [];

  if (mintedPaidData && mintedPaidData.itemMinteds) {
    transactions.push(
      ...mintedPaidData.itemMinteds.map((item) => ({
        id: item.txHash + "MFP",
        txHash: item.txHash,
        timestamp: item.timestamp,
        transactionType: "Mint Fee Paid",
        direction: "-",
        value: "",
        nftAddress: item.nftAddress,
        tokenId: item.tokenId,
      }))
    );
  }

  //known issue: itemBought event has bug in FTMarketplace.sol contract. Need redeploy all.
  if (boughtPaidData && boughtPaidData.itemBoughts) {
    transactions.push(
      ...boughtPaidData.itemBoughts.map((item) => ({
        id: item.txHash + "BPP",
        txHash: item.txHash,
        timestamp: item.timestamp,
        transactionType: "Buy Price Paid",
        direction: "-",
        value: ethers.utils.parseEther("0.1").mul(-1),
        nftAddress: item.nftAddress,
        tokenId: item.tokenId,
      }))
    );
  }

  if (royalitiesPaidData && royalitiesPaidData.royalityPaids) {
    transactions.push(
      ...royalitiesPaidData.royalityPaids.map((item) => ({
        id: item.txHash + "RP",
        txHash: item.txHash,
        timestamp: item.timestamp,
        transactionType: "Royality Paid",
        direction: "-",
        value: -item.royaltyAmount,
        nftAddress: item.nftAddress,
        tokenId: item.tokenId,
      }))
    );
  }

  if (mintedReceivedData && mintedReceivedData.itemMinteds) {
    transactions.push(
      ...mintedReceivedData.itemMinteds.map((item) => ({
        id: item.txHash + "MFR",
        txHash: item.txHash,
        timestamp: item.timestamp,
        transactionType: "Mint Fee Received",
        direction: "+",
        value: item.price,
        nftAddress: item.nftAddress,
        tokenId: item.tokenId,
      }))
    );
  }

  if (royalitiesReceivedData && royalitiesReceivedData.royalityPaids) {
    transactions.push(
      ...royalitiesReceivedData.royalityPaids.map((item) => ({
        id: item.txHash + "RR",
        txHash: item.txHash,
        timestamp: item.timestamp,
        transactionType: "Royality Received",
        direction: "+",
        value: item.royaltyAmount,
        nftAddress: item.nftAddress,
        tokenId: item.tokenId,
      }))
    );
  }

  //------------------------ 3. sorting------------------------

  transactions.sort((a, b) => b.timestamp - a.timestamp);

  // console.log(transactions);

  // console.log(mintedPaidData);
  // console.log(boughtPaidData);
  // console.log(royalitiesPaidData);
  // console.log(mintedReceivedData);
  // console.log(royalitiesReceivedData);
  // console.log(transactions);

  // React Hook

  React.useEffect(() => {
    if (proceeds !== null && proceeds !== 0)
      try {
        setProceedsInETH(ethers.utils.formatEther(proceeds));
      } catch (error) {
        console.log(error);
      }
  }, [proceeds]);
  return (
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" color="inherit">
          Payment History - WIP
        </Typography>
        <Grid container spacing={3}>
          {/* Chart */}
          <Grid item xs={12} md={8} lg={9}>
            <Paper
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 240,
              }}
            >
              <Chart />
            </Paper>
          </Grid>
          {/* Recent Deposits */}
          <Grid item xs={12} md={4} lg={3}>
            <Paper
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 240,
              }}
            >
              <Deposits
                proceeds={proceedsInETH}
                signerAddress={signerAddress}
              />
            </Paper>
          </Grid>

          {/* Transcations */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
              <Transcations data={transactions} />
            </Paper>
          </Grid>
        </Grid>
        <Copyright sx={{ pt: 4 }} />
      </Container>
    </Box>
  );
}

export default function PaymentHistory() {
  return <PaymentHistoryContent />;
}
