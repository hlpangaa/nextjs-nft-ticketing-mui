import { gql } from "@apollo/client";

// See more example queries on https://thegraph.com/explorer/subgraph/protofire/maker-protocol
// 0x0000000000000000000000000000000000000000 zero address
// 0x000000000000000000000000000000000000dEaD dead address
//https://thegraph.com/docs/en/querying/graphql-api/

export const GET_ACTIVE_ITEMS = gql`
  query getActiveItems($creator: String, $nftAddress: String, $tokenId: Int) {
    activeItems(
      first: 20
      where: {
        buyer: "0x0000000000000000000000000000000000000000"
        nftAddress: $nftAddress
        tokenId: $tokenId
      }
    ) {
      id
      buyer
      seller
      nftAddress
      tokenId
      price
      txHash
      blockNumber
      timestamp
      gasPrice
    }
  }
`;

export const GET_ACTIVE_EVENTS = gql`
  {
    activeEvents(first: 20) {
      id
      creator
      nft
      txHash
      blockNumber
      timestamp
      gasPrice
    }
  }
`;
export const GET_MY_EVENTS = gql`
  query getMyEvents($creator: String) {
    activeEvents(first: 20, where: { creator: $creator }) {
      id
      creator
      nft
      txHash
      blockNumber
      timestamp
      gasPrice
    }
  }
`;

export const GET_OWNED_ITEMS = gql`
  query getOwnedItems($owner: String) {
    itemOwneds(first: 20, where: { owner: $owner }) {
      id
      owner
      nftAddress
      tokenId
      txHash
      blockNumber
      timestamp
      gasPrice
    }
  }
`;

export const GET_BOUGHT_ITEMS = gql`
  query getBoughtItems($buyer: String) {
    itemBoughts(buyer: $buyer, first: 20) {
      id
      buyer
      nftAddress
      tokenId
      price
      txHash
      blockNumber
      timestamp
      gasPrice
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
      txHash
      blockNumber
      timestamp
      gasPrice
    }
  }
`;

export const GET_LISTED_ITEMS = gql`
  query getListedItems($seller: String) {
    itemListeds(seller: $seller, first: 20) {
      id
      seller
      nftAddress
      tokenId
      price
      txHash
      blockNumber
      timestamp
      gasPrice
    }
  }
`;

export const GET_ROYALITIES_PAID = gql`
  query getRoyalityPaids($buyer: String) {
    royalityPaids(buyer: $buyer, first: 20) {
      buyer
      receiver
      nftAddress
      tokenId
      royaltyAmount
      txHash
      blockNumber
      timestamp
      gasPrice
    }
  }
`;
export const GET_MINTED_ITEMS = gql`
  query getMintedItems($minter: String) {
    itemMinteds(minter: $minter, first: 20) {
      beneficiary
      id
      minter
      nftAddress
      tokenId
      txHash
      blockNumber
      timestamp
      gasPrice
    }
  }
`;

export const GET_CREATED_EVENTS = gql`
  query getCreatedEvents($creator: String) {
    contractCreateds(creator: $creator, first: 20) {
      id
      creator
      nft
      txHash
      blockNumber
      timestamp
      gasPrice
    }
  }
`;
export const GET_DISABLED_EVENTS = gql`
  {
    contractDisableds(first: 20) {
      id
      caller
      nft
      txHash
      blockNumber
      timestamp
      gasPrice
    }
  }
`;
export const GET_OWNERSHIP_TRANSFERRED_ITEMS = gql`
  {
    ownershipTransferreds(first: 20) {
      id
      previousOwner
      newOwner
      txHash
      blockNumber
      timestamp
      gasPrice
    }
  }
`;
