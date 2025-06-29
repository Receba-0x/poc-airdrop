export const adrControllerAddress =
  "0x7d85FB6172F71F4d0C3F6A24dA9D736f7627ba0D";
export const adrNftAddress = "0x130a8C1deFeD74C4Dc0A57577B5b44341e3C61B6";
export const adrTokenAddress = "0xE588C2F75145954F01571E9EABFB1A01bA544857";

export const getItensData = (t: (key: string) => string) => {
  return PRIZE_TABLE.map((prize) => {
    const name = getPrizeTranslation(prize.id, t) || prize.name;
    return {
      id: prize.id,
      name: name,
      title: name,
      type: prize.type,
      amount: prize.amount,
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
    name: "0.01 BNB",
    type: "sol",
    amount: 0.01,
    probability: 0.29,
    stockRequired: false,
  },
  {
    id: 2,
    name: "0.05 BNB",
    type: "sol",
    amount: 0.05,
    probability: 0.174,
    stockRequired: false,
  },
  {
    id: 3,
    name: "0.1 BNB",
    type: "sol",
    amount: 0.1,
    probability: 0.087,
    stockRequired: false,
  },
  {
    id: 4,
    name: "0.3 BNB",
    type: "sol",
    amount: 0.3,
    probability: 0.029,
    stockRequired: false,
  },
  {
    id: 5,
    name: "Camisas de time",
    type: "physical",
    metadata: "t-shirt1",
    probability: 0.21,
    stockRequired: true,
    stock: 90,
  },
  {
    id: 6,
    name: "Bolas oficiais",
    type: "physical",
    metadata: "ball",
    probability: 0.112,
    stockRequired: true,
    stock: 40,
  },
  {
    id: 7,
    name: "Chuteiras",
    type: "physical",
    metadata: "chuteira",
    probability: 0.084,
    stockRequired: true,
    stock: 30,
  },
  {
    id: 8,
    name: "MacBook M3",
    type: "physical",
    metadata: "macbook",
    probability: 0.005,
    stockRequired: true,
    stock: 1,
  },
  {
    id: 9,
    name: "iPhone 16 Pro Max",
    type: "physical",
    metadata: "iphone",
    probability: 0.009,
    stockRequired: true,
    stock: 2,
  },
  {
    id: 10,
    name: "Ticket Dourado",
    type: "special",
    metadata: "ticket",
    probability: 0.005,
    stockRequired: true,
    stock: 10,
  },
];

export const CRYPTO_PRIZE_TABLE = [
  {
    id: 101,
    name: "0.005 BNB",
    type: "sol",
    amount: 0.005,
    probability: 0.15,
    value_usd: 0.83,
    image: "/images/itens/sol-coin.webp",
  },
  {
    id: 102,
    name: "0.01 BNB",
    type: "sol",
    amount: 0.01,
    probability: 0.2,
    value_usd: 1.65,
    image: "/images/itens/sol-coin.webp",
  },
  {
    id: 103,
    name: "0.03 BNB",
    type: "sol",
    amount: 0.03,
    probability: 0.2,
    value_usd: 4.95,
    image: "/images/itens/sol-coin.webp",
  },
  {
    id: 104,
    name: "0.05 BNB",
    type: "sol",
    amount: 0.05,
    probability: 0.15,
    value_usd: 8.25,
    image: "/images/itens/sol-coin.webp",
  },
  {
    id: 105,
    name: "0.1 BNB",
    type: "sol",
    amount: 0.1,
    probability: 0.12,
    value_usd: 16.5,
    image: "/images/itens/sol-coin.webp",
  },
  {
    id: 106,
    name: "0.2 BNB",
    type: "sol",
    amount: 0.2,
    probability: 0.08,
    value_usd: 33.0,
    image: "/images/itens/sol-coin.webp",
  },
  {
    id: 107,
    name: "0.3 BNB",
    type: "sol",
    amount: 0.3,
    probability: 0.05,
    value_usd: 49.5,
    image: "/images/itens/sol-coin.webp",
  },
  {
    id: 108,
    name: "0.5 BNB",
    type: "sol",
    amount: 0.5,
    probability: 0.03,
    value_usd: 82.5,
    image: "/images/itens/sol-coin.webp",
  },
  {
    id: 109,
    name: "0.8 BNB",
    type: "sol",
    amount: 0.8,
    probability: 0.01,
    value_usd: 132.0,
    image: "/images/itens/sol-coin.webp",
  },
  {
    id: 110,
    name: "1 BNB",
    type: "sol",
    amount: 1.0,
    probability: 0.007,
    value_usd: 165.0,
    image: "/images/itens/sol-coin.webp",
  },
  {
    id: 111,
    name: "3 BNB",
    type: "sol",
    amount: 3.0,
    probability: 0.003,
    value_usd: 495.0,
    image: "/images/itens/sol-coin.webp",
  },
];
