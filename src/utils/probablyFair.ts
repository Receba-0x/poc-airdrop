import { createHash } from "crypto";

export function generateProvablyFairNumber(
  clientSeed: string,
  serverSeed: string,
  nonce: number
): number {
  const combined = `${clientSeed}:${serverSeed}:${nonce}`;
  const hash = createHash("sha256").update(combined).digest("hex");
  return parseInt(hash.substring(0, 8), 16) / 0xffffffff;
}
