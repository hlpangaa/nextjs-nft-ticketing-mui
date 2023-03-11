import * as React from "react";

import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

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

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function TicketCard(props) {
  const { nftAddress, tokenId, listPrice, seller, signerAddress, ...other } =
    props;
  const [contractUri, setContractUri] = React.useState("");
  const [metaData, setMetaData] = React.useState({
    organizerName: "",
    eventName: "",
    eventDescription: "",
    location: "",
    date: "",
    time: "",
    supplyLimit: "",
    price: "",
    royalityInBasepoint: "",
    priceCelling: "",
    fileUrl: "",
  });
  const [isSupportedToken, setIsSupportedToken] = React.useState(true);

  const [expanded, setExpanded] = React.useState(false);
  const [isOwner, setIsOwner] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [price, setPrice] = React.useState("0.1");
  const [transcationType, setTranscationType] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const maxLength = 6;
  const trimedSellerAddress =
    seller.length > maxLength ? seller.substring(0, maxLength) + "..." : seller;

  const listPriceinETH = ethers.utils.formatEther(listPrice);
  const royalityPaymentInETH = (
    (listPriceinETH * metaData.royalityInBasepoint) /
    10000
  ).toFixed(4);
  const priceCellingInETH =
    (Number(metaData.priceCelling) * metaData.price) / 100;

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleClickOpen = (transcationType) => {
    setTranscationType(transcationType);
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
    }
    setPrice(value);
  };

  const handleBuy = () => {
    buyTx?.();
    handleClose();
  };

  const handleUpdate = () => {
    if (price <= 0 || price > priceCellingInETH) {
      setOpen(true);
    } else {
      updateTx?.();
      handleClose();
    }
  };

  const handleDelist = () => {
    delistTx?.();
    handleClose();
  };

  // //react hook
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  // const [field, setField] = React.useState("");
  // const [field1, setField1] = React.useState("");

  // 0. get URI from contract address
  const { data: readTxResult } = useContractRead({
    address: nftAddress,
    abi: eventContractAbi,
    functionName: "contractURI",
    watch: true,
    onError(error) {
      console.log("Error", error);
    },
  });

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

  // 1. call update function to wrtie
  const { config: updateTxConfig, error: prepareTxError } =
    usePrepareContractWrite({
      mode: "prepared",
      address: nftMarketplaceAddress,
      abi: nftMarketplaceAbi,
      functionName: "updateListing",
      args: [nftAddress, parseInt(tokenId), ethers.utils.parseEther(price)],
      chainId: 5,
      overrides: {
        gasLimit: BigNumber.from(2100000),
      },
      onError(error) {
        console.log("Error", error);
      },
    });

  const {
    data: updateTxResult,
    write: updateTx,
    isLoading: isUpdateTxLoading,
    isSuccess: isUpdateTxStarted,
    error: updateTxError,
  } = useContractWrite(updateTxConfig);

  const {
    data: updateTxReceipt,
    isSuccess: updateTxSuccess,
    error: updateTxReceiptError,
  } = useWaitForTransaction({
    hash: updateTxResult?.hash,
  });

  // 2. call deList function to wrtie
  const { config: delistTxConfig } = usePrepareContractWrite({
    mode: "prepared",
    address: nftMarketplaceAddress,
    abi: nftMarketplaceAbi,
    functionName: "cancelListing",
    args: [nftAddress, parseInt(tokenId)],
    chainId: 5,
    overrides: {
      gasLimit: BigNumber.from(2100000),
    },
    onError(error) {
      console.log("Error", error);
    },
  });

  const {
    data: delistTxResult,
    write: delistTx,
    isLoading: isDelistTxLoading,
    isSuccess: isDelistTxStarted,
    error: delistTxError,
  } = useContractWrite(delistTxConfig);

  const {
    data: delistTxReceipt,
    isSuccess: delistTxSuccess,
    error: delistTxReceiptError,
  } = useWaitForTransaction({
    hash: delistTxResult?.hash,
  });

  // 3. call buy function to wrtie
  const { config: buyTxConfig } = usePrepareContractWrite({
    mode: "prepared",
    address: nftMarketplaceAddress,
    abi: nftMarketplaceAbi,
    functionName: "buyItem",
    args: [nftAddress, parseInt(tokenId)],
    chainId: 5,
    overrides: {
      value: listPrice,
      gasLimit: BigNumber.from(2100000),
    },
    onError(error) {
      console.log("Error", error);
    },
  });

  const {
    data: buyTxResult,
    write: buyTx,
    isLoading: isBuyTxLoading,
    isSuccess: isBuyTxStarted,
    error: buyTxError,
  } = useContractWrite(buyTxConfig);

  const {
    data: buyTxReceipt,
    isSuccess: buyTxSuccess,
    error: buyTxReceiptError,
  } = useWaitForTransaction({
    hash: buyTxResult?.hash,
  });

  async function getMetaDataFromURI() {
    try {
      const requestURL = contractUri.replace(
        "ipfs://",
        "https://gateway.pinata.cloud/ipfs/"
      );

      const res = await fetch(requestURL);
      const json = await res.json();

      // console.log("fetched Meta data:");
      // console.log(json);

      const fileUriRaw = json.fileUrl ? json.fileUrl : json.image;
      const fileUriUpdated = fileUriRaw.replace(
        "ipfs://",
        "https://gateway.pinata.cloud/ipfs/"
      );
      setMetaData({
        organizerName: json.organizerName,
        eventName: json.eventName,
        eventDescription: json.eventDescription,
        location: json.location,
        date: json.date,
        time: json.time,
        supplyLimit: json.supplyLimit,
        price: json.price,
        royalityInBasepoint: json.royalityInBasepoint,
        priceCelling: json.priceCelling,
        fileUrl: fileUriUpdated,
      });
    } catch (error) {
      console.log(`error occur: ${error}`);
      setIsSupportedToken(false);
    }
  }

  const isUpdated = updateTxSuccess;
  const isDelisted = delistTxSuccess;
  const isBought = buyTxSuccess;

  let disabled =
    !updateTx ||
    isUpdateTxLoading ||
    isUpdateTxStarted ||
    !delistTx ||
    isDelistTxLoading ||
    isDelistTxStarted ||
    !buyTx ||
    isBuyTxLoading ||
    isBuyTxStarted;

  React.useEffect(() => {
    if (tokenOwnerAddress && signerAddress) {
      const signerIsOwner = tokenOwnerAddress === signerAddress;
      setIsOwner(signerIsOwner);
    }
  }, [tokenOwnerAddress, signerAddress]);

  React.useEffect(() => {
    if (readTxResult !== null) {
      setContractUri(readTxResult);
    }
  }, [readTxResult]);

  React.useEffect(() => {
    if (contractUri !== null) {
      getMetaDataFromURI();
    }
  }, [contractUri]);

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia component="img" height="194" image={metaData.fileUrl} />
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
            #{tokenId}
          </Avatar>
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={`${metaData.organizerName} | ${metaData.eventName} `}
        // title={metaData.organizerName}
        // subheader={metaData.eventName}
        subheader={`${metaData.date} - ${metaData.time}`}
      />
      <CardContent>
        <Typography variant="h6" color="text.secondary">
          {listPriceinETH} ETH
        </Typography>

        {isOwner ? (
          <Typography variant="body2" color="text.secondary">
            Owned by you
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            offered by <Link href={seller}>{trimedSellerAddress}</Link>
          </Typography>
        )}
      </CardContent>
      <CardActions disableSpacing>
        {!isOwner ? (
          <IconButton
            aria-label="Take Offer"
            onClick={() => handleClickOpen("Buy")}
          >
            <ShoppingCartIcon />
          </IconButton>
        ) : (
          <div>
            <IconButton
              aria-label="Edit Offer"
              onClick={() => handleClickOpen("Update")}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              aria-label="Cancel Offer"
              onClick={() => handleClickOpen("Delist")}
            >
              <CancelIcon />
            </IconButton>
          </div>
        )}

        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
        {/* ---------------------------------------Handle Update---------- */}
        {transcationType === "Update" && (
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Update Offer</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Please enter the price at which you want to sell this NFT, price
                cannot be zero. Please noted the artist setup the price Celling:{" "}
                {priceCellingInETH}
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="price"
                label="Price in ETH"
                type="number"
                onChange={handlePriceChange}
                fullWidth
                defaultValue={listPriceinETH}
                inputProps={{ max: priceCellingInETH, min: 0.00001 }}
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
                onClick={() => handleUpdate()}
                variant="contained"
                color="primary"
              >
                Update
              </Button>
            </DialogActions>
          </Dialog>
        )}
        {/* ---------------------------------------Handle Delist---------- */}
        {transcationType === "Delist" && (
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Delist Offer</DialogTitle>
            <DialogContent>
              <DialogContentText>
                You are going to delist your offer in Marketplace. Please
                confirm:
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button
                onClick={() => handleDelist()}
                variant="contained"
                color="primary"
              >
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        )}
        {/* ---------------------------------------Handle Buy---------- */}
        {transcationType === "Buy" && (
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Buy NFT</DialogTitle>
            <DialogContent>
              <DialogContentText>
                You are going to pay {listPriceinETH} ETH for the ticket. A
                share of {royalityPaymentInETH} ETH will be rewarded to the
                Artist.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handleBuy} variant="contained" color="primary">
                Buy
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Minted:{" "}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Price Celling:{priceCellingInETH} ETH
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Royality to Artist included: {royalityPaymentInETH}
            ETH
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ticket Detail:
            <Link href={`/event/${nftAddress}/token/${tokenId}`}>(view)</Link>
          </Typography>
        </CardContent>
      </Collapse>
      <CardContent>
        {/* Transcation Message Box */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          {/* Transcation 1 - update*/}
          <Typography variant="body2" color="text.secondary">
            {isUpdateTxLoading && "Waiting for approval..."}
            {isUpdateTxStarted && !isUpdated && "Update Listing in progress..."}
          </Typography>
          {isUpdated && (
            <Typography variant="body2" color="text.secondary">
              The listing has been updated in Goerli Network. You may refresh
              your browser.
              <Link
                href={`https://goerli.etherscan.io/tx/${updateTxResult.hash}`}
              >
                (view Tx)
              </Link>
            </Typography>
          )}
          {/* Transcation 2 - delist */}
          <Typography variant="body2" color="text.secondary">
            {isDelistTxLoading && "Waiting for approval..."}
            {isDelistTxStarted && !isDelisted && "delisting in progress..."}
          </Typography>
          {isDelisted && (
            <Typography variant="body2" color="text.secondary">
              The ticket has been delisted in Marketplace in Goerli Network. You
              may refresh your browser.
              <Link
                href={`https://goerli.etherscan.io/tx/${delistTxResult.hash}`}
              >
                (view Tx)
              </Link>
            </Typography>
          )}
          {/* Transcation 3 - buy */}
          <Typography variant="body2" color="text.secondary">
            {isBuyTxLoading && "Waiting for approval..."}
            {isBuyTxStarted && !isBought && "Buying ticket in progress..."}
          </Typography>
          {isBought && (
            <Typography variant="body2" color="text.secondary">
              The ticket has been bought in Marketplace in Goerli Network. You
              may refresh your browser.
              <Link href={`https://goerli.etherscan.io/tx/${buyTxResult.hash}`}>
                (view Tx)
              </Link>
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
