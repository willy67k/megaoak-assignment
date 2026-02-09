import { onMounted } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import { jwtDecode } from "jwt-decode";
import { useErrorHandle } from "./useErrorHandle";
import type { JwtGooglePayload } from "@/types";
import { ERROR_MESSAGES } from "@/constants/errorMessages";

export function useGoogleAuth() {
  const authStore = useAuthStore();
  const { handleError } = useErrorHandle();

  function handleCredentialResponse(response: any) {
    try {
      const payload: JwtGooglePayload = jwtDecode(response.credential);

      if (!payload) {
        handleError({ level: "toast", message: ERROR_MESSAGES.AUTH.GOOGLE_DECODE_FAILED });
        return;
      }

      authStore.setGoogleUser({
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
      });
    } catch (error) {
      handleError({
        level: "toast",
        message: ERROR_MESSAGES.AUTH.GOOGLE_LOGIN_FAILED,
        error,
      });
    }
  }

  function initGoogle() {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(document.getElementById("google-btn"), { theme: "outline", size: "large" });

    authStore.googleReady = true;
  }

  onMounted(() => {
    const script = document.createElement("script");
    script.src = import.meta.env.VITE_GOOGLE_SOURCE;
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    script.onerror = (error) => {
      handleError({
        level: "toast",
        message: ERROR_MESSAGES.AUTH.GOOGLE_SDK_LOAD_FAILED,
        error,
      });
    };
    document.head.appendChild(script);
  });

  return { initGoogle };
}
