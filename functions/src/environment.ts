/* eslint-disable import/namespace */
import * as path from "path";

import * as zod from "zod";

const envSchema = zod.object({
  PORT: zod.string().optional().transform((val) => (val ? parseInt(val, 10) : 3000)),
  SERVICE_ACCOUNT_EMAIL: zod.email(),
  JWT_ISSUER: zod.string().min(1),
  JWT_AUDIENCE: zod.string().min(1),
  JWT_SIGNING_KEY: zod.string().min(1),
  JWT_ACCESS_TOKEN_MINUTES: zod.string().transform((val) => parseInt(val, 10)),
  JWT_REFRESH_TOKEN_DAYS: zod.string().transform((val) => parseInt(val, 10)),
  CORS_ORIGIN: zod.string().optional().default("*"),
});

export default class Environment {
  private readonly _env: zod.infer<typeof envSchema>;
  private static _instance: Environment;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {
    process.loadEnvFile(path.resolve(__dirname, `${this.NODE_ENV}.env`));
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      console.error("Invalid environment variables:", parsed.error.issues);
      throw new Error("Invalid environment variables");
    }
    this._env = parsed.data;
  }

  static getInstance(): Environment {
    if (!Environment._instance) {
      Environment._instance = new Environment();
    }
    return Environment._instance;
  }

  get NODE_ENV(): string {
    return process.env.NODE_ENV || "development";
  }

  get PORT(): number {
    return this._env.PORT;
  }

  get SERVICE_ACCOUNT_EMAIL(): string {
    return this._env.SERVICE_ACCOUNT_EMAIL;
  }

  get JWT_ISSUER(): string {
    return this._env.JWT_ISSUER;
  }

  get JWT_AUDIENCE(): string {
    return this._env.JWT_AUDIENCE;
  }

  get JWT_SIGNING_KEY(): string {
    // Replace escaped newlines with actual newlines
    return this._env.JWT_SIGNING_KEY.replace(/\\n/g, "\n");
  }

  get JWT_ACCESS_TOKEN_MINUTES(): number {
    return this._env.JWT_ACCESS_TOKEN_MINUTES;
  }

  get JWT_REFRESH_TOKEN_DAYS(): number {
    return this._env.JWT_REFRESH_TOKEN_DAYS;
  }

  get CORS_ORIGIN(): string {
    return this._env.CORS_ORIGIN;
  }
}
