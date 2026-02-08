import { onMounted } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import { jwtDecode } from "jwt-decode";

declare global {
  interface Window {
    google: any;
  }
}

export interface JwtGooglePayload {
  sub: string;
  name: string;
  email: string;
  picture: string;
}

export function useGoogleAuth() {
  const authStore = useAuthStore();

  function handleCredentialResponse(response: any) {
    const payload: JwtGooglePayload = jwtDecode(response.credential);

    if (!payload) return;

    authStore.setGoogleUser({
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      avatar: payload.picture,
    });
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
    document.head.appendChild(script);
  });

  return { initGoogle };
}
