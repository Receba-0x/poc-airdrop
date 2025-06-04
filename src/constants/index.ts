export const COLLECTION_NAME = "ADR Collection";
export const COLLECTION_SYMBOL = "ADR";
export const COLLECTION_URI = "https://your-collection-uri.com";
export const COLLECTION_MINT = "B3js6wNMcDdQsNv2UsP3zd4zps7tAVS9cxu3aSFZ5Mth";
export const COLLECTION_METADATA = "6UAq8sFKccmxTXtRtHKbEc19BFGxrvfSvDVRuJ33NikD";
export const COLLECTION_TOKEN_ACCOUNT = "3kig3DHddw1yAMuP4MdagQSv2QdGbKwGY4YPvtLLYUpT";
export const PROGRAM_ID = "EN2SeC45TuHgrLg33ZhJLsYSX5gxnunrVm5P6Dx5eiRS";
export const PAYMENT_TOKEN_MINT =
  "2ADpKWBqVKCjaWY2xFkXTPo6v2Z863SefjT2GUfNHhay";
export const NETWORK = "devnet";
export const CONFIG_ACCOUNT = "GAnjrKx377NS9ceg6k4nB7vaDX8bAo9yWfJSD4vhrecr";

export const getItensData = (t: (key: string) => string) => [{ id: "t-shirt1", title: t("items.soccerJersey"), image: "/images/itens/camisa1.png", }, { id: "t-shirt2", title: t("items.soccerJersey"), image: "/images/itens/camisa2.png", }, { id: "t-shirt3", title: t("items.soccerJersey"), image: "/images/itens/camisa3.png", }, { id: "t-shirt4", title: t("items.soccerJersey"), image: "/images/itens/camisa4.png", }, { id: "chuteira", title: t("items.soccerCleats"), image: "/images/itens/chuteira.png", }, { id: "mikasa", title: t("items.mikasaBall"), image: "/images/itens/ball.png", }, { id: "iphone", title: t("items.iphoneGiftCard"), image: "/images/itens/iphone.png", }, { id: "macbook", title: t("items.macbookGiftCard"), image: "/images/itens/macbook.png", },];// Para manter compatibilidade com código existenteexport const itensData = [  {    id: "t-shirt1",    title: "Soccer Jersey Autographed",    image: "/images/itens/camisa1.png",  },  {    id: "t-shirt2",    title: "Soccer Jersey Autographed",    image: "/images/itens/camisa2.png",  },  {    id: "t-shirt3",    title: "Soccer Jersey Autographed",    image: "/images/itens/camisa3.png",  },  {    id: "t-shirt4",    title: "Soccer Jersey Autographed",    image: "/images/itens/camisa4.png",  },  {    id: "chuteira",    title: "Soccer Cleats",    image: "/images/itens/chuteira.png",  },  {    id: "mikasa",    title: "Mikasa Soccer Ball",    image: "/images/itens/ball.png",  },  {    id: "iphone",    title: "Amazon Iphone Gift Card",    image: "/images/itens/iphone.png",  },  {    id: "macbook",    title: "Amazon Macbook Gift Card",    image: "/images/itens/macbook.png",  },];

export const cryptoData = [
  {
    id: "crypto-1",
    title: "5.0 SOL",
    amount: 5.0,
    image: "/images/itens/sol-coin.png",
    probability: 10,
  },
  {
    id: "crypto-2",
    title: "1.0 SOL",
    amount: 1.0,
    image: "/images/itens/sol-coin.png",
    probability: 10,
  },
  {
    id: "crypto-3",
    title: "0.1 SOL",
    amount: 0.1,
    image: "/images/itens/sol-coin.png",
    probability: 10,
  },
  {
    id: "crypto-4",
    title: "0.05 SOL",
    amount: 0.05,
    image: "/images/itens/sol-coin.png",
    probability: 20,
  },
  {
    id: "crypto-5",
    title: "0.01 SOL",
    amount: 0.01,
    image: "/images/itens/sol-coin.png",
    probability: 5,
  },
];
