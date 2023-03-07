import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useContractRead,
  useNetwork,
  erc20ABI,
} from "wagmi";

import { ethers, BigNumber } from "ethers";

// import from project files
import nftMarketplaceAbi from "../../constants/NftMarketplace.json";
import nftFactoryAbi from "../../constants/EventFactory.json";
import nftAbi from "../../constants/EventContract.json";

// project consts
const marketplaceAddress = "0x0a5537a12d4EF5E274bF4b18bb79FD968CCF667C";
const nftAddress = "0x8c9a29fd73ece36ff13fe490D4aEe4273750FE57";
const nftFactoryAddress = "0xcabb9b44a429b56c7DF813F773767223D24910c0";
const freeNftAddress = "0x1f2fbCc0dAB80847E8fcaC00d8Eacc571A4511E2";

const imageUri =
  "https://gateway.pinata.cloud/ipfs/QmQ3q5h3zkhkG6sXBs2PuKJ5E9tsbpPGcYkcJU5PYcUVCG";

export function getMintFee(nftAddress) {
  const { data: mintFee } = useContractRead({
    address: nftAddress,
    abi: nftAbi,
    functionName: "mintFee",
    watch: true,
    onError(error) {
      console.log("Error", error);
    },
  });
  return ethers.utils.formatEther(mintFee);
}
