export type ErrorLevel = "silent" | "toast" | "throw";

export interface HandleErrorOptions {
  level?: ErrorLevel;
  message?: string;
  error?: unknown;
}
