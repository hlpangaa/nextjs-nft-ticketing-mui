import { useState, useEffect } from "react";
import Image from "next/image";

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

// rainbowkit package
import { ConnectButton } from "@rainbow-me/rainbowkit";

// import from project files
import FlipCard, { BackCard, FrontCard } from "@/components/Cards/FlipCard";

// project consts
import networkMapping from "@/constants/networkMapping.json";
import nftMarketplaceAbi from "../../constants/NftMarketplace.json";
import eventFactoryAbi from "../../constants/EventFactory.json";
import eventContractAbi from "../../constants/EventContract.json";
const nftMarketplaceAddress = networkMapping["5"]["NftMarketplace"].toString();
const eventFactoryAddress = networkMapping["5"]["EventFactory"].toString();

const imageUri =
  "https://gateway.pinata.cloud/ipfs/QmQ3q5h3zkhkG6sXBs2PuKJ5E9tsbpPGcYkcJU5PYcUVCG";

export function VendingMachine(props) {
  const { nftAddress, ...rest } = props;

  //react hook
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [totalMinted, setTotalMinted] = useState(0);

  // wagmi hook
  const { isConnected, address: signerAddress } = useAccount();
  const { chain } = useNetwork();

  // 0. read mint price first
  const { data: mintFee } = useContractRead({
    address: nftAddress,
    abi: eventContractAbi,
    functionName: "mintFee",
    watch: true,
    onError(error) {
      console.log("Error", error);
    },
  });

  // 1. call mint function to wrtie
  const { config } = usePrepareContractWrite({
    mode: "prepared",
    address: nftMarketplaceAddress,
    abi: nftMarketplaceAbi,
    functionName: "mintFromMarketplace",
    args: [signerAddress, nftAddress],
    chainId: 5,
    overrides: {
      value: mintFee,
      gasLimit: BigNumber.from(2100000),
    },
    onError(error) {
      console.log("Error", error);
    },
  });

  const {
    data: mintData,
    write: mint,
    isLoading: isMintLoading,
    isSuccess: isMintStarted,
    error: mintError,
  } = useContractWrite(config);

  const {
    data: txData,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  // 2. call read function

  const { data: totalSupplyData } = useContractRead({
    address: nftAddress,
    abi: eventContractAbi,
    functionName: "supplyCap",
    watch: true,
    onError(error) {
      console.log("Error", error);
    },
  });

  const isMinted = txSuccess;

  let disabled = !mint || isMintLoading || isMintStarted;

  useEffect(() => {
    if (totalSupplyData) {
      setTotalMinted(totalSupplyData.toNumber());
    }
  }, [totalSupplyData]);

  return (
    <div className="page">
      <div className="container">
        <div style={{ flex: "0 0 auto" }}>
          <FlipCard>
            <FrontCard isCardFlipped={isMinted}>
              <Image
                fill
                src={imageUri}
                alt="RainbowKit Demo NFT"
                sizes="(max-width: 768px) 100vw,
                (max-width: 1200px) 50vw,
                33vw"
                priority="false"
              />
              <h1 style={{ marginTop: 24 }}>Rainbow NFT</h1>
            </FrontCard>
            <BackCard isCardFlipped={isMinted}>
              <div style={{ padding: 24 }}>
                <Image
                  src={imageUri}
                  width="80"
                  height="80"
                  alt="RainbowKit Demo NFT"
                  style={{ borderRadius: 8 }}
                />
                <h2 style={{ marginTop: 24, marginBottom: 6 }}>NFT Minted!</h2>
                <p style={{ marginBottom: 24 }}>
                  Your NFT will show up in your wallet in the next few minutes.
                </p>
                <p style={{ marginBottom: 6 }}>
                  View on{" "}
                  <a href={`https://goerli.etherscan.io/tx/${mintData?.hash}`}>
                    Etherscan
                  </a>
                </p>
                <p>
                  View on{" "}
                  <a
                    href={`https://testnets.opensea.io/assets/goerli/${txData?.to}/1`}
                  >
                    Opensea
                  </a>
                </p>
              </div>
            </BackCard>
          </FlipCard>
        </div>
      </div>
    </div>
  );
}
