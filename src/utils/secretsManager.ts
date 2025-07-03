interface SecretValue {
  value: string;
  version?: string;
  lastRotated?: Date;
}

export class SecretsManager {
  private static instance: SecretsManager;
  private cache: Map<string, { value: string; expiry: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000;

  private constructor() {}

  static getInstance(): SecretsManager {
    if (!SecretsManager.instance) {
      SecretsManager.instance = new SecretsManager();
    }
    return SecretsManager.instance;
  }

  async getSecret(secretName: string): Promise<SecretValue> {
    const cached = this.cache.get(secretName);
    if (cached && cached.expiry > Date.now()) {
      return { value: cached.value };
    }
    const value = process.env[secretName];
    if (!value) {
      throw new Error(`Variável de ambiente '${secretName}' não encontrada.`);
    }
    this.cache.set(secretName, {
      value,
      expiry: Date.now() + this.CACHE_TTL,
    });
    return { value };
  }
  clearCache(): void {
    this.cache.clear();
  }
}

export const secretsManager = SecretsManager.getInstance();

export async function getPrivateKey(): Promise<string> {
  return (await secretsManager.getSecret("PRIVATE_KEY")).value;
}

export async function getAdminSecret(): Promise<string> {
  return (await secretsManager.getSecret("ADMIN_SECRET")).value;
}

export async function getSupabaseKey(): Promise<string> {
  return (await secretsManager.getSecret("SUPABASE_KEY")).value;
}

export async function getAPISecretKey(): Promise<string> {
  return (await secretsManager.getSecret("API_SECRET_KEY")).value;
}
