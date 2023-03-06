import { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsClient } from "ipfs-http-client";
import { useRouter } from "next/router";
// import Web3Modal from "web3modal";

// yarn remove web3modal

// rainbowkit to replace web3modal
import { ConnectButton } from "@rainbow-me/rainbowkit";

// import from project files
import NFTMarketplace from "@/constants/NftMarketplace.json";
import nftFactoryAbi from "@/constants/EventFactory.json";
import nftAbi from "@/constants/EventContract.json";

// project consts
const marketplaceAddress = "0x0833F6490610b9bAC23cd8b43f8186871d296812";

export default function CreateItem() {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const router = useRouter();

  async function onChange(e) {
    setFile(e.target.files[0]);
  }

  async function uploadImageToIPFS() {
    // @notice: should show error message like: you will upload a image to IPFS which is imputable.
    // size limit is 5GB - please use small size image
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
      const added = await client.add(file, {
        progress: (prog) => console.log(`Progresing: ${prog} bytes`),
      });
      const url = `https://gateway.pinata.cloud/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function createUriInIpfs() {
    await uploadImageToIPFS();

    const { name, description, price } = formInput;

    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });

    try {
      const added = await client.add(data);
      const url = `https://gateway.pinata.cloud/ipfs/${added.path}`;

      return url;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function listNFTForSale() {
    //const url = await createUriInIpfs();

    //debug:
    url =
      "https://gateway.pinata.cloud/ipfs/QmXXSY4yRCYvJigbXvcH84utoojsttofgVWfDDKTtJt6wh";

    //   const web3Modal = new Web3Modal();
    //   const connection = await web3Modal.connect();
    //   const provider = new ethers.providers.Web3Provider(connection);
    //   const signer = provider.getSigner();

    //   /* next, create the item */
    //   const price = ethers.utils.parseUnits(formInput.price, "ether");
    //   let contract = new ethers.Contract(
    //     marketplaceAddress,
    //     NFTMarketplace.abi,
    //     signer
    //   );
    //   let listingPrice = await contract.getListingPrice();
    //   listingPrice = listingPrice.toString();
    //   let transaction = await contract.createToken(url, price, {
    //     value: listingPrice,
    //   });
    //   await transaction.wait();

    //   router.push("/");
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <ConnectButton />
        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
        />
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
        />
        <input type="file" name="Asset" className="my-4" onChange={onChange} />
        {fileUrl && <img className="rounded mt-4" width="350" src={fileUrl} />}
        <button
          onClick={listNFTForSale}
          className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
        >
          Create NFT
        </button>
      </div>
    </div>
  );
}
