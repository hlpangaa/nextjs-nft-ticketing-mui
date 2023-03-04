// ipfs packages
import { create as ipfsHttpClient } from "ipfs-http-client";

// material UI packages
import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import Stack from "@mui/material/Stack";
import LoadingButton from "@mui/lab/LoadingButton";
import IconButton from "@mui/material/IconButton";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

// react useState
import { useState } from "react";
import { useRouter } from "next/router";

// import from project files
import nftMarketplaceAbi from "../constants/NftMarketplace.js";
import nftFactoryAbi from "../constants/EventFactory.json";
import nftAbi from "../constants/EventContract.json";

// rainbowkit package
import { ConnectButton } from "@rainbow-me/rainbowkit";

// wagmi packages
import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useContractRead,
  useWaitForTransaction,
} from "wagmi";

// ipfs consts
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

// project consts
const marketplaceAddress = "0x0833F6490610b9bAC23cd8b43f8186871d296812";
const nftAddress = "0x8c9a29fd73ece36ff13fe490D4aEe4273750FE57";
const nftFactoryAddress = "0xcabb9b44a429b56c7DF813F773767223D24910c0";

/**
 * debug
 *  const _name = "Hin"
    const _symbol = "Hin"
    const _contractURI = "ipfs://Qmf2xvUekEhSrEcG4NCrBWXBFjw11b9wzoRdCq9pQzFVbR"
    const _supplyCap = 1
    const _mintFee = ethers.utils.parseEther("0.1") //100000000000000000
    const _priceCellingFraction = 110
    const _royaltyFeesInBips = 250

    debug
    ipfsURI: https://gateway.pinata.cloud/ipfs/QmXXSY4yRCYvJigbXvcH84utoojsttofgVWfDDKTtJt6wh
 */

export default function MultilineTextFields() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    name: "",
    symbol: "",
    supplyCap: "",
    mintFee: "",
    priceCellingFraction: "",
    royaltyFeesInBips: "",
  });
  const router = useRouter();

  // Wagmi hook
  const { isConnected, address: signerAddress } = useAccount();
  const { config } = usePrepareContractWrite({
    address: marketplaceAddress,
    contractInterface: nftMarketplaceAbi,
    functionName: "mintFromMarketplace",
    args: {
      _to: signerAddress,
      nftAddress: nftAddress,
    },
  });

  const { write: mintFromMarketplace, data } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  //debug: commented below
  // async function uploadToIPFS() {
  //   const { name, description, price } = formInput;
  //   if (!name || !description || !price || !fileUrl) return;
  //   /* first, upload to IPFS */
  //   const data = JSON.stringify({
  //     name,
  //     description,
  //     image: fileUrl,
  //   });
  //   try {
  //     const added = await client.add(data);
  //     const url = `https://ipfs.infura.io/ipfs/${added.path}`;
  //     return url;
  //   } catch (error) {
  //     console.log("Error uploading file: ", error);
  //   }
  // }

  // async function listNFTForSale() {
  //   const url = await uploadToIPFS();
  //   // need update
  //   // connect wallet
  //   const web3Modal = new Web3Modal();
  //   const connection = await web3Modal.connect();
  //   // use provider
  //   const provider = new ethers.providers.Web3Provider(connection);
  //   const signer = provider.getSigner();

  //   // from ETH to wei
  //   const price = ethers.utils.parseUnits(formInput.price, "ether");

  //   // contract action
  //   let contract = new ethers.Contract(
  //     marketplaceAddress,
  //     nftMarketplace.abi,
  //     signer
  //   );
  //   let listingPrice = await contract.getListingPrice();
  //   listingPrice = listingPrice.toString();
  //   let transaction = await contract.createToken(url, price, {
  //     value: listingPrice,
  //   });
  //   await transaction.wait();

  //   // return to root
  //   router.push("/");
  // }

  //debug: commented above

  return (
    <Box
      component="form"
      sx={{
        "& .MuiTextField-root": { m: 1, width: "25ch" },
      }}
      noValidate
      autoComplete="off"
    >
      <div>Create NFT</div>
      <ConnectButton />
      <div>
        <TextField
          id="standard-textarea"
          label="name"
          placeholder="Placeholder"
          multiline
          variant="standard"
        />
        <TextField
          id="standard-textarea"
          label="symbol"
          placeholder="Placeholder"
          multiline
          variant="standard"
        />
      </div>
      <div>
        <TextField
          id="standard-textarea"
          label="contractURI"
          placeholder="Placeholder"
          multiline
          variant="standard"
        />
        <TextField
          id="standard-textarea"
          label="supplyCap"
          placeholder="Placeholder"
          multiline
          variant="standard"
        />
      </div>
      <div>
        <TextField
          id="standard-textarea"
          label="mintFee"
          placeholder="Placeholder"
          multiline
          variant="standard"
        />
        <TextField
          id="standard-textarea"
          label="priceCellingFraction"
          placeholder="Placeholder"
          multiline
          variant="standard"
        />
      </div>
      <div>
        <TextField
          disabled
          id="outlined-disabled"
          label="Disabled"
          defaultValue="imageURL"
        />
        {fileUrl && <img width="350" src={fileUrl} />}
        <IconButton
          color="primary"
          aria-label="upload picture"
          component="label"
          onChange={onChange}
        >
          <input hidden accept="image/*" type="file" />
          <PhotoCamera />
        </IconButton>
        <IconButton aria-label="delete" size="large">
          <DeleteIcon fontSize="inherit" />
        </IconButton>
      </div>
      <Stack direction="row" spacing={2}>
        {isConnected && (
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={() => createNFTContract?.()}
          >
            Send
          </Button>
        )}
      </Stack>
    </Box>
  );
}
