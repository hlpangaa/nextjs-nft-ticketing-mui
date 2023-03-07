import { gql } from "@apollo/client";

// See more example queries on https://thegraph.com/explorer/subgraph/protofire/maker-protocol
// 0x0000000000000000000000000000000000000000 zero address
// 0x000000000000000000000000000000000000dEaD dead address

export const GET_ACTIVE_ITEMS = gql`
  {
    activeItems(
      first: 20
      where: { buyer: "0x0000000000000000000000000000000000000000" }
    ) {
      id
      buyer
      seller
      nftAddress
      tokenId
      price
    }
  }
`;

export const GET_ACTIVE_EVENTS = gql`
  {
    activeEvents(first: 20) {
      id
      creator
      nft
    }
  }
`;

export const GET_BOUGHT_ITEMS = gql`
  {
    itemBoughts(first: 20) {
      id
      buyer
      nftAddress
      tokenId
      price
    }
  }
`;

export const GET_CANCELED_ITEMS = gql`
  {
    itemCanceleds(first: 20) {
      id
      seller
      nftAddress
      tokenId
    }
  }
`;

export const GET_LISTED_ITEMS = gql`
  {
    itemListeds(first: 20) {
      id
      seller
      nftAddress
      tokenId
      price
    }
  }
`;

export const GET_ROYALITIES_PAID = gql`
  {
    royalityPaids(first: 20) {
      buyer
      receiver
      nftAddress
      tokenId
      royaltyAmount
    }
  }
`;
export const GET_MINTED_ITEMS = gql`
  query getMintedItems($minter: String) {
    itemMinteds(minter: $minter, first: 10) {
      beneficiary
      id
      minter
      nftAddress
      tokenId
    }
  }
`;
// export const GET_MINTED_ITEMS = gql`
//   query getMintedItems($minter: String) {
//     itemMinteds(where: { minter: $minter }, first: 10) {
//       beneficiary
//       id
//       minter
//       nftAddress
//       tokenId
//     }
//   }
// `;

export const GET_CREATED_EVENTS = gql`
  {
    contractCreateds(first: 20) {
      id
      creator
      nft
    }
  }
`;
export const GET_DISABLED_EVENTS = gql`
  {
    contractDisableds(first: 20) {
      id
      caller
      nft
    }
  }
`;
export const GET_OWNERSHIP_TRANSFERRED_ITEMS = gql`
  {
    ownershipTransferreds(first: 20) {
      id
      previousOwner
      newOwner
    }
  }
`;