import * as React from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  mainListItems,
  secondaryListItems,
} from "@/components/Navigations/listItems";
import Dashboard from "@/components/Delete/Dashboard";
import Chart from "@/components/Charts/Chart";
import Deposits from "@/components/Deposits";
import CreateEventForm from "@/components/Forms/CreateEventForm";
import Navigation from "@/components/Navigations/Navigation";
import ActionAreaCardPreview from "@/components/Cards/ActionAreaCardPreview";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";

import { ethers, BigNumber } from "ethers";
import { create as ipfsClient } from "ipfs-http-client";

// import from project files
import NFTMarketplace from "@/constants/NftMarketplace.json";
import eventFactorytAbi from "@/constants/EventFactory.json";
import nftAbi from "@/constants/EventContract.json";

// project consts
const marketplaceAddress = "0x0833F6490610b9bAC23cd8b43f8186871d296812";
import networkMapping from "@/constants/networkMapping.json";

import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useContractRead,
  useNetwork,
  erc20ABI,
} from "wagmi";

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

// ((obj) => ({
//   ...obj,
//   id: obj.id,
//   timestamp: obj.timestamp.toString(),
//   nftAddress: obj.nftAddress,
//   owner: obj.owner,
//   transcationType: "Mint",
//   tokenId: obj.tokenId,
//   txHash: obj.txHash,
//   blockNumber: obj.blockNumber,
//   gasPrice: obj.gasPrice,
// }));

const mdTheme = createTheme();

function HomeContent() {
  const [open, setOpen] = React.useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };
  const [file, setFile] = React.useState(null);
  const [formInput, updateFormInput] = React.useState({
    organizerName: "Sam Hui",
    eventName: "IN ONE PLACE",
    eventDescription: "7-12 Apr 2023 SAMHUI IN ONE PLACE 此時此處 2023",
    location: "Hong Kong Coliseum, Hong Kong",
    date: "07 April 2023",
    time: "20:15",
    supplyLimit: "100",
    price: "0.1",
    royalityInBasepoint: "250",
    priceCelling: "110",
    fileUrl:
      "https://gateway.pinata.cloud/ipfs/QmckwsC1Hw8jT1FEk3YZ7x7DHLYA9B364p8MSajnP2MLkN",
  });
  const [createResult, setCreateResult] = React.useState({
    contractAddress: "",
    contractURI: "",
  });

  let data = formInput;

  async function onChange(e) {
    setFile(e.target.files[0]);
    const src = URL.createObjectURL(e.target.files[0]);
    updateFormInput({
      ...formInput,
      fileUrl: src,
    });
  }

  async function uploadImageToIPFS() {
    const client = await ipfsClient({
      host: "ipfs.infura.io",
      port: 5001,
      protocol: "https",
      apiPath: "/api/v0",
      headers: {
        authorization:
          "Basic " +
          Buffer.from(
            process.env.NEXT_PUBLIC_INFURA_PROJECT_ID +
              ":" +
              process.env.NEXT_PUBLIC_INFURA_API_SECRET
          ).toString("base64"),
      },
    });

    try {
      if (file) {
        const added = await client.add(file, {
          progress: (prog) => console.log(`Progresing: ${prog} bytes`),
        });
        const url = `https://gateway.pinata.cloud/ipfs/${added.path}`;
        console.log("replaced fileUrl");
        updateFormInput({
          ...formInput,
          fileUrl: url,
        });
      } else {
        console.log("reused fileUrl");
      }
      console.log(formInput.fileUrl);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function createUriInIpfs() {
    const client = await ipfsClient({
      host: "ipfs.infura.io",
      port: 5001,
      protocol: "https",
      apiPath: "/api/v0",
      headers: {
        authorization:
          "Basic " +
          Buffer.from(
            process.env.NEXT_PUBLIC_INFURA_PROJECT_ID +
              ":" +
              process.env.NEXT_PUBLIC_INFURA_API_SECRET
          ).toString("base64"),
      },
    });
    await uploadImageToIPFS();

    const {
      organizerName,
      eventName,
      eventDescription,
      location,
      date,
      time,
      supplyLimit,
      price,
      royalityInBasepoint,
      priceCelling,
      fileUrl,
    } = formInput;

    const data = JSON.stringify({
      organizerName,
      eventName,
      eventDescription,
      location,
      date,
      time,
      supplyLimit,
      price,
      royalityInBasepoint,
      priceCelling,
      fileUrl,
    });

    console.log("data:");
    console.log(data);

    try {
      const added = await client.add(data);
      const url = `https://gateway.pinata.cloud/ipfs/${added.path}`;

      setCreateResult({ contractAddress: "", contractURI: url });
      console.log(`setCreateResult -- `);
      console.log(createResult);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  //

  async function checkValidURI() {
    try {
      const res = await fetch(createResult.contractURI);
      const json = await res.json();
      console.log(json);

      // console.log("URI is valid...");
    } catch (error) {
      console.log(error);
      console.log("ccannot fetech JSON or unknown reason?");
    }
  }

  async function createEventContract() {
    await createUriInIpfs();

    if (createResult.contractURI !== "") {
      console.log("prepare send Tx with contractURI");
      console.log(createResult.contractURI);
      sendTx();
    }

    //   router.push("/");
  }

  // 1. use Contract wrtie - createNFTContract
  const eventFactoryAddress = networkMapping["5"]["EventFactory"].toString();

  const { config, error: prepareError } = usePrepareContractWrite({
    mode: "prepared",
    address: eventFactoryAddress,
    abi: eventFactorytAbi,
    functionName: "createNFTContract",
    args: [
      "NGEN",
      "NGEN",
      createResult.contractURI,
      formInput.supplyLimit,
      ethers.utils.parseEther(formInput.price), // price in wei
      formInput.priceCelling,
      formInput.royalityInBasepoint,
    ],
    chainId: 5,
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

  const isContractCreated = txSuccess;

  // console.log(`isContractCreated: ${isContractCreated}`);

  let disabled = !sendTx || isTxLoading || isTxStarted;

  return (
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Navigation />
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
            <Grid container spacing={3}>
              {/* CreateEventForm */}
              <Grid item xs={8}>
                <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" gutterBottom>
                    Create a Event Contract
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        id="organizerName"
                        name="organizerName"
                        label="Organizer Name"
                        defaultValue={formInput.organizerName}
                        fullWidth
                        autoComplete="given-name"
                        variant="standard"
                        onChange={(e) =>
                          updateFormInput({
                            ...formInput,
                            organizerName: e.target.value,
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        id="eventName"
                        name="eventName"
                        label="Event Name"
                        defaultValue={formInput.eventName}
                        fullWidth
                        variant="standard"
                        onChange={(e) =>
                          updateFormInput({
                            ...formInput,
                            eventName: e.target.value,
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        id="eventDescription"
                        name="eventDescription"
                        label="Event Description"
                        defaultValue={formInput.eventDescription}
                        fullWidth
                        variant="standard"
                        onChange={(e) =>
                          updateFormInput({
                            ...formInput,
                            eventDescription: e.target.value,
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        id="location"
                        name="location"
                        label="Location"
                        defaultValue={formInput.location}
                        fullWidth
                        variant="standard"
                        onChange={(e) =>
                          updateFormInput({
                            ...formInput,
                            location: e.target.value,
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        id="date"
                        name="date"
                        label="Date"
                        defaultValue={formInput.date}
                        fullWidth
                        variant="standard"
                        onChange={(e) =>
                          updateFormInput({
                            ...formInput,
                            date: e.target.value,
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        id="time"
                        name="time"
                        label="Time"
                        defaultValue={formInput.time}
                        fullWidth
                        variant="standard"
                        onChange={(e) =>
                          updateFormInput({
                            ...formInput,
                            time: e.target.value,
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        id="supplyLimit"
                        name="supplyLimit"
                        label="Supply Limit"
                        defaultValue={formInput.supplyLimit}
                        fullWidth
                        variant="standard"
                        onChange={(e) =>
                          updateFormInput({
                            ...formInput,
                            supplyLimit: e.target.value,
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        id="price"
                        name="price"
                        label="Price in ETH"
                        defaultValue={formInput.price}
                        fullWidth
                        variant="standard"
                        onChange={(e) =>
                          updateFormInput({
                            ...formInput,
                            price: e.target.value,
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        id="royalityInBasepoint"
                        name="royalityInBasepoint"
                        label="Royality % in base point"
                        defaultValue={formInput.royalityInBasepoint}
                        fullWidth
                        variant="standard"
                        onChange={(e) =>
                          updateFormInput({
                            ...formInput,
                            royalityInBasepoint: e.target.value,
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        id="priceCelling"
                        name="priceCelling"
                        label="Price Celling"
                        defaultValue={formInput.priceCelling}
                        fullWidth
                        variant="standard"
                        onChange={(e) =>
                          updateFormInput({
                            ...formInput,
                            priceCelling: e.target.value,
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        disabled
                        id="outlined-disabled"
                        label="Event Poster"
                        defaultValue="Only Support png"
                      />
                      <IconButton
                        color="primary"
                        aria-label="upload picture"
                        component="label"
                      >
                        <input
                          hidden
                          accept="image/*"
                          type="file"
                          onChange={onChange}
                        />
                        <PhotoCamera />
                      </IconButton>
                      <IconButton aria-label="delete" size="large">
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            color="secondary"
                            name="giveSample"
                            value="yes"
                          />
                        }
                        label="You agree to upload the information to Goerli Network"
                      />
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Typography variant="body2" color="text.secondary">
                          {isTxLoading && "Waiting for approval"}
                          {isTxStarted &&
                            !isContractCreated &&
                            "Creating Contract..."}
                          {isContractCreated && "Contract has been created"}
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={createEventContract}
                          sx={{ mt: 3, ml: 1 }}
                          disabled={!sendTx || isTxLoading || isTxStarted}
                        >
                          Create
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                  <Grid item xs={12} md={12}>
                    <Card sx={{ maxWidth: 345 }}>
                      <CardMedia
                        component="img"
                        height="300"
                        image={formInput.fileUrl}
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                          {formInput.organizerName} - {formInput.eventName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formInput.date} - {formInput.time}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formInput.location}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          &nbsp;&nbsp;
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Description: {formInput.eventDescription}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {`Price ${formInput.price} ETH`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Supply: {formInput.supplyLimit}
                        </Typography>
                        {createResult.contractURI ? (
                          <Typography variant="body2" color="text.secondary">
                            contractURI: {createResult.contractURI}
                          </Typography>
                        ) : (
                          ""
                        )}
                      </CardContent>
                    </Card>
                    {isContractCreated ? (
                      <Typography variant="body2" color="text.secondary">
                        Contract sucessfully deployed in Goerli Network:{" "}
                        <Link
                          href={`https://goerli.etherscan.io/address/${sendTxResult.hash}`}
                        >
                          (view Tx)
                        </Link>
                      </Typography>
                    ) : (
                      <Typography variant="h8" gutterBottom>
                        Contract will be deployed in Goerli Network.
                      </Typography>
                    )}

                    <Typography variant="body2" color="text.secondary">
                      &nbsp;&nbsp;
                    </Typography>
                    <Typography variant="h8" gutterBottom>
                      1. You will receive{" "}
                      {formInput.royalityInBasepoint * 0.0001} ETH in every 1
                      ETH of the resell transcation in the secondary market.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      &nbsp;&nbsp;
                    </Typography>
                    <Typography variant="h8" gutterBottom>
                      2. Secondary market sale with price that over{" "}
                      {(Number(formInput.priceCelling) * formInput.price) / 100}
                      ETH will be prohibited
                    </Typography>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
            <Copyright sx={{ pt: 4 }} />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default function Home() {
  return <HomeContent />;
}
