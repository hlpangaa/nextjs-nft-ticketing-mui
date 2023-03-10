import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import { useContractRead } from "wagmi";
import eventContractAbi from "../../constants/EventContract.json";

export default function ActionAreaCard(props) {
  const { nftAddress, signerAddress, onClick, ...other } = props;
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
    // console.log("item:");
    // console.log(item);
    // console.log("getMetaDataFromURI is started");
    // console.log(`readTxResult: ${readTxResult}`);
    // console.log(`contractUri: ${contractUri}`);
    // console.log(`metaData:`);
    // console.log(metaData);

    try {
      const requestURL = contractUri.replace(
        "ipfs://",
        "https://gateway.pinata.cloud/ipfs/"
      );

      const res = await fetch(requestURL);
      const json = await res.json();

      console.log("JSON Response");
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
    console.log(metaData);
    if (contractUri !== null) {
      getMetaDataFromURI();
    }
  }, [contractUri]);

  const disable =
    !isSupportedToken || // either not a supported token symbol
    contractUri == "" || // cannot fetch contract uri
    contractUri == null;
  // metaData.eventName == ""; // cannot fetch contract metadata

  // React.useEffect(() => {
  //   if (mintFee) {
  //     setField1(handleCurrencyFormat(mintFee, "ETH"));
  //   }
  // }, [mintFee]);
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardMedia component="img" height="300" image={metaData.fileUrl} />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {metaData.organizerName} - {metaData.eventName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {metaData.date} - {metaData.time}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {metaData.location}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            &nbsp;&nbsp;
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Description: {metaData.eventDescription}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {`Price ${metaData.price} ETH`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supply: {metaData.supplyLimit}
          </Typography>
          {contractUri ? (
            <Typography variant="body2" color="text.secondary">
              contract
              <Link href={`https://goerli.etherscan.io/address/${nftAddress}`}>
                (view)
              </Link>
              URI<Link href={contractUri}> (view)</Link>
            </Typography>
          ) : (
            ""
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
