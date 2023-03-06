// graphQL packages
import { useQuery, gql } from "@apollo/client";

// graphQL consts
// 1. update query script
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
  console.log("DisplayItems");
  console.log(data);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  // 2. update item name
  return data.itemMinteds.map(
    // 3. update item parameters, 4. update return object mapping
    ({ id, buyer, seller, nftAddress, tokenId, price }) => (
      <div key={id}>
        <h3>#{id}</h3>
        <img
          width="400"
          height="250"
          alt="location-reference"
          src={`https://plus.unsplash.com/premium_photo-1663839412138-19464a1b3244?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1974&q=80`}
        />
        <br />
        <b>tokenId:</b>
        <p>{tokenId}</p>
        <br />
      </div>
    )
  );
}

export default function result() {
  return (
    <div>
      <DisplayItems />
    </div>
  );
}
