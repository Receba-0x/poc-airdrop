export const PURCHASE_CONFIG = {
  PRICES: {
    CRYPTO: { USD: 17.5, TOKEN_RATE: 0.002 },
    SUPER: { USD: 45, TOKEN_RATE: 0.002 }
  },
  SOL_FEES: {
    CRYPTO: 0.008, // Equivalent SOL amount for crypto box
    SUPER: 0.038   // Equivalent SOL amount for super box
  },
  GAS_LIMITS: {
    SOLANA_TRANSACTION: 1000000 // Compute units for Solana transaction
  }
} as const;

export const ERROR_MESSAGES = {
  "replay attack": "Esta transação já foi utilizada. Cada transação só pode ser usada uma vez.",
  "Invalid server signature": "Assinatura do servidor inválida. Tente novamente.",
  "SOL fee validation failed": "Falha na validação da taxa SOL. Verifique se a taxa foi paga corretamente.",
  "Verified burn validation failed": "Falha na validação da queima verificada. Verifique se a transação foi confirmada.",
  "VerifiedTokensBurned event not found": "Evento de queima verificada não encontrado. Verifique se o contrato foi chamado corretamente.",
  "Program not configured": "Configuração do sistema incompleta. Tente novamente mais tarde.",
  "too old": "Transação muito antiga. Por favor, tente novamente.",
  "Amount mismatch": "Valor da transação não confere. Verifique o valor enviado.",
  "Timestamp mismatch": "Timestamp da transação não confere. Tente novamente.",
  "Invalid sender": "Remetente da transação inválido. A transação deve ser enviada da sua carteira.",
} as const;

export function getErrorMessage(error: string): string {
  for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
    if (error.includes(key)) return message;
  }
  return error || "Error processing purchase";
}

export function calculateTokenAmount(isCrypto: boolean): number {
  const config = isCrypto ? PURCHASE_CONFIG.PRICES.CRYPTO : PURCHASE_CONFIG.PRICES.SUPER;
  return config.USD / config.TOKEN_RATE;
}

export function calculateSolFee(isCrypto: boolean): number {
  return isCrypto ? PURCHASE_CONFIG.SOL_FEES.CRYPTO : PURCHASE_CONFIG.SOL_FEES.SUPER;
}

export function getBoxTypeString(isCrypto: boolean, t: any): string {
  return isCrypto ? t("box.cryptos") : t("box.superPrizes");
}

export function formatTokenAmount(amount: number): string {
  return amount.toLocaleString("en-US");
} 