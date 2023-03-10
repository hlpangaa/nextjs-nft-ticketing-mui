import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useContractRead } from "wagmi";
import eventContractAbi from "../../constants/EventContract.json";

function EventDetail() {
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const { eventId } = router.query;

  const { data: contractUri } = useContractRead({
    address: eventId,
    abi: eventContractAbi,
    functionName: "contractURI",
    watch: true,
    onError(error) {
      console.log("Error", error);
    },
  });

  useEffect(() => {
    async function getEvent() {
      const requestURL = contractUri.replace(
        "ipfs://",
        "https://gateway.pinata.cloud/ipfs/"
      );
      const res = await fetch(requestURL);
      const metadata = await res.json();
      setEvent(metadata);
    }
    if (contractUri) {
      getEvent();
    }
  }, [contractUri]);

  if (!event) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>
        {event.organizerName} - {event.eventName}
      </h1>
      <p>
        {event.date} - {event.time}
      </p>
      <p>{event.location}</p>
      <p>{event.eventDescription}</p>
      <img src={event.fileUrl} alt={event.eventName} />
    </div>
  );
}

export default EventDetail;
