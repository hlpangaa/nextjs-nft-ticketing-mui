import * as React from "react";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Title from "./Typography/Title";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

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

const today = new Date();

export default function Deposits(props) {
  const { proceeds, signerAddress, ...rest } = props;
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleWithdraw = () => {
    withdrawTx?.();
    handleClose();
  };

  // 1. call withdraw function to wrtie
  const { config: withdrawTxConfig } = usePrepareContractWrite({
    mode: "prepared",
    address: nftMarketplaceAddress,
    abi: nftMarketplaceAbi,
    functionName: "withdrawProceeds",
    chainId: 5,
    overrides: {
      gasLimit: BigNumber.from(2100000),
    },
    onError(error) {
      console.log("Error", error);
    },
  });

  const {
    data: withdrawTxResult,
    write: withdrawTx,
    isLoading: isWithdrawTxLoading,
    isSuccess: isWithdrawTxStarted,
    error: withdrawTxError,
  } = useContractWrite(withdrawTxConfig);

  const {
    data: withdrawTxReceipt,
    isSuccess: withdrawTxSuccess,
    error: withdrawTxReceiptError,
  } = useWaitForTransaction({
    hash: withdrawTxResult?.hash,
  });

  const isWithdrawed = withdrawTxSuccess;

  let disabled =
    !withdrawTx ||
    isWithdrawTxLoading ||
    isWithdrawTxStarted ||
    proceeds === "0.0";

  // console.log(proceeds);
  return (
    <React.Fragment>
      <Title>Recent Proceeds</Title>
      <Typography component="p" variant="h4">
        {(proceeds / 1).toFixed(5)} ETH
      </Typography>
      <Typography color="text.secondary" sx={{ flex: 1 }}>
        on{" "}
        {today.toLocaleString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </Typography>
      <div>
        <IconButton
          aria-label="Withdraw Fund"
          disabled={disabled}
          onClick={() => {
            handleClickOpen();
          }}
        >
          <ExitToAppIcon />
        </IconButton>

        {/* Transcation Message Box */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          {/* Transcation 1 - withdraw*/}
          <Typography variant="body2" color="text.secondary">
            {isWithdrawTxLoading && "Waiting for approval..."}
            {isWithdrawTxStarted &&
              !isWithdrawed &&
              "Withdraw Fund in progress..."}
          </Typography>
          {isWithdrawed && (
            <Typography variant="body2" color="text.secondary">
              Withdrawal Completed.
              <Link
                href={`https://goerli.etherscan.io/tx/${withdrawTxResult.hash}`}
              >
                (view Tx)
              </Link>
            </Typography>
          )}
        </Box>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Withdraw Proceeds</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You are going to send fund to your address: {signerAddress}.
              Please confirm
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              onClick={() => {
                handleWithdraw();
              }}
              variant="contained"
              color="primary"
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </React.Fragment>
  );
}
