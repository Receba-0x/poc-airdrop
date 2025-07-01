import { ethers } from "ethers";

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: any;
}

export class InputValidator {
  static validateEthereumAddress(address: string): ValidationResult {
    if (!address || typeof address !== "string") {
      return { valid: false, error: "Endereço é obrigatório" };
    }

    try {
      const sanitized = ethers.getAddress(address.toLowerCase());
      return { valid: true, sanitized };
    } catch (error) {
      return { valid: false, error: "Endereço Ethereum inválido" };
    }
  }

  static validateTransactionHash(hash: string): ValidationResult {
    if (!hash || typeof hash !== "string") {
      return { valid: false, error: "Hash da transação é obrigatório" };
    }

    // Verificar formato hexadecimal e comprimento
    const hexRegex = /^0x[a-fA-F0-9]{64}$/;
    if (!hexRegex.test(hash)) {
      return {
        valid: false,
        error:
          "Hash da transação deve ter formato 0x seguido de 64 caracteres hexadecimais",
      };
    }

    return { valid: true, sanitized: hash.toLowerCase() };
  }

  static validateNumericValue(
    value: any,
    fieldName: string,
    options: { min?: number; max?: number; integer?: boolean } = {}
  ): ValidationResult {
    if (value === null || value === undefined || value === "") {
      return { valid: false, error: `${fieldName} é obrigatório` };
    }

    const numValue = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(numValue) || !isFinite(numValue)) {
      return { valid: false, error: `${fieldName} deve ser um número válido` };
    }

    if (options.integer && !Number.isInteger(numValue)) {
      return { valid: false, error: `${fieldName} deve ser um número inteiro` };
    }

    if (options.min !== undefined && numValue < options.min) {
      return {
        valid: false,
        error: `${fieldName} deve ser maior ou igual a ${options.min}`,
      };
    }

    if (options.max !== undefined && numValue > options.max) {
      return {
        valid: false,
        error: `${fieldName} deve ser menor ou igual a ${options.max}`,
      };
    }

    return { valid: true, sanitized: numValue };
  }

  static validateString(
    value: any,
    fieldName: string,
    options: {
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
      allowEmpty?: boolean;
    } = {}
  ): ValidationResult {
    if (value === null || value === undefined) {
      return { valid: false, error: `${fieldName} é obrigatório` };
    }

    if (typeof value !== "string") {
      return { valid: false, error: `${fieldName} deve ser uma string` };
    }

    const sanitized = value
      .replace(/[<>]/g, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .trim();

    if (!options.allowEmpty && sanitized.length === 0) {
      return { valid: false, error: `${fieldName} não pode estar vazio` };
    }

    if (options.minLength && sanitized.length < options.minLength) {
      return {
        valid: false,
        error: `${fieldName} deve ter pelo menos ${options.minLength} caracteres`,
      };
    }

    if (options.maxLength && sanitized.length > options.maxLength) {
      return {
        valid: false,
        error: `${fieldName} deve ter no máximo ${options.maxLength} caracteres`,
      };
    }

    if (options.pattern && !options.pattern.test(sanitized)) {
      return {
        valid: false,
        error: `${fieldName} não atende ao formato exigido`,
      };
    }

    return { valid: true, sanitized };
  }

  static validateBoxType(boxType: any): ValidationResult {
    const numResult = this.validateNumericValue(boxType, "boxType", {
      min: 1,
      max: 2,
      integer: true,
    });

    if (!numResult.valid) {
      return numResult;
    }

    return { valid: true, sanitized: numResult.sanitized };
  }

  static validateClientSeed(seed: any): ValidationResult {
    return this.validateString(seed, "clientSeed", {
      minLength: 8,
      maxLength: 128,
      pattern: /^[a-zA-Z0-9\-_\.]+$/,
    });
  }

  static validatePurchaseData(data: any): ValidationResult {
    const requiredFields = ["boxType", "wallet", "clientSeed"];
    const errors: string[] = [];

    if (!data || typeof data !== "object") {
      return { valid: false, error: "Dados de compra devem ser um objeto" };
    }

    for (const field of requiredFields) {
      if (!(field in data)) {
        errors.push(`Campo ${field} é obrigatório`);
      }
    }

    if (errors.length > 0) {
      return { valid: false, error: errors.join(", ") };
    }

    const walletValidation = this.validateEthereumAddress(data.wallet);
    if (!walletValidation.valid) {
      errors.push(`Wallet: ${walletValidation.error}`);
    }

    const boxTypeValidation = this.validateBoxType(data.boxType);
    if (!boxTypeValidation.valid) {
      errors.push(`BoxType: ${boxTypeValidation.error}`);
    }

    const seedValidation = this.validateClientSeed(data.clientSeed);
    if (!seedValidation.valid) {
      errors.push(`ClientSeed: ${seedValidation.error}`);
    }

    if (errors.length > 0) {
      return { valid: false, error: errors.join(", ") };
    }

    return {
      valid: true,
      sanitized: {
        wallet: walletValidation.sanitized,
        boxType: boxTypeValidation.sanitized,
        clientSeed: seedValidation.sanitized,
        bnbFeeTransactionHash: data.bnbFeeTransactionHash
          ? this.validateTransactionHash(data.bnbFeeTransactionHash).sanitized
          : undefined,
        bnbPrice: data.bnbPrice
          ? this.validateNumericValue(data.bnbPrice, "bnbPrice", { min: 0 })
              .sanitized
          : undefined,
      },
    };
  }

  static validateBurnTransactionData(data: any): ValidationResult {
    const requiredFields = [
      "wallet",
      "amount",
      "timestamp",
      "txHash",
      "signature",
    ];
    const errors: string[] = [];

    if (!data || typeof data !== "object") {
      return { valid: false, error: "Dados de transação devem ser um objeto" };
    }

    for (const field of requiredFields) {
      if (!(field in data)) {
        errors.push(`Campo ${field} é obrigatório`);
      }
    }

    if (errors.length > 0) {
      return { valid: false, error: errors.join(", ") };
    }

    const walletValidation = this.validateEthereumAddress(data.wallet);
    if (!walletValidation.valid) {
      errors.push(`Wallet: ${walletValidation.error}`);
    }

    const amountValidation = this.validateString(data.amount, "amount", {
      pattern: /^\d+$/,
    });
    if (!amountValidation.valid) {
      errors.push(`Amount: ${amountValidation.error}`);
    }

    const timestampValidation = this.validateNumericValue(
      data.timestamp,
      "timestamp",
      {
        min: 0,
        integer: true,
      }
    );
    if (!timestampValidation.valid) {
      errors.push(`Timestamp: ${timestampValidation.error}`);
    }

    const txHashValidation = this.validateTransactionHash(data.txHash);
    if (!txHashValidation.valid) {
      errors.push(`TxHash: ${txHashValidation.error}`);
    }

    if (errors.length > 0) {
      return { valid: false, error: errors.join(", ") };
    }

    return {
      valid: true,
      sanitized: {
        wallet: walletValidation.sanitized,
        amount: amountValidation.sanitized,
        timestamp: timestampValidation.sanitized,
        txHash: txHashValidation.sanitized,
        signature: data.signature,
      },
    };
  }
}

export function validateRequest<T>(
  validator: (data: any) => ValidationResult,
  req: any
): Promise<T> {
  return new Promise((resolve, reject) => {
    const validation = validator(req);
    if (!validation.valid) {
      reject(new Error(validation.error));
    } else {
      resolve(validation.sanitized as T);
    }
  });
}
