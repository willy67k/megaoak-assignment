import { toast } from "vue3-toastify";

export type ErrorLevel = "silent" | "toast" | "throw";

export interface HandleErrorOptions {
  level?: ErrorLevel;
  message?: string;
  error?: unknown;
}

export function useErrorHandle() {
  const handleError = (options: HandleErrorOptions) => {
    const { level = "toast", message = "An error occurred", error } = options;

    if (import.meta.env.DEV && error) {
      console.error(message, error);
    }

    switch (level) {
      case "toast":
        toast.error(message);
        break;
      case "silent":
        break;
      case "throw":
        throw error || new Error(message);
    }
  };

  return { handleError };
}
