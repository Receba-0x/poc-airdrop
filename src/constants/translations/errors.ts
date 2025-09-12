export const errorsTranslations = {
  en: {
    // Error Messages
    "error.transactionCancelled": "Transaction cancelled by user",
    "error.similarTransactionRecent":
      "A similar transaction was recently processed. Please wait a moment and try again.",
    "error.networkCongestion":
      "Network congestion detected. Please try again in a few seconds.",
    "error.insufficientBalance": "Insufficient balance for this transaction",
    "error.transactionFailed": "Transaction failed. Please try again.",

    // Validation Messages
    "validation.bnbFeeRequired": "SOL fee payment is required",
    "validation.bnbFeeFailed":
      "SOL fee validation failed. Please verify the fee was paid correctly.",
    "validation.burnTransactionFailed":
      "Token burn validation failed. Please verify tokens were burned correctly.",
    "validation.invalidServerSignature":
      "Invalid server signature. Please try again.",
    "validation.replayAttack":
      "This transaction has already been used. Each transaction can only be used once.",
    "validation.transactionTooOld": "Transaction is too old. Please try again.",
    "validation.amountMismatch":
      "Transaction amount doesn't match. Please verify the amount sent.",
    "validation.invalidSender":
      "Invalid transaction sender. Transaction must be sent from your wallet.",
    "validation.treasuryNotConfigured":
      "System configuration incomplete. Please try again later.",
  },
  pt: {
    // Error Messages
    "error.transactionCancelled": "Transação cancelada pelo usuário",
    "error.similarTransactionRecent":
      "Uma transação similar foi processada recentemente. Por favor, aguarde um momento e tente novamente.",
    "error.networkCongestion":
      "Congestão de rede detectada. Por favor, tente novamente em alguns segundos.",
    "error.insufficientBalance": "Saldo insuficiente para esta transação",
    "error.transactionFailed": "Transação falhou. Por favor, tente novamente.",

    // Validation Messages
    "validation.bnbFeeRequired": "Pagamento da taxa SOL é obrigatório",
    "validation.bnbFeeFailed":
      "Falha na validação da taxa SOL. Verifique se a taxa foi paga corretamente.",
    "validation.burnTransactionFailed":
      "Falha na validação da queima de tokens. Verifique se os tokens foram queimados corretamente.",
    "validation.invalidServerSignature":
      "Assinatura do servidor inválida. Por favor, tente novamente mais tarde.",
    "validation.replayAttack":
      "Esta transação já foi utilizada. Cada transação só pode ser usada uma vez.",
    "validation.transactionTooOld": "Transação muito antiga. Tente novamente.",
    "validation.amountMismatch":
      "Valor da transação não confere. Verifique o valor enviado.",
    "validation.invalidSender":
      "Remetente da transação inválido. A transação deve ser enviada da sua carteira.",
    "validation.treasuryNotConfigured":
      "Configuração do sistema incompleta. Tente novamente mais tarde.",
  },
};
