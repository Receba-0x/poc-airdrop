import { CurrencyType } from "@/stores/transactionStore";

export function useTransactionValidation() {
  const validateAmount = (
    amount: string,
    currency: CurrencyType,
    type: "deposit" | "withdraw"
  ): boolean => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return false;

    // Validações específicas por tipo e moeda conforme documentação
    if (type === "deposit") {
      if (currency === "SOL") {
        const decimalPart = numAmount.toString().split(".")[1];
        const decimalLength = decimalPart ? decimalPart.length : 0;
        return (
          numAmount >= 0.01 && numAmount <= 10000 && decimalLength <= 5
        );
      }
    } else if (type === "withdraw") {
      // Para saques, amount é em USD
      const decimalPart = numAmount.toString().split(".")[1];
      const decimalLength = decimalPart ? decimalPart.length : 0;
      return numAmount >= 0.01 && numAmount <= 5000 && decimalLength <= 2;
    }

    return false;
  };

  const validateAddress = (address: string): boolean => {
    // Validação de carteira Solana (44 caracteres)
    if (!address) return false;
    if (address.length !== 44) return false;
    return /^[1-9A-HJ-NP-Za-km-z]+$/.test(address);
  };

  return {
    validateAmount,
    validateAddress,
  };
}
