import TableCell from "@mui/material/TableCell";
import {
  handleAddress,
  handleTimeStamp,
  handleCurrencyFormat,
} from "@/src/utils/stringUtility";

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

export function DisplayMintFee(props) {
  const { nftAddress, direction, ...rest } = props;

  const { data: mintFee } = useContractRead({
    address: nftAddress,
    abi: eventContractAbi,
    functionName: "mintFee",
    watch: true,
    onError(error) {
      console.log("Error", error);
    },
  });

  // mintFee is string
  return (
    <TableCell
      align="right"
      style={{ color: direction === "-" ? "red" : "green" }}
    >{`${handleCurrencyFormat(mintFee, "ETH")} ETH`}</TableCell>
  );
}
