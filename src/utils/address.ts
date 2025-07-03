export function truncateAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 6
): string {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};
