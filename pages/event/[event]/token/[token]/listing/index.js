import * as React from "react";
import { useRouter } from "next/router";

import TicketCard from "@/components/Cards/TicketCard";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import QRCode from "qrcode.react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";

import ClientOnly from "@/src/utils/clientOnly";
import { UriViewer } from "@/components/Tables/UriViewer";
import Router from "next/router";

// project consts
import networkMapping from "@/constants/networkMapping.json";
import nftMarketplaceAbi from "@/constants/NftMarketplace.json";
import eventFactoryAbi from "@/constants/EventFactory.json";
import eventContractAbi from "@/constants/EventContract.json";
const nftMarketplaceAddress = networkMapping["5"]["NftMarketplace"].toString();
const eventFactoryAddress = networkMapping["5"]["EventFactory"].toString();

const imageUri =
  "https://gateway.pinata.cloud/ipfs/QmQ3q5h3zkhkG6sXBs2PuKJ5E9tsbpPGcYkcJU5PYcUVCG";

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

const ListingDetail = () => {
  const router = useRouter();
  const { event, token } = router.query;
  const { isConnected, address: signerAddress } = useAccount();
  const [showJson, setShowJson] = React.useState(false);
  //react hook
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const [isOwner, setIsOwner] = React.useState(false);
  const [isAlreadyListed, setIsAlreadyListed] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [price, setPrice] = React.useState("0.1");
  if (typeof event == "string") {
    const isValidAddressLength = event.length == 42;
    if (!isValidAddressLength) {
      router.push("/recent-events");
    }
  }
  const qrValue = `${event}-${token}-${signerAddress}`;
  const nftAddress = event;
  const tokenId = token;

  function handleShowJson() {
    setShowJson(!showJson);
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handlePriceChange = (event) => {
    setPrice(event.target.value);
  };

  const handleSell = () => {
    // Do something with the sell price
    approveTx?.();
    handleClose();
  };

  // 0. read ownerOf
  const { data: tokenOwnerAddress, error: readTxError } = useContractRead({
    address: nftAddress,
    abi: eventContractAbi,
    functionName: "ownerOf",
    args: [parseInt(tokenId)],
    chainId: 5,
    watch: true,
    onError(error) {
      console.log("Error", error);
    },
  });

  //0. read getListing(nftAddress,tokenId) => return Listing(price,seller)
  const { data: listing, error: readListingTxError } = useContractRead({
    address: nftMarketplaceAddress,
    abi: nftMarketplaceAbi,
    functionName: "getListing",
    args: [nftAddress, parseInt(tokenId)],
    chainId: 5,
    watch: true,
    onError(error) {
      console.log("Error", error);
    },
  });

  // 1. call approve function to wrtie
  const { config: approveTxConfig, error: approveTxerror } =
    usePrepareContractWrite({
      mode: "prepared",
      address: nftAddress,
      abi: eventContractAbi,
      functionName: "approve",
      args: [nftMarketplaceAddress, parseInt(tokenId)],
      chainId: 5,
      overrides: {
        gasLimit: BigNumber.from(2100000),
      },
      onError(error) {
        console.log("Error", error);
      },
    });

  const {
    data: approveTxResult,
    write: approveTx,
    isLoading: isApproveTxLoading,
    isSuccess: isApproveTxStarted,
    error: approveTxError,
  } = useContractWrite(approveTxConfig);

  const {
    data: approveTxReceipt,
    isSuccess: approveTxSuccess,
    error: appproveTxReceiptError,
  } = useWaitForTransaction({
    hash: approveTxResult?.hash,
  });

  // // 2. call list function to wrtie
  const { config: listTxConfig } = usePrepareContractWrite({
    mode: "prepared",
    address: nftMarketplaceAddress,
    abi: nftMarketplaceAbi,
    functionName: "listItem",
    args: [nftAddress, parseInt(tokenId), ethers.utils.parseEther(price)],
    chainId: 5,
    onError(error) {
      console.log("Error", error);
    },
  });

  const {
    data: listTxResult,
    write: listTx,
    isLoading: isListTxLoading,
    isSuccess: isListTxStarted,
    error: listTxError,
  } = useContractWrite(listTxConfig);

  console.log(`listTxResult`);
  console.log(listTxResult);

  const {
    data: listTxReceipt,
    isSuccess: listTxSuccess,
    error: listTxReceiptError,
  } = useWaitForTransaction({
    hash: listTxResult?.hash,
  });

  const isApproved = approveTxSuccess;
  const isListed = listTxSuccess;

  let disabled =
    !isOwner ||
    isAlreadyListed ||
    !approveTx ||
    isApproveTxLoading ||
    isApproveTxStarted ||
    // !listTx ||
    isListTxLoading ||
    isListTxStarted;

  console.log("checkDisable - owner & listing");
  console.log(!isOwner);
  console.log(isAlreadyListed);
  console.log("checkDisable -approve");
  console.log(!approveTx);
  console.log(isApproveTxLoading);
  console.log(isApproveTxStarted);
  console.log("checkDisable -list");
  console.log(!listTx);
  console.log(isListTxLoading);
  console.log(isListTxStarted);

  React.useEffect(() => {
    if (tokenOwnerAddress && signerAddress) {
      const signerIsOwner = tokenOwnerAddress === signerAddress;
      setIsOwner(signerIsOwner);
    }
  }, [tokenOwnerAddress, signerAddress]);

  React.useEffect(() => {
    if (listing) {
      const isSellerExist =
        listing?.seller !== "0x0000000000000000000000000000000000000000";
      setIsAlreadyListed(isSellerExist);
    }
  }, [listing]);

  React.useEffect(() => {
    if (approveTxReceipt) {
      listTx?.();
    }
  }, [approveTxReceipt]);

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
          <Typography variant="body2" color="text.secondary">
            Please connect to your wallet...
          </Typography>
        ) : (
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid item xs={12} md={8} lg={9}>
              <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                <Typography variant="body2" color="text.secondary">
                  Viewing listing detail of token {token} in {event}
                </Typography>

                {!isOwner && (
                  <Typography variant="body2" color="text.secondary">
                    You are not the owner.
                  </Typography>
                )}

                {isAlreadyListed && (
                  <Typography variant="body2" color="text.secondary">
                    The item is listed already.
                  </Typography>
                )}

                <Container
                  className="Ticket Detail"
                  maxWidth="lg"
                  sx={{ mt: 4, mb: 4 }}
                >
                  <Grid item xs={12}>
                    <Grid item xs={8}>
                      <TicketCard nftAddress={event} tokenId={token} />
                    </Grid>
                    <Grid item xs={4}>
                      <Paper
                        sx={{ p: 2, display: "flex", flexDirection: "column" }}
                      >
                        <Typography variant="h6" gutterBottom>
                          Scan QR Code to entry
                        </Typography>
                        <QRCode value={qrValue} />
                        <Typography variant="body2" color="text.secondary">
                          &nbsp;&nbsp;
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          it's the combination of the event contract hash, token
                          id and signerAddress
                        </Typography>
                        <Box
                          sx={{ display: "flex", justifyContent: "flex-end" }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {isApproveTxLoading && "Waiting for approval..."}
                            {isApproveTxStarted &&
                              !isApproved &&
                              "Approving marketplace to trade on behalf in progress..."}
                          </Typography>
                          {isApproved && (
                            <Typography variant="body2" color="text.secondary">
                              You approved NFT Marketplace to trade for your
                              token in Goerli Network.
                              <Link
                                href={`https://goerli.etherscan.io/tx/${approveTxResult.hash}`}
                              >
                                (view Tx)
                              </Link>
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary">
                            {isListTxLoading && "Waiting for approval..."}
                            {isListTxStarted &&
                              !isListed &&
                              "Listing in progress..."}
                          </Typography>
                          {isListed && (
                            <Typography variant="body2" color="text.secondary">
                              The ticket has been listed in Marketplace in
                              Goerli Network.
                              <Link
                                href={`https://goerli.etherscan.io/tx/${listTxResult.hash}`}
                              >
                                (view Tx)
                              </Link>
                            </Typography>
                          )}
                        </Box>
                        <Box
                          sx={{ display: "flex", justifyContent: "flex-end" }}
                        >
                          <Button
                            style={{ marginTop: 24 }}
                            variant="contained"
                            sx={{ mt: 3, ml: 1 }}
                            // disabled={!sendTx || isTxLoading || isTxStarted}
                            className="button"
                            onClick={handleShowJson}
                          >
                            {!showJson ? "Display URI" : "Hidden URI"}
                          </Button>
                          <Button
                            style={{ marginTop: 24 }}
                            variant="contained"
                            sx={{ mt: 3, ml: 1 }}
                            disabled={disabled}
                            className="button"
                            onClick={handleClickOpen}
                          >
                            Sell ticket
                          </Button>

                          <Dialog open={open} onClose={handleClose}>
                            <DialogTitle>Sell NFT</DialogTitle>
                            <DialogContent>
                              <DialogContentText>
                                Please enter the price at which you want to sell
                                this NFT:
                              </DialogContentText>
                              <TextField
                                autoFocus
                                margin="dense"
                                id="price"
                                label="Price in ETH"
                                type="number"
                                value={price}
                                onChange={handlePriceChange}
                                fullWidth
                              />
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={handleClose}>Cancel</Button>
                              <Button
                                onClick={handleSell}
                                variant="contained"
                                color="primary"
                              >
                                Sell
                              </Button>
                            </DialogActions>
                          </Dialog>
                        </Box>
                        {showJson ? (
                          <UriViewer nftAddress={event} tokenId={token} />
                        ) : (
                          <></>
                        )}
                      </Paper>
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
};

export default ListingDetail;
