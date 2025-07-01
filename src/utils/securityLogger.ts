/**
 * Sistema de logging focado em segurança
 */

export enum SecurityEventType {
  AUTHENTICATION_SUCCESS = "auth_success",
  AUTHENTICATION_FAILURE = "auth_failure",
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
  INVALID_INPUT = "invalid_input",
  REPLAY_ATTACK = "replay_attack",
  SIGNATURE_VERIFICATION_FAILED = "signature_verification_failed",
  TRANSACTION_VALIDATION_FAILED = "transaction_validation_failed",
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  PRIVATE_KEY_ACCESS = "private_key_access",
  ADMIN_ACTION = "admin_action",
  CONTRACT_INTERACTION = "contract_interaction",
  CSRF_ATTEMPT = "csrf_attempt",
}

export interface SecurityEvent {
  type: SecurityEventType;
  timestamp: number;
  ip: string;
  userAgent?: string;
  wallet?: string;
  details: Record<string, any>;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
}

export class SecurityLogger {
  private static instance: SecurityLogger;
  private events: SecurityEvent[] = [];
  private maxEvents = 10000; // Manter últimos 10k eventos
  private alertThresholds: Partial<
    Record<SecurityEventType, { count: number; windowMs: number }>
  > = {
    [SecurityEventType.AUTHENTICATION_FAILURE]: {
      count: 5,
      windowMs: 5 * 60 * 1000,
    }, // 5 falhas em 5 min
    [SecurityEventType.RATE_LIMIT_EXCEEDED]: {
      count: 3,
      windowMs: 10 * 60 * 1000,
    }, // 3 rate limits em 10 min
    [SecurityEventType.REPLAY_ATTACK]: { count: 1, windowMs: 60 * 1000 }, // 1 replay attack em 1 min
    [SecurityEventType.SIGNATURE_VERIFICATION_FAILED]: {
      count: 3,
      windowMs: 5 * 60 * 1000,
    },
  };

  private constructor() {
    // Limpar eventos antigos a cada hora
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  private cleanup() {
    // Manter apenas eventos das últimas 24 horas
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    this.events = this.events.filter((event) => event.timestamp > cutoff);

    // Limitar número total de eventos
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  logEvent(
    type: SecurityEventType,
    message: string,
    details: Record<string, any> = {},
    severity: "low" | "medium" | "high" | "critical" = "medium",
    req?: any
  ) {
    const event: SecurityEvent = {
      type,
      timestamp: Date.now(),
      ip: this.extractIP(req),
      userAgent:
        req?.headers?.get?.("user-agent") || req?.headers?.["user-agent"],
      wallet: details.wallet,
      details,
      severity,
      message,
    };

    this.events.push(event);

    const logMethod =
      severity === "critical"
        ? console.error
        : severity === "high"
        ? console.warn
        : severity === "medium"
        ? console.info
        : console.log;

    logMethod(`[SECURITY ${severity.toUpperCase()}] ${type}: ${message}`, {
      ip: event.ip,
      details: event.details,
    });

    this.checkForAlerts(type, event.ip);
  }

  private extractIP(req: any): string {
    if (!req) return "unknown";

    return (
      req.headers?.get?.("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers?.get?.("x-real-ip") ||
      req.headers?.["x-forwarded-for"]?.split(",")[0].trim() ||
      req.headers?.["x-real-ip"] ||
      req.ip ||
      "unknown"
    );
  }

  private checkForAlerts(type: SecurityEventType, ip: string) {
    const threshold = this.alertThresholds[type];
    if (!threshold) return;

    const now = Date.now();
    const windowStart = now - threshold.windowMs;

    const recentEvents = this.events.filter(
      (event) =>
        event.type === type && event.ip === ip && event.timestamp >= windowStart
    );

    if (recentEvents.length >= threshold.count) {
      this.logEvent(
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        `Atividade suspeita detectada: ${
          threshold.count
        } eventos ${type} do IP ${ip} em ${threshold.windowMs / 1000} segundos`,
        { originalEventType: type, eventCount: recentEvents.length, ip },
        "critical"
      );
    }
  }

  // Métodos específicos para diferentes tipos de eventos
  logAuthSuccess(wallet: string, req: any) {
    this.logEvent(
      SecurityEventType.AUTHENTICATION_SUCCESS,
      `Login administrativo bem-sucedido`,
      { wallet },
      "low",
      req
    );
  }

  logAuthFailure(reason: string, req: any) {
    this.logEvent(
      SecurityEventType.AUTHENTICATION_FAILURE,
      `Falha na autenticação: ${reason}`,
      { reason },
      "medium",
      req
    );
  }

  logRateLimitExceeded(endpoint: string, req: any) {
    this.logEvent(
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      `Rate limit excedido no endpoint ${endpoint}`,
      { endpoint },
      "medium",
      req
    );
  }

  logInvalidInput(field: string, value: string, req: any) {
    this.logEvent(
      SecurityEventType.INVALID_INPUT,
      `Input inválido detectado no campo ${field}`,
      { field, value: value?.substring(0, 100) }, // Limitar tamanho do log
      "low",
      req
    );
  }

  logReplayAttack(wallet: string, timestamp: number, req: any) {
    this.logEvent(
      SecurityEventType.REPLAY_ATTACK,
      `Tentativa de replay attack detectada`,
      { wallet, timestamp },
      "high",
      req
    );
  }

  logSignatureVerificationFailed(wallet: string, reason: string, req: any) {
    this.logEvent(
      SecurityEventType.SIGNATURE_VERIFICATION_FAILED,
      `Falha na verificação de assinatura: ${reason}`,
      { wallet, reason },
      "high",
      req
    );
  }

  logTransactionValidationFailed(txHash: string, reason: string, req: any) {
    this.logEvent(
      SecurityEventType.TRANSACTION_VALIDATION_FAILED,
      `Falha na validação de transação: ${reason}`,
      { txHash, reason },
      "high",
      req
    );
  }

  logPrivateKeyAccess(operation: string, req: any) {
    this.logEvent(
      SecurityEventType.PRIVATE_KEY_ACCESS,
      `Acesso à chave privada para operação: ${operation}`,
      { operation },
      "critical",
      req
    );
  }

  logAdminAction(action: string, details: Record<string, any>, req: any) {
    this.logEvent(
      SecurityEventType.ADMIN_ACTION,
      `Ação administrativa executada: ${action}`,
      { action, ...details },
      "medium",
      req
    );
  }

  logContractInteraction(contractAddress: string, method: string, req: any) {
    this.logEvent(
      SecurityEventType.CONTRACT_INTERACTION,
      `Interação com contrato: ${method} em ${contractAddress}`,
      { contractAddress, method },
      "medium",
      req
    );
  }

  logCSRFAttempt(origin: string, referer: string, req: any) {
    this.logEvent(
      SecurityEventType.CSRF_ATTEMPT,
      `Possível tentativa de CSRF detectada`,
      { origin, referer },
      "high",
      req
    );
  }

  // Métodos para análise de eventos
  getEventsByType(type: SecurityEventType, limit = 100): SecurityEvent[] {
    return this.events
      .filter((event) => event.type === type)
      .slice(-limit)
      .reverse();
  }

  getEventsByIP(ip: string, limit = 100): SecurityEvent[] {
    return this.events
      .filter((event) => event.ip === ip)
      .slice(-limit)
      .reverse();
  }

  getEventsBySeverity(
    severity: "low" | "medium" | "high" | "critical",
    limit = 100
  ): SecurityEvent[] {
    return this.events
      .filter((event) => event.severity === severity)
      .slice(-limit)
      .reverse();
  }

  getRecentEvents(minutes = 60, limit = 100): SecurityEvent[] {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.events
      .filter((event) => event.timestamp >= cutoff)
      .slice(-limit)
      .reverse();
  }

  // Estatísticas de segurança
  getSecurityStats() {
    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1000;
    const last1h = now - 60 * 60 * 1000;

    const events24h = this.events.filter((e) => e.timestamp >= last24h);
    const events1h = this.events.filter((e) => e.timestamp >= last1h);

    const statsByType = Object.values(SecurityEventType).reduce((acc, type) => {
      acc[type] = {
        last24h: events24h.filter((e) => e.type === type).length,
        last1h: events1h.filter((e) => e.type === type).length,
      };
      return acc;
    }, {} as Record<string, { last24h: number; last1h: number }>);

    const uniqueIPs24h = new Set(events24h.map((e) => e.ip)).size;
    const criticalEvents24h = events24h.filter(
      (e) => e.severity === "critical"
    ).length;

    return {
      totalEvents24h: events24h.length,
      totalEvents1h: events1h.length,
      uniqueIPs24h,
      criticalEvents24h,
      statsByType,
    };
  }
}

// Instância singleton
export const securityLogger = SecurityLogger.getInstance();
