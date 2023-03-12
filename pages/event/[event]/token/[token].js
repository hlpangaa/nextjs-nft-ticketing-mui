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
import CircularProgress from "@mui/material/CircularProgress";

import ClientOnly from "@/src/utils/clientOnly";
import { UriViewer } from "@/components/Tables/UriViewer";

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

const TicketDetailPage = () => {
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
  const [price, setPrice] = React.useState("0");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [mintFeeInETH, setMintFeeInETH] = React.useState(0);
  const [priceCellingInETH, setPriceCellingInETH] = React.useState(0);

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
    const value = event.target.value;
    if (value <= 0) {
      setErrorMessage("Price cannot be zero or negative");
    } else if (value > priceCellingInETH) {
      setErrorMessage("Price cannot be greater than price celling");
    } else {
      setErrorMessage("");
      setPrice(value);
    }
  };

  const handleApprove = () => {
    approveTx?.();
    handleClose();
  };

  const handleList = () => {
    if (price > 0 && price <= priceCellingInETH) {
      listTx?.();
      handleClose();
    } else {
      setOpen(true);
    }
  };
  console.log(`price`);
  console.log(price);
  console.log(`priceCellingInETH`);
  console.log(priceCellingInETH);

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

  //0. read getApproved(tokenId) => return Address
  const { data: approvedAddress } = useContractRead({
    address: nftAddress,
    abi: eventContractAbi,
    functionName: "getApproved",
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

  // 0. read price Celling
  const { data: priceCelling } = useContractRead({
    address: nftAddress,
    abi: eventContractAbi,
    functionName: "getPriceCelling",
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

  const {
    data: listTxReceipt,
    isSuccess: listTxSuccess,
    error: listTxReceiptError,
  } = useWaitForTransaction({
    hash: listTxResult?.hash,
  });

  const isApproved =
    approveTxSuccess || approvedAddress === nftMarketplaceAddress;
  const isListed = listTxSuccess;

  //transaction in progress
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

  // React.useEffect(() => {
  //   if (approveTxReceipt) {
  //  setIsApproved(true)
  //   }
  // }, [approveTxReceipt]);

  React.useEffect(() => {
    if (mintFee !== null && priceCelling !== null && priceCelling !== 0) {
      try {
        const mintFeeInETH = ethers.utils.formatEther(mintFee);
        const priceCellingInETH = ethers.utils.formatEther(priceCelling);
        setMintFeeInETH(mintFeeInETH);
        setPriceCellingInETH(priceCellingInETH);
      } catch (error) {
        console.log(error);
      }
    }
  }, [mintFee, priceCelling]);

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
                <Typography variant="h6" color="inherit">
                  Ticket Detail
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Viewing event detail of token {token} in {event}
                </Typography>

                {isOwner ? (
                  <Typography variant="body2" color="text.secondary">
                    You are the owner.
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    You are not the owner.
                  </Typography>
                )}

                {isAlreadyListed ? (
                  <Typography variant="body2" color="text.secondary">
                    The item is listed already.
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    The item can be listed in Marketplace.
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
                          {approvedAddress === nftMarketplaceAddress ? (
                            <Typography variant="body2" color="text.secondary">
                              You approved us to trade already.
                            </Typography>
                          ) : (
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {isApproveTxLoading &&
                                  "Waiting for approval..."}
                                {isApproveTxStarted &&
                                  !isApproved &&
                                  "Approving marketplace to trade on behalf in progress..."}
                              </Typography>
                              {(isApproveTxLoading ||
                                (isApproveTxStarted && !isApproved)) && (
                                <CircularProgress />
                              )}
                              {isApproved && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  You approved NFT Marketplace to trade for your
                                  token in Goerli Network.
                                  <Link
                                    href={`https://goerli.etherscan.io/tx/${approveTxResult.hash}`}
                                  >
                                    (view Tx)
                                  </Link>
                                </Typography>
                              )}
                            </Box>
                          )}
                          <Typography variant="body2" color="text.secondary">
                            {isListTxLoading && "Waiting for approval..."}
                            {isListTxStarted &&
                              !isListed &&
                              "Listing in progress..."}
                          </Typography>
                          {(isListTxLoading ||
                            (isListTxStarted && !isListed)) && (
                            <CircularProgress />
                          )}
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
                            disabled={
                              !isOwner ||
                              isAlreadyListed ||
                              !approveTx ||
                              isApproveTxLoading ||
                              isApproveTxStarted ||
                              approvedAddress === nftMarketplaceAddress
                            }
                            className="button"
                            onClick={() => {
                              handleApprove();
                            }}
                          >
                            Authorize Marketplace
                          </Button>
                          <Button
                            style={{ marginTop: 24 }}
                            variant="contained"
                            sx={{ mt: 3, ml: 1 }}
                            disabled={
                              !isOwner ||
                              isAlreadyListed ||
                              isListTxLoading ||
                              isListTxStarted ||
                              !isApproved
                            }
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
                                this NFT, price cannot be zero. Original Sale
                                Price is {mintFeeInETH}. Please noted the artist
                                setup the price Celling: {priceCellingInETH}
                              </DialogContentText>
                              <TextField
                                autoFocus
                                margin="dense"
                                id="price"
                                label="Price in ETH"
                                type="number"
                                inputProps={{
                                  max: priceCellingInETH,
                                  min: 0.00001,
                                }}
                                onChange={handlePriceChange}
                                fullWidth
                              />
                              {errorMessage && (
                                <DialogContentText sx={{ color: "red" }}>
                                  {errorMessage}
                                </DialogContentText>
                              )}
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={handleClose}>Cancel</Button>
                              <Button
                                onClick={() => {
                                  handleList();
                                }}
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

export default TicketDetailPage;
