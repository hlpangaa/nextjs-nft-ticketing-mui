import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import Grid from "@mui/material/Grid";

import { useContractRead } from "wagmi";
import nftMarketplaceAbi from "../../constants/NftMarketplace.json";
import nftFactoryAbi from "../../constants/EventFactory.json";
import nftAbi from "../../constants/EventContract.json";
import {
  handleAddress,
  handleTimeStamp,
  handleCurrencyFormat,
} from "@/src/utils/stringUtility";

export default function ActionAreaCard(props) {
  const { row, signerAddress, ...other } = props;

  //react hook
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const [field, setField] = React.useState("");
  const [field1, setField1] = React.useState("");

  // URL
  const [imageURI, setImageURI] = React.useState("");
  const [tokenName, setTokenName] = React.useState("");
  const [tokenDescription, setTokenDescription] = React.useState("");

  console.log(row.nftAddress);
  const { data: URI } = useContractRead({
    address: row.nftAddress,
    abi: nftAbi,
    functionName: "contractURI",
    watch: true,
    onError(error) {
      console.log("Error", error);
    },
  });

  const { data: mintFee } = useContractRead({
    address: row.nftAddress,
    abi: nftAbi,
    functionName: "mintFee",
    watch: true,
    onError(error) {
      console.log("Error", error);
    },
  });

  async function getMetaDataFromURI(URI) {
    // const tokenURI = await getTokenURI();
    console.log(`The TokenURI is ${URI}`);

    if (URI) {
      const requestURL = URI.replace("ipfs://", "https://ipfs.io/ipfs/");
      const tokenURIResponse = await (await fetch(requestURL)).json();
      const imageURI = tokenURIResponse.image;
      const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/");
      setImageURI(imageURIURL);
      setTokenName(tokenURIResponse.name);
      setTokenDescription(tokenURIResponse.description);
    }
  }
  console.log(URI);
  console.log(imageURI);
  console.log(tokenName);
  console.log(tokenDescription);

  React.useEffect(() => {
    if (URI) {
      setField(URI.toString());
      getMetaDataFromURI(URI);
    }
  }, [URI]);

  React.useEffect(() => {
    if (mintFee) {
      setField1(handleCurrencyFormat(mintFee, "ETH"));
    }
  }, [mintFee]);
  return (
    <Grid item xs={12} md={6}>
      <Card sx={{ maxWidth: 345 }}>
        <CardActionArea>
          <CardMedia
            component="img"
            height="300"
            image={imageURI}
            alt="green iguana"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {tokenName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tokenDescription}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {`Price ${field1} ETH`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Date - from URI
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );
}
