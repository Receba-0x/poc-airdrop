import { ethers } from "ethers";

export * from "./currency";

declare global {
  interface Window {
    ethereum: any;
  }
}

export async function getProvider() {
  if (!window.ethereum) throw new Error("Ethereum provider not found");
  return new ethers.BrowserProvider(window.ethereum);
}
