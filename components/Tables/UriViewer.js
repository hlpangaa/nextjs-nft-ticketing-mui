import React from "react";
import { useContractRead } from "wagmi";
import eventContractAbi from "../../constants/EventContract.json";
import Typography from "@mui/material/Typography";

export const UriViewer = (props) => {
  const { tokenId, nftAddress, ...rest } = props;
  const [tokenUri, setContractUri] = React.useState("");
  const [json, setJson] = React.useState({});
  // //react hook
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

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
    functionName: "tokenURI",
    args: [tokenId],
    watch: true,
    onError(error) {
      console.log("Error", error);
    },
  });

  React.useEffect(() => {
    if (readTxResult !== null) {
      setContractUri(readTxResult);
    }
  }, [readTxResult]);

  React.useEffect(() => {
    async function getJsonFromUri() {
      try {
        const requestURL = tokenUri.replace(
          "ipfs://",
          "https://gateway.pinata.cloud/ipfs/"
        );

        const res = await fetch(requestURL);
        const json = await res.json();
        setJson(json);
      } catch (error) {
        console.log(`error occur: ${error}`);
      }
    }
    if (tokenUri !== null) {
      getJsonFromUri();
    }
  }, [tokenUri]);

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        URI JSON
      </Typography>
      {!json ? (
        <div>no result</div>
      ) : (
        <pre>{JSON.stringify(json, null, 2)}</pre>
      )}
    </div>
  );
};
