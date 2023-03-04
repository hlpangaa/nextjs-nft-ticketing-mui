import { Table, Typography } from "@mui/material";
import { fetchBalance } from "@wagmi/core";

export default function button() {
  async function fethcData() {
    const res = await fetchBalance({
      address: "0xA0Cf798816D4b9b9866b5330EEa46a18382f251e",
    });

    console.log(`inside: ${res}`);
    console.log(res);
  }

  fethcData();

  return <Typography variant="h1">Fetch Data</Typography>;
}
