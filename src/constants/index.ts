export const COLLECTION_NAME = "ADR Collection";
export const COLLECTION_SYMBOL = "ADR";
export const COLLECTION_URI = "https://adr-token.vercel.app/metadata";
export const COLLECTION_MINT = "B3js6wNMcDdQsNv2UsP3zd4zps7tAVS9cxu3aSFZ5Mth";
export const COLLECTION_METADATA = "6UAq8sFKccmxTXtRtHKbEc19BFGxrvfSvDVRuJ33NikD";
export const COLLECTION_TOKEN_ACCOUNT = "3kig3DHddw1yAMuP4MdagQSv2QdGbKwGY4YPvtLLYUpT";
export const PROGRAM_ID = "EN2SeC45TuHgrLg33ZhJLsYSX5gxnunrVm5P6Dx5eiRS";
export const PAYMENT_TOKEN_MINT =
  "2ADpKWBqVKCjaWY2xFkXTPo6v2Z863SefjT2GUfNHhay";
export const NETWORK = "devnet";
export const CONFIG_ACCOUNT = "GAnjrKx377NS9ceg6k4nB7vaDX8bAo9yWfJSD4vhrecr";
export const TOKEN_METADATA_PROGRAM = [11, 112, 101, 177, 227, 209, 124, 69, 56, 157, 82, 127, 107, 4, 195, 205, 88, 184, 108, 115, 26, 160, 253, 181, 73, 182, 209, 188, 3, 248, 41, 70];

export const getItensData = (t: (key: string) => string) => [{ id: "t-shirt1", title: t("items.soccerJersey"), image: "/images/itens/camisa1.png", }, { id: "t-shirt2", title: t("items.soccerJersey"), image: "/images/itens/camisa2.png", }, { id: "t-shirt3", title: t("items.soccerJersey"), image: "/images/itens/camisa3.png", }, { id: "t-shirt4", title: t("items.soccerJersey"), image: "/images/itens/camisa4.png", }, { id: "chuteira", title: t("items.soccerCleats"), image: "/images/itens/chuteira.png", }, { id: "mikasa", title: t("items.mikasaBall"), image: "/images/itens/ball.png", }, { id: "iphone", title: t("items.iphoneGiftCard"), image: "/images/itens/iphone.png", }, { id: "macbook", title: t("items.macbookGiftCard"), image: "/images/itens/macbook.png", },];

export const PRIZE_TABLE = [
  { id: 1, name: "0.01 SOL", type: "sol", amount: 0.01, probability: 0.208636, stockRequired: false },
  { id: 2, name: "0.05 SOL", type: "sol", amount: 0.05, probability: 0.125182, stockRequired: false },
  { id: 3, name: "0.1 SOL", type: "sol", amount: 0.1, probability: 0.062591, stockRequired: false },
  { id: 4, name: "0.3 SOL", type: "sol", amount: 0.3, probability: 0.020864, stockRequired: false },
  { id: 5, name: "NFT Comum", type: "nft", metadata: "/metadata/chuteira.json", probability: 0.222545, stockRequired: false },
  { id: 6, name: "NFT Rara", type: "nft", metadata: "/metadata/chuteira.json", probability: 0.041727, stockRequired: false },
  { id: 7, name: "NFT Lendária", type: "nft", metadata: "/metadata/chuteira.json", probability: 0.013909, stockRequired: false },
  { id: 8, name: "Camisas de time", type: "physical", metadata: "/metadata/chuteira.json", probability: 0.150000, stockRequired: true, stock: 90 },
  { id: 9, name: "Bolas oficiais", type: "physical", metadata: "/metadata/chuteira.json", probability: 0.080000, stockRequired: true, stock: 40 },
  { id: 10, name: "Chuteiras", type: "physical", metadata: "/metadata/chuteira.json", probability: 0.060000, stockRequired: true, stock: 30 },
  { id: 11, name: "MacBook M3", type: "physical", metadata: "/metadata/chuteira.json", probability: 0.003636, stockRequired: true, stock: 1 },
  { id: 12, name: "iPhone 16 Pro Max", type: "physical", metadata: "/metadata/chuteira.json", probability: 0.007273, stockRequired: true, stock: 2 },
  { id: 13, name: "Ticket Dourado", type: "special", metadata: "/metadata/chuteira.json", probability: 0.003636, stockRequired: true, stock: 10 },
];

export const CRYPTO_PRIZE_TABLE = [
  { id: 101, name: "0.005 SOL", type: "sol", amount: 0.005, probability: 0.1500, value_usd: 0.83, image: "/images/itens/sol-coin.png", },
  { id: 102, name: "0.01 SOL", type: "sol", amount: 0.01, probability: 0.2000, value_usd: 1.65, image: "/images/itens/sol-coin.png", },
  { id: 103, name: "0.03 SOL", type: "sol", amount: 0.03, probability: 0.2000, value_usd: 4.95, image: "/images/itens/sol-coin.png", },
  { id: 104, name: "0.05 SOL", type: "sol", amount: 0.05, probability: 0.1500, value_usd: 8.25, image: "/images/itens/sol-coin.png", },
  { id: 105, name: "0.1 SOL", type: "sol", amount: 0.1, probability: 0.1200, value_usd: 16.50, image: "/images/itens/sol-coin.png", },
  { id: 106, name: "0.2 SOL", type: "sol", amount: 0.2, probability: 0.0800, value_usd: 33.00, image: "/images/itens/sol-coin.png", },
  { id: 107, name: "0.3 SOL", type: "sol", amount: 0.3, probability: 0.0500, value_usd: 49.50, image: "/images/itens/sol-coin.png", },
  { id: 108, name: "0.5 SOL", type: "sol", amount: 0.5, probability: 0.0300, value_usd: 82.50, image: "/images/itens/sol-coin.png", },
  { id: 109, name: "0.8 SOL", type: "sol", amount: 0.8, probability: 0.0100, value_usd: 132.00, image: "/images/itens/sol-coin.png", },
  { id: 110, name: "1 SOL", type: "sol", amount: 1.0, probability: 0.0070, value_usd: 165.00, image: "/images/itens/sol-coin.png", },
  { id: 111, name: "3 SOL", type: "sol", amount: 3.0, probability: 0.0030, value_usd: 495.00, image: "/images/itens/sol-coin.png", },
];
