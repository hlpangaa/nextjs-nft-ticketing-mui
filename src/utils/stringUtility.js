import { ethers, BigNumber } from "ethers";
// import {
//   handleAddress,
//   handleTimeStamp,
//   handleCurrencyFormat,
// } from "@/src/utils/stringUtility";

export function handleAddress(address) {
  const maxLength = 6;
  return address.length > maxLength
    ? address.substring(0, maxLength) + "..."
    : address;
}

export function handleTimeStamp(timeStamp) {
  var dateFormat = new Date(timeStamp * 1000).toLocaleDateString("en-US");

  return dateFormat;
}

export function handleCurrencyFormat(value, unit) {
  if (unit == "ETH") {
    console.log(value);
    console.log("convert from wei to ETH");

    return ethers.utils.formatEther(value);
  } else {
    console.log(value);
    console.log("convert to ETH");
    return ethers.utils.parseEther(value, "ether");
  }

  //formating refer to https://docs.ethers.org/v4/api-utils.html
  //utils.bigNumberify
  // mintFee is string
  // const bigNumber = BigNumber.from(mintFee);
  // const eth = handleCurrencyFormat(bigNumber, "ETH");

  // return <TableCell align="right">{`${eth} ETH`}</TableCell>;
}
