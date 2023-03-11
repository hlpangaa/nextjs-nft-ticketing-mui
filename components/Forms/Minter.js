import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import Button from "@mui/material/Button";
import EventCard from "@/components/Cards/EventCard";
import Image from "next/image";
import { ethers, BigNumber } from "ethers";

// import from project files
import FlipCard, { BackCard, FrontCard } from "@/components/Cards/FlipCard";

// project consts
import networkMapping from "@/constants/networkMapping.json";
import nftMarketplaceAbi from "../../constants/NftMarketplace.json";
import eventFactoryAbi from "../../constants/EventFactory.json";
import eventContractAbi from "../../constants/EventContract.json";
const nftMarketplaceAddress = networkMapping["5"]["NftMarketplace"].toString();
const eventFactoryAddress = networkMapping["5"]["EventFactory"].toString();

const imageUri =
  "https://gateway.pinata.cloud/ipfs/QmQ3q5h3zkhkG6sXBs2PuKJ5E9tsbpPGcYkcJU5PYcUVCG";

import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useContractRead,
  useNetwork,
  erc20ABI,
} from "wagmi";

export function Minter(props) {
  const { nftAddress, ...rest } = props;

  //react hook
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const [totalMinted, setTotalMinted] = React.useState(0);

  // wagmi hook
  const { isConnected, address: signerAddress } = useAccount();
  const { chain } = useNetwork();

  // 0. read mint price first
  const { data: mintFee } = useContractRead({
    address: nftAddress,
    abi: eventContractAbi,
    functionName: "mintFee",
    watch: true,
    onError(error) {
      console.log("Error", error);
    },
  });

  // 1. call mint function to wrtie
  const { config } = usePrepareContractWrite({
    mode: "prepared",
    address: nftMarketplaceAddress,
    abi: nftMarketplaceAbi,
    functionName: "mintFromMarketplace",
    args: [signerAddress, nftAddress],
    chainId: 5,
    overrides: {
      value: mintFee,
      gasLimit: BigNumber.from(2100000),
    },
    onError(error) {
      console.log("Error", error);
    },
  });

  const {
    data: sendTxResult,
    write: sendTx,
    isLoading: isTxLoading,
    isSuccess: isTxStarted,
    error: sendTxError,
  } = useContractWrite(config);

  const {
    data: txReceipt,
    isSuccess: txSuccess,
    error: txReceiptError,
  } = useWaitForTransaction({
    hash: sendTxResult?.hash,
  });

  // 2. call read function

  const { data: supplyCap } = useContractRead({
    address: nftAddress,
    abi: eventContractAbi,
    functionName: "supplyCap",
    watch: true,
    onError(error) {
      console.log("Error", error);
    },
  });

  const { data: nextToken } = useContractRead({
    address: nftAddress,
    abi: eventContractAbi,
    functionName: "_getNextTokenId",
    watch: true,
    onError(error) {
      console.log("Error", error);
    },
  });

  const isMinted = txSuccess;

  let disabled = !sendTx || isTxLoading || isTxStarted;

  React.useEffect(() => {
    if (supplyCap && nextToken) {
      const totalSupply = supplyCap - nextToken + 1;
      setTotalMinted(totalSupply);
    }
  }, [supplyCap, nextToken]);
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* CreateEventForm */}
        <Grid item xs={5.5}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" gutterBottom>
              Mint your ticket
            </Typography>
            <Typography variant="body2" gutterBottom>
              {totalMinted} tickets remain...
            </Typography>
            {sendTxError && (
              <p style={{ marginTop: 24, color: "#FF6257" }}>
                Error: {sendTxError.message}
              </p>
            )}
            {txReceiptError && (
              <p style={{ marginTop: 24, color: "#FF6257" }}>
                Error: {txReceiptError.message}
              </p>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FlipCard>
                  <FrontCard isCardFlipped={isMinted}>
                    <Image
                      fill
                      src={imageUri}
                      alt="Mochi"
                      sizes="(max-width: 768px) 100vw,
                (max-width: 1200px) 50vw,
                33vw"
                      priority="false"
                    />
                    <h1 style={{ marginTop: 24 }}>Rainbow NFT</h1>
                  </FrontCard>
                  <BackCard isCardFlipped={isMinted}>
                    <div style={{ padding: 24 }}>
                      <Image
                        src={imageUri}
                        width="80"
                        height="80"
                        alt="Mochi"
                        style={{ borderRadius: 8 }}
                      />
                      <h2 style={{ marginTop: 24, marginBottom: 6 }}>
                        Ticket NFT Minted!
                      </h2>
                      <p style={{ marginBottom: 24 }}>
                        Your Ticket will show up in your wallet in the next few
                        minutes.
                      </p>
                      <p style={{ marginBottom: 6 }}>
                        View on{" "}
                        <a
                          href={`https://goerli.etherscan.io/tx/${sendTxResult?.hash}`}
                        >
                          Etherscan
                        </a>
                      </p>
                      <p>
                        View on{" "}
                        <a
                          href={`https://testnets.opensea.io/assets/goerli/${txReceipt?.to}/1`}
                        >
                          Opensea
                        </a>
                      </p>
                    </div>
                  </BackCard>
                </FlipCard>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Typography variant="body2" color="text.secondary">
                    {isTxLoading && "Waiting for approval..."}
                    {isTxStarted && !isMinted && "Minting in progress..."}
                  </Typography>
                  {isMinted && (
                    <Typography variant="body2" color="text.secondary">
                      Ticket has been minted in Goerli Network.
                      <Link
                        href={`https://goerli.etherscan.io/tx/${sendTxResult.hash}`}
                      >
                        (view Tx)
                      </Link>
                    </Typography>
                  )}

                  {mounted && isConnected && !isMinted && (
                    <Button
                      style={{ marginTop: 24 }}
                      variant="contained"
                      sx={{ mt: 3, ml: 1 }}
                      disabled={!sendTx || isTxLoading || isTxStarted}
                      className="button"
                      onClick={() => sendTx?.()}
                    >
                      Mint
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item>
          <EventCard nftAddress={nftAddress} />
        </Grid>
      </Grid>
    </Container>
  );
}
