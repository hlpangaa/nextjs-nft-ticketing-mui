import { useQuery, gql } from "@apollo/client";
import useSWR from "swr";

const query = gql`
  {
    itemMinteds(first: 5) {
      id
      nftAddress
      tokenId
    }
  }
`;
const fetcher = (query) => useQuery(query);

export default function Example() {
  const { data, error } = useQuery(query);

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
