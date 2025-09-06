export const COLLECTION_NAME = "Imperador Collection";
export const COLLECTION_SYMBOL = "IMPERADOR";
export const COLLECTION_URI = "https://loot-for-fun.vercel.app/images/itens/metadata";
export const COLLECTION_MINT = "B3js6wNMcDdQsNv2UsP3zd4zps7tAVS9cxu3aSFZ5Mth";
export const COLLECTION_METADATA =
  "6UAq8sFKccmxTXtRtHKbEc19BFGxrvfSvDVRuJ33NikD";
export const COLLECTION_TOKEN_ACCOUNT =
  "3kig3DHddw1yAMuP4MdagQSv2QdGbKwGY4YPvtLLYUpT";
export const PROGRAM_ID = "EN2SeC45TuHgrLg33ZhJLsYSX5gxnunrVm5P6Dx5eiRS";
export const PAYMENT_TOKEN_MINT =
  "6fWhJxuTjoUgYNx5NJpb8w8AyonmVbHhhdmN2AfwUTMH";
export const NETWORK = "devnet";
export const CONFIG_ACCOUNT = "GAnjrKx377NS9ceg6k4nB7vaDX8bAo9yWfJSD4vhrecr";
export const TOKEN_METADATA_PROGRAM = [
  11, 112, 101, 177, 227, 209, 124, 69, 56, 157, 82, 127, 107, 4, 195, 205, 88,
  184, 108, 115, 26, 160, 253, 181, 73, 182, 209, 188, 3, 248, 41, 70,
];
export const METAPLEX_PROGRAM_ID =
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";

export const getItensData = (t: (key: string) => string) => {
  return PRIZE_TABLE.map((prize) => {
    const name = getPrizeTranslation(prize.id, t) || prize.name;
    return {
      id: prize.id,
      name: name,
      title: name,
      type: prize.type,
      amount: prize.amount,
      rarity: prize.rarity,
      image: getImageForPrize(prize, t),
    };
  });
};

function getPrizeTranslation(
  prizeId: number,
  t: (key: string) => string
): string | null {
  switch (prizeId) {
    case 5:
      return t("items.teamJersey");
    case 6:
      return t("items.officialBall");
    case 7:
      return t("items.soccerCleats");
    case 8:
      return t("items.macbookM3");
    case 9:
      return t("items.iphone16");
    case 10:
      return t("items.goldenTicket");
    default:
      return null;
  }
}

function getImageForPrize(prize: any, t: (key: string) => string) {
  switch (prize.id) {
    case 5:
      return "/images/itens/camisa1.webp";
    case 6:
      return "/images/itens/ball.png";
    case 7:
      return "/images/itens/chuteira.webp";
    case 8:
      return "/images/itens/macbook.webp";
    case 9:
      return "/images/itens/iphone.webp";
    case 10:
      return "/images/itens/golden-ticket.png";
    default:
      if (prize.type === "sol") {
        return "/images/itens/sol-coin.webp";
      }
      return "/images/itens/camisa1.webp";
  }
}

export const PRIZE_TABLE = [
  {
    id: 1,
    rarity: "uncommon",
    name: "0.002538 SOL",
    type: "sol",
    amount: 0.002538,
    probability: 0.175379,
    stockRequired: false,
  },
  {
    id: 2,
    rarity: "rare",
    name: "0.012692 SOL",
    type: "sol",
    amount: 0.012692,
    probability: 0.315682,
    stockRequired: false,
  },
  {
    id: 3,
    rarity: "epic",
    name: "0.025385 SOL",
    type: "sol",
    amount: 0.025385,
    probability: 0.175379,
    stockRequired: false,
  },
  {
    id: 4,
    rarity: "legendary",
    name: "0.076154 SOL",
    type: "sol",
    amount: 0.076154,
    probability: 0.035076,
    stockRequired: false,
  },
  {
    id: 5,
    rarity: "uncommon",
    name: "Camisas de time",
    type: "physical",
    metadata: "t-shirt1",
    probability: 0.15,
    stockRequired: true,
    stock: 90,
  },
  {
    id: 6,
    rarity: "rare",
    name: "Bolas oficiais",
    type: "physical",
    metadata: "ball",
    probability: 0.08,
    stockRequired: true,
    stock: 40,
  },
  {
    id: 7,
    rarity: "epic",
    name: "Chuteiras",
    type: "physical",
    metadata: "chuteira",
    probability: 0.06,
    stockRequired: true,
    stock: 30,
  },
  {
    id: 8,
    rarity: "legendary",
    name: "MacBook M3",
    type: "physical",
    metadata: "macbook",
    probability: 0.001818,
    stockRequired: true,
    stock: 1,
  },
  {
    id: 9,
    rarity: "legendary",
    name: "iPhone 16 Pro Max",
    type: "physical",
    metadata: "iphone",
    probability: 0.004848,
    stockRequired: true,
    stock: 2,
  },
  {
    id: 10,
    rarity: "legendary",
    name: "Ticket Dourado",
    type: "special",
    metadata: "ticket",
    probability: 0.001818,
    stockRequired: true,
    stock: 10,
  },
];

export const CRYPTO_PRIZE_TABLE = [
  {
    id: 101,
    name: "0.001277 SOL",
    type: "sol",
    amount: 0.001277,
    probability: 0.15,
    value_usd: 0.83,
    image: "/images/itens/sol-coin.webp",
  },
  {
    id: 102,
    name: "0.002538 SOL",
    type: "sol",
    amount: 0.002538,
    probability: 0.2,
    value_usd: 1.65,
    image: "/images/itens/sol-coin.webp",
  },
  {
    id: 103,
    name: "0.007615 SOL",
    type: "sol",
    amount: 0.007615,
    probability: 0.2,
    value_usd: 4.95,
    image: "/images/itens/sol-coin.webp",
  },
  {
    id: 104,
    name: "0.012692 SOL",
    type: "sol",
    amount: 0.012692,
    probability: 0.15,
    value_usd: 8.25,
    image: "/images/itens/sol-coin.webp",
  },
  {
    id: 105,
    name: "0.025385 SOL",
    type: "sol",
    amount: 0.025385,
    probability: 0.12,
    value_usd: 16.5,
    image: "/images/itens/sol-coin.webp",
  },
  {
    id: 106,
    name: "0.050769 SOL",
    type: "sol",
    amount: 0.050769,
    probability: 0.08,
    value_usd: 33.0,
    image: "/images/itens/sol-coin.webp",
  },
  {
    id: 107,
    name: "0.076154 SOL",
    type: "sol",
    amount: 0.076154,
    probability: 0.05,
    value_usd: 49.5,
    image: "/images/itens/sol-coin.webp",
  },
  {
    id: 108,
    name: "0.126923 SOL",
    type: "sol",
    amount: 0.126923,
    probability: 0.03,
    value_usd: 82.5,
    image: "/images/itens/sol-coin.webp",
  },
  {
    id: 109,
    name: "0.203077 SOL",
    type: "sol",
    amount: 0.203077,
    probability: 0.01,
    value_usd: 132.0,
    image: "/images/itens/sol-coin.webp",
  },
  {
    id: 110,
    name: "0.253846 SOL",
    type: "sol",
    amount: 0.253846,
    probability: 0.007,
    value_usd: 165.0,
    image: "/images/itens/sol-coin.webp",
  },
  {
    id: 111,
    name: "0.761538 SOL",
    type: "sol",
    amount: 0.761538,
    probability: 0.003,
    value_usd: 495.0,
    image: "/images/itens/sol-coin.webp",
  },
];

export const itensMock = [
  {
    id: 1,
    title: "Camisa Neymar",
    image: "/images/itens/camisa1.webp",
    rarity: "uncommon",
  },
  {
    id: 2,
    title: "Bolas oficiais",
    image: "/images/itens/ball.png",
    rarity: "rare",
  },
  {
    id: 3,
    title: "Chuteiras",
    image: "/images/itens/chuteira.webp",
    rarity: "epic",
  },
  {
    id: 4,
    title: "MacBook M3",
    image: "/images/itens/macbook.webp",
    rarity: "legendary",
  },
  {
    id: 5,
    title: "iPhone 16",
    image: "/images/itens/iphone.webp",
    rarity: "legendary",
  },
  {
    id: 6,
    title: "Ticket Dourado",
    image: "/images/itens/golden-ticket.png",
    rarity: "legendary",
  },
  {
    id: 7,
    title: "0.002538 SOL",
    image: "/images/itens/sol-coin.webp",
    rarity: "uncommon",
  },
  {
    id: 8,
    title: "0.012692 SOL",
    image: "/images/itens/sol-coin.webp",
    rarity: "rare",
  },
  {
    id: 9,
    title: "0.050769 SOL",
    image: "/images/itens/sol-coin.webp",
    rarity: "epic",
  },
  {
    id: 10,
    title: "0.076154 SOL",
    image: "/images/itens/sol-coin.webp",
    rarity: "legendary",
  },
  {
    id: 11,
    title: "0.050769 SOL",
    image: "/images/itens/sol-coin.webp",
    rarity: "epic",
  },
  {
    id: 12,
    title: "0.076154 SOL",
    image: "/images/itens/sol-coin.webp",
    rarity: "legendary",
  },
  {
    id: 13,
    title: "0.050769 SOL",
    image: "/images/itens/sol-coin.webp",
    rarity: "epic",
  },
  {
    id: 14,
    title: "0.076154 SOL",
    image: "/images/itens/sol-coin.webp",
    rarity: "legendary",
  },
  {
    id: 15,
    title: "0.076154 SOL",
    image: "/images/itens/sol-coin.webp",
    rarity: "legendary",
  },
  {
    id: 16,
    title: "0.050769 SOL",
    image: "/images/itens/sol-coin.webp",
    rarity: "epic",
  },
  {
    id: 17,
    title: "0.076154 SOL",
    image: "/images/itens/sol-coin.webp",
    rarity: "legendary",
  },
  {
    id: 18,
    title: "0.076154 SOL",
    image: "/images/itens/sol-coin.webp",
    rarity: "legendary",
  },
  {
    id: 19,
    title: "0.050769 SOL",
    image: "/images/itens/sol-coin.webp",
    rarity: "epic",
  },
  {
    id: 20,
    title: "0.076154 SOL",
    image: "/images/itens/sol-coin.webp",
    rarity: "legendary",
  },
];

export const leadersMock = [
  {
    id: 1,
    avatar: "/images/avatar_default.png",
    username: "John Doe",
    rank: 1,
    last_win: 1,
    winnings: 1000,
  },
  {
    id: 2,
    avatar: "/images/avatar_default.png",
    username: "John Doe",
    rank: 2,
    last_win: 1,
    winnings: 1000,
  },
  {
    id: 3,
    avatar: "/images/avatar_default.png",
    username: "John Doe",
    rank: 3,
    last_win: 1,
    winnings: 1000,
  },
  {
    id: 4,
    avatar: "/images/avatar_default.png",
    username: "John Doe",
    rank: 4,
    last_win: 1,
    winnings: 1000,
  },
];

export const boxesData = [
  {
    id: "1",
    title: "Crypto Box",
    image: "/images/boxes/cripto.webp",
    price: 17.5,
  },
  {
    id: "2",
    title: "Super Prize Box",
    image: "/images/boxes/super-prize.webp",
    price: 45,
  },
  {
    id: "3",
    title: "ADR Prizes Box",
    image: "/images/boxes/adr-prizes.webp",
    price: 17.5,
  },
  {
    id: "4",
    title: "Golden Box",
    image: "/images/boxes/cripto.webp",
    price: 17.5,
  },
  {
    id: "5",
    title: "Diamond Box",
    image: "/images/boxes/super-prize.webp",
    price: 17.5,
  },
  {
    id: "6",
    title: "Platinum Box",
    image: "/images/boxes/adr-prizes.webp",
    price: 17.5,
  },
  {
    id: "7",
    title: "Silver Box",
    image: "/images/boxes/cripto.webp",
    price: 17.5,
  },
  {
    id: "8",
    title: "Bronze Box",
    image: "/images/boxes/super-prize.webp",
    price: 17.5,
  },
  {
    id: "9",
    title: "Premium Box",
    image: "/images/boxes/adr-prizes.webp",
    price: 17.5,
  },
  {
    id: "10",
    title: "Elite Box",
    image: "/images/boxes/cripto.webp",
    price: 17.5,
  },
  {
    id: "11",
    title: "Legendary Box",
    image: "/images/boxes/super-prize.webp",
    price: 17.5,
  },
  {
    id: "12",
    title: "Epic Box",
    image: "/images/boxes/adr-prizes.webp",
    price: 17.5,
  },
  {
    id: "13",
    title: "Rare Box",
    image: "/images/boxes/cripto.webp",
    price: 17.5,
  },
  {
    id: "14",
    title: "Common Box",
    image: "/images/boxes/super-prize.webp",
    price: 17.5,
  },
  {
    id: "15",
    title: "Starter Box",
    image: "/images/boxes/adr-prizes.webp",
    price: 17.5,
  },
  {
    id: "16",
    title: "Mystery Box",
    image: "/images/boxes/cripto.webp",
    price: 17.5,
  },
  {
    id: "17",
    title: "Treasure Box",
    image: "/images/boxes/super-prize.webp",
    price: 17.5,
  },
  {
    id: "18",
    title: "Lucky Box",
    image: "/images/boxes/adr-prizes.webp",
    price: 17.5,
  },
  {
    id: "19",
    title: "Fortune Box",
    image: "/images/boxes/cripto.webp",
    price: 17.5,
  },
  {
    id: "20",
    title: "Champion Box",
    image: "/images/boxes/super-prize.webp",
    price: 17.5,
  },
];
