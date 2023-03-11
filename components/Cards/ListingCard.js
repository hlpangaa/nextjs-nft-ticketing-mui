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

import { useContractRead } from "wagmi";
import eventContractAbi from "../../constants/EventContract.json";
import { ethers } from "ethers";

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

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

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
    handleClose();
  };

  const maxLength = 6;
  const trimedSellerAddress =
    seller.length > maxLength ? seller.substring(0, maxLength) + "..." : seller;

  // //react hook
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  // const [field, setField] = React.useState("");
  // const [field1, setField1] = React.useState("");

  // get URI from contract address
  const { data: symbol } = useContractRead({
    address: nftAddress,
    abi: eventContractAbi,
    functionName: "symbol",
    watch: true,
    onError(error) {
      console.log("Error", error);
    },
  });

  const { data: readTxResult, error: readTxError } = useContractRead({
    address: nftAddress,
    abi: eventContractAbi,
    functionName: "contractURI",
    watch: true,
    onError(error) {
      console.log("Error", error);
    },
  });

  async function getMetaDataFromURI() {
    try {
      const requestURL = contractUri.replace(
        "ipfs://",
        "https://gateway.pinata.cloud/ipfs/"
      );

      const res = await fetch(requestURL);
      const json = await res.json();

      console.log("fetched Meta data:");
      console.log(json);

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

  const disable =
    !isSupportedToken || // either not a supported token symbol
    contractUri == "" || // cannot fetch contract uri
    contractUri == null;

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia
        component="img"
        height="194"
        image={metaData.fileUrl}
        alt="Paella dish"
      />
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
        title={metaData.organizerName}
        subheader={metaData.eventName}
        // subheader={`${metaData.date} ${metaData.time}`}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {`${metaData.date} - ${metaData.time}`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {ethers.utils.formatEther(listPrice)} ETH offered by{" "}
          <Link href={seller}>{trimedSellerAddress}</Link>
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="Take Offer" onClick={handleClickOpen}>
          <ShoppingCartIcon />
        </IconButton>
        <IconButton aria-label="Edit Offer" onClick={handleClickOpen}>
          <EditIcon />
        </IconButton>
        <IconButton aria-label="Cancel Offer" onClick={handleClickOpen}>
          <CancelIcon />
        </IconButton>
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Sell NFT</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter the price at which you want to sell this NFT:
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
            <Button onClick={handleSell} variant="contained" color="primary">
              Sell
            </Button>
          </DialogActions>
        </Dialog>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography paragraph>Supply Cap:</Typography>
          <Typography paragraph>Minted: </Typography>
          <Typography paragraph>Royality Payment Required:</Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}

// Buy
// Cancel
// Update
// View Detail