/**
 * Utilitário para validação de timestamps e prevenção de replay attacks
 */

export interface TimestampValidationConfig {
  maxAgeSeconds: number; // Idade máxima permitida em segundos
  futureToleranceSeconds: number; // Tolerância para timestamps futuros
}

export class TimestampValidator {
  private usedTimestamps = new Set<string>();
  private config: TimestampValidationConfig;

  constructor(config: TimestampValidationConfig = {
    maxAgeSeconds: 300, // 5 minutos
    futureToleranceSeconds: 60 // 1 minuto
  }) {
    this.config = config;
    
    // Limpar timestamps antigos a cada 10 minutos
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  private cleanup() {
    const now = Math.floor(Date.now() / 1000);
    const cutoff = now - this.config.maxAgeSeconds;
    
    // Remover timestamps muito antigos
    for (const timestamp of this.usedTimestamps) {
      if (parseInt(timestamp.split(':')[1]) < cutoff) {
        this.usedTimestamps.delete(timestamp);
      }
    }
  }

  /**
   * Valida um timestamp e previne replay attacks
   * @param allowReuse Se true, permite que o mesmo timestamp seja usado múltiplas vezes
   */
  validateTimestamp(
    timestamp: number, 
    wallet: string, 
    amount: string,
    allowReuse: boolean = false
  ): { valid: boolean; error?: string } {
    const now = Math.floor(Date.now() / 1000);
    const key = `${wallet}:${timestamp}:${amount}`;
    
    console.log("🔍 Timestamp validation:", {
      timestamp,
      now,
      wallet,
      amount,
      key,
      allowReuse,
      usedTimestamps: Array.from(this.usedTimestamps).slice(-5), // Show last 5
      isUsed: this.usedTimestamps.has(key)
    });
    
    // Verificar se timestamp não é muito antigo
    if (timestamp < now - this.config.maxAgeSeconds) {
      return {
        valid: false,
        error: `Timestamp muito antigo. Máximo ${this.config.maxAgeSeconds} segundos.`
      };
    }
    
    // Verificar se timestamp não é muito futuro
    if (timestamp > now + this.config.futureToleranceSeconds) {
      return {
        valid: false,
        error: `Timestamp muito futuro. Máximo ${this.config.futureToleranceSeconds} segundos à frente.`
      };
    }
    
    if (this.usedTimestamps.has(key) && !allowReuse) {
      console.warn("⚠️ Replay attack detected:", { key, timestamp, wallet });
      
      // For development, be more tolerant
      if (process.env.NODE_ENV === "development") {
        console.log("🔧 Development mode: allowing replay attack for debugging");
        return { valid: true };
      }
      
      return {
        valid: false,
        error: 'Replay attack detectado. Esta transação já foi processada.'
      };
    }
    
    // Marcar timestamp como usado apenas se não for reutilização permitida
    if (!allowReuse) {
      this.usedTimestamps.add(key);
      console.log("✅ Timestamp validated and added to used set");
    } else {
      console.log("✅ Timestamp validated (reuse allowed)");
    }
    
    return { valid: true };
  }

  /**
   * Verifica se um timestamp está dentro da janela válida (sem marcar como usado)
   */
  isTimestampValid(timestamp: number): boolean {
    const now = Math.floor(Date.now() / 1000);
    return timestamp >= now - this.config.maxAgeSeconds && 
           timestamp <= now + this.config.futureToleranceSeconds;
  }

  /**
   * Gera um timestamp válido atual
   */
  generateValidTimestamp(): number {
    return Math.floor(Date.now() / 1000);
  }
}

// Instância global do validador
export const timestampValidator = new TimestampValidator({
  maxAgeSeconds: 300, // 5 minutos
  futureToleranceSeconds: 30 // 30 segundos
});

// Validador específico para transações de compra
export const purchaseTimestampValidator = new TimestampValidator({
  maxAgeSeconds: 600, // 10 minutos (mais tempo para transações blockchain)
  futureToleranceSeconds: 60 // 1 minuto
}); 