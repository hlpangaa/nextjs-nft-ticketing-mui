export function handleAddress(address) {
  const maxLength = 6;
  return address.length > maxLength
    ? address.substring(0, maxLength) + "..."
    : address;
}
