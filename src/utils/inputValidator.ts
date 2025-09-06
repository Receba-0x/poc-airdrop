import { PublicKey } from "@solana/web3.js";

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: any;
}

export class InputValidator {
  static validateSolanaAddress(address: string): ValidationResult {
    if (!address || typeof address !== "string") {
      return { valid: false, error: "Endereço Solana é obrigatório" };
    }

    try {
      new PublicKey(address);
      return { valid: true, sanitized: address.trim() };
    } catch (error) {
      return { valid: false, error: "Endereço Solana inválido" };
    }
  }

  static validateTransactionHash(hash: string): ValidationResult {
    if (!hash || typeof hash !== "string") {
      return { valid: false, error: "Hash da transação é obrigatório" };
    }

    const sanitized = hash.trim();

    // Solana transaction signatures are base58 encoded and typically 87-88 characters
    if (sanitized.length < 80 || sanitized.length > 90) {
      return { valid: false, error: "Hash da transação Solana inválido" };
    }

    // Basic base58 character check
    if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(sanitized)) {
      return {
        valid: false,
        error: "Hash da transação Solana contém caracteres inválidos",
      };
    }

    return { valid: true, sanitized };
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

  static validateBoxId(boxId: any): ValidationResult {
    const numResult = this.validateNumericValue(boxId, "boxId", {
      integer: true,
    });
    if (!numResult.valid) return numResult;
    return { valid: true, sanitized: numResult.sanitized };
  }

  static validateClientSeed(seed: any): ValidationResult {
    return this.validateString(seed, "clientSeed", {
      minLength: 8,
      maxLength: 128,
      pattern: /^[a-zA-Z0-9\-_\.]+$/,
    });
  }

  static validateLootboxProcessingData(data: any): ValidationResult {
    const requiredFields = [
      "wallet",
      "timestamp",
      "txHash",
      "clientSeed",
      "solFeeTransactionHash",
      "solPrice",
      "boxId",
      "amount",
      "prizeData",
    ];
    const errors: string[] = [];

    if (!data || typeof data !== "object") {
      return {
        valid: false,
        error: "Dados de processamento devem ser um objeto",
      };
    }

    for (const field of requiredFields) {
      if (!(field in data)) {
        errors.push(`Campo ${field} é obrigatório`);
      }
    }

    if (errors.length > 0) {
      return {
        valid: false,
        error: `Campos obrigatórios faltando: ${errors.join(", ")}`,
      };
    }

    // Validações específicas
    if (typeof data.timestamp !== "number" || data.timestamp <= 0) {
      return { valid: false, error: "Timestamp deve ser um número válido" };
    }

    if (typeof data.solPrice !== "number" || data.solPrice <= 0) {
      return { valid: false, error: "Preço do SOL deve ser um número válido" };
    }

    if (typeof data.boxId !== "number" || data.boxId < 0) {
      return { valid: false, error: "BoxId deve ser um número válido" };
    }

    if (typeof data.amount !== "number" || data.amount <= 0) {
      return { valid: false, error: "Amount deve ser um número válido" };
    }

    return {
      valid: true,
      sanitized: {
        wallet: data.wallet,
        timestamp: data.timestamp,
        txHash: data.txHash,
        clientSeed: data.clientSeed,
        solFeeTransactionHash: data.solFeeTransactionHash,
        solPrice: data.solPrice,
        boxId: data.boxId,
        amount: data.amount,
        prizeData: data.prizeData,
      },
    };
  }

  static validatePurchaseData(data: any): ValidationResult {
    const requiredFields = ["boxId", "wallet", "clientSeed"];
    const errors: string[] = [];

    console.log("🔍 [DEBUG] validatePurchaseData called with:", {
      data: JSON.stringify(data, null, 2),
      dataType: typeof data,
      isObject: data && typeof data === "object",
      keys: data ? Object.keys(data) : [],
    });

    if (!data || typeof data !== "object") {
      console.error("❌ [DEBUG] Data is not an object:", {
        data,
        type: typeof data,
      });
      return { valid: false, error: "Dados de compra devem ser um objeto" };
    }

    for (const field of requiredFields) {
      if (!(field in data)) {
        console.error(`❌ [DEBUG] Required field missing: ${field}`);
        errors.push(`Campo ${field} é obrigatório`);
      } else {
        console.log(
          `✅ [DEBUG] Required field present: ${field} = ${data[field]}`
        );
      }
    }

    if (errors.length > 0) {
      console.error("❌ [DEBUG] Missing required fields:", errors);
      return { valid: false, error: errors.join(", ") };
    }

    console.log("🔍 [DEBUG] Validating wallet address:", data.wallet);
    const walletValidation = this.validateSolanaAddress(data.wallet);
    if (!walletValidation.valid) {
      console.error(
        "❌ [DEBUG] Wallet validation failed:",
        walletValidation.error
      );
      errors.push(`Wallet: ${walletValidation.error}`);
    } else {
      console.log("✅ [DEBUG] Wallet validation passed");
    }

    console.log("🔍 [DEBUG] Validating boxId:", data.boxId);
    const boxIdValidation = this.validateBoxId(data.boxId);
    if (!boxIdValidation.valid) {
      console.error(
        "❌ [DEBUG] BoxId validation failed:",
        boxIdValidation.error
      );
      errors.push(`BoxId: ${boxIdValidation.error}`);
    } else {
      console.log("✅ [DEBUG] BoxId validation passed");
    }

    console.log("🔍 [DEBUG] Validating clientSeed:", data.clientSeed);
    const seedValidation = this.validateClientSeed(data.clientSeed);
    if (!seedValidation.valid) {
      console.error(
        "❌ [DEBUG] ClientSeed validation failed:",
        seedValidation.error
      );
      errors.push(`ClientSeed: ${seedValidation.error}`);
    } else {
      console.log("✅ [DEBUG] ClientSeed validation passed");
    }

    // Validate optional SOL fields
    let solFeeTransactionHash, solPrice;
    if (data.solFeeTransactionHash) {
      console.log(
        "🔍 [DEBUG] Validating solFeeTransactionHash:",
        data.solFeeTransactionHash
      );
      const solFeeValidation = this.validateTransactionHash(
        data.solFeeTransactionHash
      );
      if (!solFeeValidation.valid) {
        console.error(
          "❌ [DEBUG] SOL fee transaction hash validation failed:",
          solFeeValidation.error
        );
        errors.push(`SOL Fee Transaction Hash: ${solFeeValidation.error}`);
      } else {
        console.log("✅ [DEBUG] SOL fee transaction hash validation passed");
        solFeeTransactionHash = solFeeValidation.sanitized;
      }
    }

    if (data.solPrice) {
      console.log("🔍 [DEBUG] Validating solPrice:", data.solPrice);
      const solPriceValidation = this.validateNumericValue(
        data.solPrice,
        "solPrice",
        { min: 0 }
      );
      if (!solPriceValidation.valid) {
        console.error(
          "❌ [DEBUG] SOL price validation failed:",
          solPriceValidation.error
        );
        errors.push(`SOL Price: ${solPriceValidation.error}`);
      } else {
        console.log("✅ [DEBUG] SOL price validation passed");
        solPrice = solPriceValidation.sanitized;
      }
    }

    if (errors.length > 0) {
      console.error("❌ [DEBUG] Validation errors:", errors);
      return { valid: false, error: errors.join(", ") };
    }

    console.log("✅ [DEBUG] All validations passed, returning sanitized data");
    return {
      valid: true,
      sanitized: {
        wallet: walletValidation.sanitized,
        boxId: boxIdValidation.sanitized,
        clientSeed: seedValidation.sanitized,
        solFeeTransactionHash,
        solPrice,
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
      "clientSeed",
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

    const walletValidation = this.validateSolanaAddress(data.wallet);
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

    const clientSeedValidation = this.validateClientSeed(data.clientSeed);
    if (!clientSeedValidation.valid) {
      errors.push(`ClientSeed: ${clientSeedValidation.error}`);
    }

    // Validate optional SOL fields
    let solFeeTransactionHash, solPrice, boxId;
    if (data.solFeeTransactionHash) {
      const solFeeValidation = this.validateTransactionHash(
        data.solFeeTransactionHash
      );
      if (!solFeeValidation.valid) {
        errors.push(`SOL Fee Transaction Hash: ${solFeeValidation.error}`);
      } else {
        solFeeTransactionHash = solFeeValidation.sanitized;
      }
    }

    if (data.solPrice) {
      const solPriceValidation = this.validateNumericValue(
        data.solPrice,
        "solPrice",
        { min: 0 }
      );
      if (!solPriceValidation.valid) {
        errors.push(`SOL Price: ${solPriceValidation.error}`);
      } else {
        solPrice = solPriceValidation.sanitized;
      }
    }

    if (data.boxId) {
      const boxIdValidation = this.validateBoxId(data.boxId);
      if (!boxIdValidation.valid) {
        errors.push(`BoxId: ${boxIdValidation.error}`);
      } else {
        boxId = boxIdValidation.sanitized;
      }
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
        clientSeed: clientSeedValidation.sanitized,
        solFeeTransactionHash,
        solPrice,
        boxId,
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
