import { navigationTranslations } from "./navigation";
import { boxesTranslations } from "./boxes";
import { transactionsTranslations } from "./transactions";
import { nftsTranslations } from "./nfts";
import { formsTranslations } from "./forms";
import { commonTranslations } from "./common";
import { errorsTranslations } from "./errors";
import { legalTranslations } from "./legal";
import { itemsTranslations } from "./items";
import { adminTranslations } from "./admin";
import { profileTranslations } from "./profile";

// Combine all translations into a single object
export const translations = {
  en: {
    ...navigationTranslations.en,
    ...boxesTranslations.en,
    ...transactionsTranslations.en,
    ...nftsTranslations.en,
    ...formsTranslations.en,
    ...commonTranslations.en,
    ...errorsTranslations.en,
    ...legalTranslations.en,
    ...itemsTranslations.en,
    ...adminTranslations.en,
    ...profileTranslations.en,
  },
  pt: {
    ...navigationTranslations.pt,
    ...boxesTranslations.pt,
    ...transactionsTranslations.pt,
    ...nftsTranslations.pt,
    ...formsTranslations.pt,
    ...commonTranslations.pt,
    ...errorsTranslations.pt,
    ...legalTranslations.pt,
    ...itemsTranslations.pt,
    ...adminTranslations.pt,
    ...profileTranslations.pt,
  },
};

// Export individual translation modules for specific use cases
export {
  navigationTranslations,
  boxesTranslations,
  transactionsTranslations,
  nftsTranslations,
  formsTranslations,
  commonTranslations,
  errorsTranslations,
  legalTranslations,
  itemsTranslations,
  adminTranslations,
  profileTranslations,
};
