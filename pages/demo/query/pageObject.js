// graphQL packages
import FeaturedPost from "@/components/Cards/FeaturedPost";

//graph query
import { useQuery, gql } from "@apollo/client";

const query = gql`
  {
    itemMinteds(first: 5) {
      id
      nftAddress
      tokenId
    }
  }
`;

function DisplayItems() {
  const { loading, error, data } = useQuery(query);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return data.itemMinteds.map(({ id, tokenId, nftAddress }) => (
    <FeaturedPost
      key={id}
      id={id}
      tokenId={tokenId}
      nftAddress={nftAddress}
    ></FeaturedPost>
  ));
}

export default function page() {
  return (
    <div>
      <DisplayItems />
    </div>
  );
}
